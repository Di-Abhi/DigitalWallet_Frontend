import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, ArrowDownLeft, Download, RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react';
import { walletApi } from '../../core/api/services';
import { Modal, StatusBadge, LoadingPage, EmptyState } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useNotifications } from '../../store/NotificationContext';
import { useAuth } from '../../store/AuthContext';

// ─── Razorpay key ─────────────────────────────────────────────────────────────
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SXNZeesPumUKeY';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(a) { return `₹${Number(a || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`; }
function fmtDate(d) { return d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }

// Dynamically load the Razorpay checkout.js script once
function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Already loaded
    if (window.Razorpay) return resolve(true);

    const existing = document.getElementById('razorpay-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Payment status states ────────────────────────────────────────────────────
// idle → loading (creating order) → paying (rzp modal open) → verifying → success | failed

export default function WalletPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [balance, setBalance] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Add money modal state
  const [addModal, setAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [payStatus, setPayStatus] = useState('idle'); // idle | creatingOrder | paying | verifying | success | failed
  const [lastPayment, setLastPayment] = useState(null); // { paymentId, orderId, signature }

  // Withdraw modal state
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Statement download
  const [stmtFrom, setStmtFrom] = useState('');
  const [stmtTo, setStmtTo] = useState('');

  // ─── Load data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [bRes, lRes] = await Promise.allSettled([
        walletApi.balance(),
        walletApi.ledger(page, 15),
      ]);
      if (bRes.status === 'fulfilled') setBalance(bRes.value.data.data);
      if (lRes.status === 'fulfilled') {
        setLedger(lRes.value.data.content || []);
        setTotalPages(lRes.value.data.totalPages || 1);
      }
    } catch { toast.error('Failed to load wallet data'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Reset add money modal ──────────────────────────────────────────────────
  const resetAddModal = () => {
    setAddModal(false);
    setAmount('');
    setPayStatus('idle');
    setLastPayment(null);
  };

  // ─── RAZORPAY FLOW ──────────────────────────────────────────────────────────
  // Step 1: User clicks "Pay" → create order on backend → open Razorpay modal
  // Step 2: Razorpay calls handler with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
  // Step 3: Send those 3 values to backend /api/payment/verify → backend credits wallet
  // Step 4: Show success, refresh balance

  const handleAddMoney = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) return toast.error('Enter a valid amount (min ₹1)');

    // Step 1 — load Razorpay SDK
    setPayStatus('creatingOrder');
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      toast.error('Failed to load Razorpay. Check your internet connection.');
      setPayStatus('idle');
      return;
    }

    // Step 2 — create order on backend
    let orderData;
    try {
      const res = await walletApi.createOrder(numAmount);
      // Backend returns the Razorpay order object directly
      // Expected fields: id (order_id), amount, currency
      orderData = res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment order');
      setPayStatus('idle');
      return;
    }

    // Step 3 — open Razorpay checkout
    setPayStatus('paying');

    const options = {
      key: RAZORPAY_KEY,
      amount: orderData.amount,           // in paise (backend should return this)
      currency: orderData.currency || 'INR',
      name: 'PayVault',
      description: 'Wallet Top-up',
      order_id: orderData.id,             // Razorpay order ID from backend

      // Called by Razorpay on successful payment
      handler: async function (response) {
        // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        setPayStatus('verifying');
        await verifyPayment(response);
      },

      prefill: {
        name: user?.fullName || '',
        email: user?.email || '',
      },

      theme: { color: '#06b6d4' },  // cyan-500 to match app theme

      modal: {
        // Called when user closes the Razorpay modal without paying
        ondismiss: () => {
          if (payStatus === 'paying') {
            setPayStatus('idle');
            toast.info('Payment cancelled');
          }
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (response) => {
      setPayStatus('failed');
      toast.error(`Payment failed: ${response.error.description}`);
      addNotification({
        title: 'Payment Failed',
        message: response.error.description || 'Razorpay payment failed',
        type: 'error',
      });
    });

    rzp.open();
  };

  // Step 4 — verify payment with backend
  const verifyPayment = async (razorpayResponse) => {
    try {
      await walletApi.verifyPayment({
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id:   razorpayResponse.razorpay_order_id,
        razorpay_signature:  razorpayResponse.razorpay_signature,
      });

      // Success!
      setLastPayment({
        paymentId: razorpayResponse.razorpay_payment_id,
        orderId:   razorpayResponse.razorpay_order_id,
        signature: razorpayResponse.razorpay_signature,
      });
      setPayStatus('success');

      toast.success(`₹${amount} added to your wallet!`, 'Top-up Successful');
      addNotification({
        title: 'Wallet Topped Up!',
        message: `${fmt(amount)} added successfully via Razorpay`,
        type: 'success',
      });

      // Refresh balance after a short delay
      setTimeout(() => {
        loadData();
      }, 1000);

    } catch (err) {
      setPayStatus('failed');
      toast.error(err.response?.data?.message || 'Payment verification failed. Contact support.');
      addNotification({
        title: 'Verification Failed',
        message: 'Payment was deducted but wallet credit failed. Our team will resolve this.',
        type: 'error',
      });
    }
  };

  // ─── Withdraw ───────────────────────────────────────────────────────────────
  const handleWithdraw = async () => {
    if (!withdrawAmt || Number(withdrawAmt) < 1) return toast.error('Enter a valid amount');
    setWithdrawLoading(true);
    try {
      await walletApi.withdraw({ amount: Number(withdrawAmt) });
      toast.success(`${fmt(withdrawAmt)} withdrawn successfully`);
      addNotification({ title: 'Withdrawal Successful', message: `${fmt(withdrawAmt)} withdrawn from wallet`, type: 'success' });
      setWithdrawModal(false);
      setWithdrawAmt('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally { setWithdrawLoading(false); }
  };

  // ─── Statement download ─────────────────────────────────────────────────────
  const downloadStatement = async () => {
    if (!stmtFrom || !stmtTo) return toast.error('Select date range');
    try {
      const res = await walletApi.downloadStatement(stmtFrom, stmtTo);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${stmtFrom}_${stmtTo}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Statement downloaded');
    } catch { toast.error('Failed to download statement'); }
  };

  if (loading) return <LoadingPage />;

  const quickAmounts = [100, 500, 1000, 2000, 5000];
  const isProcessing = ['creatingOrder', 'paying', 'verifying'].includes(payStatus);

  // ─── Payment status UI inside the modal ─────────────────────────────────────
  const PaymentStatusView = () => {
    if (payStatus === 'creatingOrder') return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="font-semibold">Creating payment order…</p>
        <p className="text-sm text-[var(--text-muted)]">Connecting to Razorpay</p>
      </div>
    );

    if (payStatus === 'verifying') return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="font-semibold">Verifying payment…</p>
        <p className="text-sm text-[var(--text-muted)]">Crediting your wallet</p>
      </div>
    );

    if (payStatus === 'success') return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="w-9 h-9 text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">Payment Successful!</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">{fmt(amount)} added to your wallet</p>
        </div>
        {lastPayment && (
          <div className="w-full space-y-2 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider">Payment ID</span>
              <span className="font-mono font-semibold truncate max-w-44">{lastPayment.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider">Order ID</span>
              <span className="font-mono font-semibold truncate max-w-44">{lastPayment.orderId}</span>
            </div>
          </div>
        )}
        <button className="btn-primary w-full" onClick={resetAddModal}>Done</button>
      </div>
    );

    if (payStatus === 'failed') return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <XCircle className="w-9 h-9 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-red-600 dark:text-red-400">Payment Failed</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Your amount was not deducted. Please try again.</p>
        </div>
        <div className="flex gap-3 w-full">
          <button className="btn-secondary flex-1" onClick={resetAddModal}>Cancel</button>
          <button className="btn-primary flex-1" onClick={() => setPayStatus('idle')}>Try Again</button>
        </div>
      </div>
    );

    // idle — show the amount entry form
    return (
      <div className="space-y-5">
        <div>
          <label className="label">Amount (₹)</label>
          <input
            className="input-field text-2xl font-mono"
            type="number"
            min="1"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMoney()}
            autoFocus
          />
        </div>

        <div>
          <label className="label">Quick Select</label>
          <div className="flex gap-2 flex-wrap">
            {quickAmounts.map((a) => (
              <button
                key={a}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all
                  ${Number(amount) === a
                    ? 'bg-cyan-500 text-white border-cyan-500'
                    : 'border-[var(--border)] hover:border-cyan-500 hover:text-cyan-500'
                  }`}
                onClick={() => setAmount(String(a))}
              >
                ₹{a.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {Number(amount) > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm flex justify-between">
            <span className="text-[var(--text-muted)]">You will be charged</span>
            <span className="font-bold amount">{fmt(amount)}</span>
          </div>
        )}

        <button
          className="btn-primary w-full text-base py-3"
          onClick={handleAddMoney}
          disabled={!amount || Number(amount) < 1}
        >
          Pay {amount ? fmt(amount) : ''} via Razorpay
        </button>

        <p className="text-xs text-center text-[var(--text-muted)]">
          🔒 Secured by Razorpay · UPI · Cards · Net Banking
        </p>
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <button className="btn-ghost p-2" onClick={loadData} title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Balance card */}
      <div className="card p-6 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-900 text-white border-0 relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10"><Wallet className="w-24 h-24" /></div>
        <div className="relative">
          <p className="text-sm opacity-70 mb-1">Available Balance</p>
          <div className="amount text-4xl font-bold mb-1">{fmt(balance?.balance)}</div>
          <p className="text-xs opacity-50">Last updated: {fmtDate(balance?.lastUpdated)}</p>
          <p className="text-xs opacity-50 mt-0.5">Status: {balance?.status || 'Active'}</p>
          <div className="flex gap-3 mt-5 flex-wrap">
            <button
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              onClick={() => setAddModal(true)}
            >
              <Plus className="w-4 h-4" /> Add Money
            </button>
            <button
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              onClick={() => setWithdrawModal(true)}
            >
              <ArrowDownLeft className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Statement download */}
      <div className="card p-5">
        <h2 className="font-bold mb-4 text-sm">Download Statement</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">From</label>
            <input type="date" className="input-field w-auto" value={stmtFrom} onChange={(e) => setStmtFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input-field w-auto" value={stmtTo} onChange={(e) => setStmtTo(e.target.value)} />
          </div>
          <button className="btn-secondary flex items-center gap-2" onClick={downloadStatement}>
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>
      </div>

      {/* Ledger */}
      <div className="card p-6">
        <h2 className="font-bold mb-5">Ledger</h2>
        {ledger.length === 0 ? (
          <EmptyState icon={Wallet} title="No ledger entries yet" desc="Your transaction history will appear here" />
        ) : (
          <div className="space-y-2">
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                  entry.type === 'CREDIT'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                }`}>
                  {entry.type === 'CREDIT' ? '+' : '−'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{entry.description || entry.referenceId || 'Transaction'}</div>
                  <div className="text-xs text-[var(--text-muted)]">{fmtDate(entry.createdAt)}</div>
                </div>
                <div className={`amount font-bold text-sm shrink-0 ${entry.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {entry.type === 'CREDIT' ? '+' : '−'}{fmt(entry.amount)}
                </div>
                <StatusBadge status={entry.type} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <button className="btn-secondary px-3 py-1.5 text-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span className="text-sm text-[var(--text-muted)]">Page {page + 1} of {totalPages}</span>
            <button className="btn-secondary px-3 py-1.5 text-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Add Money Modal ────────────────────────────────────────────────────── */}
      <Modal
        open={addModal}
        onClose={isProcessing ? undefined : resetAddModal}  // prevent closing while payment in progress
        title={
          payStatus === 'success' ? '🎉 Top-up Successful' :
          payStatus === 'failed'  ? '❌ Payment Failed' :
          isProcessing            ? '⏳ Processing Payment' :
          'Add Money'
        }
      >
        <PaymentStatusView />
      </Modal>

      {/* ── Withdraw Modal ─────────────────────────────────────────────────────── */}
      <Modal open={withdrawModal} onClose={() => setWithdrawModal(false)} title="Withdraw Funds">
        <div className="space-y-4">
          <div>
            <label className="label">Amount (₹)</label>
            <input
              className="input-field text-2xl font-mono"
              type="number"
              min="1"
              placeholder="0.00"
              value={withdrawAmt}
              onChange={(e) => setWithdrawAmt(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Available balance: <span className="font-semibold amount">{fmt(balance?.balance)}</span>
            </p>
          </div>
          <button
            className="btn-primary w-full"
            onClick={handleWithdraw}
            disabled={withdrawLoading || !withdrawAmt || Number(withdrawAmt) < 1}
          >
            {withdrawLoading ? 'Processing…' : `Withdraw ${withdrawAmt ? fmt(withdrawAmt) : ''}`}
          </button>
        </div>
      </Modal>
    </div>
  );
}