import { isWalletNotFound, getApiErrorMessage } from '../../core/api/types';
import { formatCurrency as fmt, formatDateTime as fmtDate } from '../../shared/utils';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet, Plus, ArrowDownLeft, Download, RefreshCw, CheckCircle, XCircle, Loader, Trophy } from 'lucide-react';
import { userApi } from '../../core/api/userApi';
import { Modal, StatusBadge, LoadingPage, EmptyState } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useNotifications } from '../../store/NotificationContext';
import { useAuth } from '../../store/AuthContext';
import NoWalletBanner from '../../shared/components/NoWalletBanner';
import { ScratchCardModal } from '../../shared/components/ScratchCard';
import { walletApi } from '../../core/api/walletApi';
import { Button, IconButton, Pagination } from '../../shared/components/Button';
import { AmountInput, InputField } from '../../shared/components/Input';

type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'REJECTED' | 'APPROVED' | null;
type PayStatus  = 'idle' | 'creatingOrder' | 'paying' | 'verifying' | 'success' | 'failed';

declare global { interface Window { Razorpay: any; } }

const RAZORPAY_KEY  = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SXNZeesPumUKeY';
const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

interface Balance     { balance: number; status?: string; lastUpdated?: string; }
interface LedgerEntry { id: number; type: string; amount: number; description?: string; referenceId?: string; createdAt?: string; }

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) { existing.addEventListener('load', () => resolve(true)); existing.addEventListener('error', () => resolve(false)); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Pay status UI ────────────────────────────────────────────────────────────
function PayStatusView({ status, amount, lastPayment, failMsg, onDone, onRetry }: {
  status: PayStatus; amount: string; lastPayment: { paymentId: string; orderId: string } | null;
  failMsg: string; onDone: () => void; onRetry: () => void;
}) {
  if (status === 'creatingOrder') return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
      <p className="font-semibold">Creating payment order…</p>
      <p className="text-sm text-[var(--text-muted)]">Connecting to Razorpay</p>
    </div>
  );
  if (status === 'paying') return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
      <p className="font-semibold">Razorpay checkout is open</p>
      <p className="text-sm text-[var(--text-muted)]">Complete the payment in the Razorpay popup</p>
    </div>
  );
  if (status === 'verifying') return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
      <p className="font-semibold">Verifying payment…</p>
      <p className="text-sm text-[var(--text-muted)]">Crediting your wallet — please wait</p>
    </div>
  );
  if (status === 'success') return (
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
          <div className="flex justify-between gap-2">
            <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider shrink-0">Payment ID</span>
            <span className="font-mono font-semibold truncate">{lastPayment.paymentId}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider shrink-0">Order ID</span>
            <span className="font-mono font-semibold truncate">{lastPayment.orderId}</span>
          </div>
        </div>
      )}
      <Button fullWidth onClick={onDone}>Done</Button>
    </div>
  );
  if (status === 'failed') return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <XCircle className="w-9 h-9 text-red-500" />
      </div>
      <div className="text-center">
        <p className="font-bold text-lg text-red-600 dark:text-red-400">Payment Failed</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">{failMsg}</p>
      </div>
      <div className="flex gap-3 w-full">
        <Button variant="secondary" fullWidth onClick={onDone}>Cancel</Button>
        <Button fullWidth onClick={onRetry}>Try Again</Button>
      </div>
    </div>
  );
  return null;
}

export default function WalletPage() {
  const { user }            = useAuth();
  const { addNotification } = useNotifications();

  const [balance, setBalance]     = useState<Balance | null>(null);
  const [ledger, setLedger]       = useState<LedgerEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [walletMissing, setWalletMissing] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus>(null);

  const [addModal, setAddModal]   = useState(false);
  const [amount, setAmount]       = useState('');
  const [payStatus, setPayStatus] = useState<PayStatus>('idle');
  const [lastPayment, setLastPayment] = useState<{ paymentId: string; orderId: string } | null>(null);
  const [failMsg, setFailMsg]     = useState('');
  const payStatusRef              = useRef<PayStatus>('idle');

  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmt, setWithdrawAmt]     = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [scratchModal, setScratchModal]   = useState(false);
  const [scratchAmount, setScratchAmount] = useState(0);
  const [stmtFrom, setStmtFrom]           = useState('');
  const [stmtTo, setStmtTo]               = useState('');

  const setPayStatusSafe = (v: PayStatus | ((prev: PayStatus) => PayStatus)) => {
    const next = typeof v === 'function' ? v(payStatusRef.current) : v;
    payStatusRef.current = next;
    setPayStatus(next);
  };

  const loadData = useCallback(async () => {
    try {
      const kycRes = await userApi.kycStatus().catch(() => null);
      if (kycRes) setKycStatus(kycRes.data?.data?.status ?? null);

      const [bRes, lRes] = await Promise.allSettled([walletApi.balance(), walletApi.ledger(page, 15)]);

      if (bRes.status === 'rejected') {
        if (isWalletNotFound(bRes.reason)) { setWalletMissing(true); setLoading(false); return; }
        toast.error('Failed to load wallet balance');
      } else {
        setWalletMissing(false);
        setBalance(bRes.value.data.data);
      }
      if (lRes.status === 'fulfilled') {
        setLedger(lRes.value.data.content || []);
        setTotalPages(lRes.value.data.totalPages || 1);
      }
    } catch { toast.error('Failed to load wallet data'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadData(); }, [loadData]);

  const resetAddModal = () => { setAddModal(false); setAmount(''); setPayStatusSafe('idle'); setLastPayment(null); setFailMsg(''); };

  const handleAddMoney = async () => {
    const rupees = Number(amount);
    if (!rupees || rupees < 1) return toast.error('Enter a valid amount (min ₹1)');
    setPayStatusSafe('creatingOrder');
    const sdkReady = await loadRazorpayScript();
    if (!sdkReady) { toast.error('Could not load Razorpay SDK. Check your internet connection.'); setPayStatusSafe('idle'); return; }
    let order: any;
    try { const res = await walletApi.createOrder(rupees); order = res.data; }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create payment order'); setPayStatusSafe('idle'); return; }
    if (!order?.orderId) { toast.error('Invalid order received from server. Please try again.'); setPayStatusSafe('idle'); return; }
    setPayStatusSafe('paying');
    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY, amount: order.amount, currency: order.currency || 'INR',
      name: 'PayVault', description: 'Wallet Top-up', order_id: order.orderId,
      handler: async (response: any) => { setPayStatusSafe('verifying'); await verifyPayment(response); },
      prefill: { name: user?.fullName || '', email: user?.email || '' },
      theme: { color: '#06b6d4' },
      modal: { ondismiss: () => { if (payStatusRef.current === 'paying') { setPayStatusSafe('idle'); toast.info('Payment cancelled'); } } },
    });
    rzp.on('payment.failed', (response: any) => {
      const msg = response.error.description || 'Payment was not completed';
      setFailMsg(msg); setPayStatusSafe('failed');
      addNotification({ title: 'Payment Failed', message: msg, type: 'error' });
    });
    rzp.open();
  };

  const verifyPayment = async (rzpResponse: any) => {
    try {
      await walletApi.verifyPayment({ razorpayPaymentId: rzpResponse.razorpay_payment_id, razorpayOrderId: rzpResponse.razorpay_order_id, razorpaySignature: rzpResponse.razorpay_signature });
      setLastPayment({ paymentId: rzpResponse.razorpay_payment_id, orderId: rzpResponse.razorpay_order_id });
      setPayStatusSafe('success');
      toast.success(`${fmt(amount)} added to your wallet!`, 'Top-up Successful');
      addNotification({ title: `Wallet Topped Up`, message: `${fmt(amount)} credited via Razorpay`, type: 'success' });
      setScratchAmount(Number(amount));
      setTimeout(() => setScratchModal(true), 900);
      setTimeout(loadData, 800);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification failed — contact support with your Payment ID';
      setFailMsg(msg); setPayStatusSafe('failed'); toast.error(msg);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmt || Number(withdrawAmt) < 1) return toast.error('Enter a valid amount');
    setWithdrawLoading(true);
    try {
      await walletApi.withdraw({ amount: Number(withdrawAmt) });
      toast.success(`${fmt(withdrawAmt)} withdrawn successfully`);
      addNotification({ title: 'Withdrawal Successful', message: `${fmt(withdrawAmt)} withdrawn`, type: 'success' });
      setWithdrawModal(false); setWithdrawAmt(''); loadData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Withdrawal failed'); }
    finally { setWithdrawLoading(false); }
  };

  const downloadStatement = async () => {
    if (!stmtFrom || !stmtTo) return toast.error('Select date range');
    try {
      const res = await walletApi.downloadStatement(stmtFrom, stmtTo);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href = url; a.download = `statement_${stmtFrom}_${stmtTo}.csv`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Statement downloaded');
    } catch { toast.error('Failed to download statement'); }
  };

  if (loading) return <LoadingPage />;

  if (walletMissing) return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <IconButton icon={<RefreshCw className="w-4 h-4" />} label="Refresh" onClick={loadData} />
      </div>
      <NoWalletBanner kycStatus={kycStatus} variant="page" />
    </div>
  );

  const isProcessing = ['creatingOrder', 'paying', 'verifying'].includes(payStatus);
  const isIdle       = payStatus === 'idle';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <IconButton icon={<RefreshCw className="w-4 h-4" />} label="Refresh" onClick={loadData} />
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
            <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              onClick={() => setAddModal(true)}>
              <Plus className="w-4 h-4" /> Add Money
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              onClick={() => setWithdrawModal(true)}>
              <ArrowDownLeft className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Statement download */}
      <div className="card p-5">
        <h2 className="font-bold mb-4 text-sm">Download Statement</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <InputField label="From" type="date" value={stmtFrom} onChange={(e) => setStmtFrom(e.target.value)} className="w-auto" />
          <InputField label="To"   type="date" value={stmtTo}   onChange={(e) => setStmtTo(e.target.value)}   className="w-auto" />
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={downloadStatement}>
            Download CSV
          </Button>
        </div>
      </div>

      {/* Ledger */}
      <div className="card p-6">
        <h2 className="font-bold mb-5">Ledger</h2>
        {ledger.length === 0 ? (
          <EmptyState icon={Wallet} title="No ledger entries yet" desc="Your transaction history will appear here" />
        ) : (
          <div className="space-y-2">
            {ledger.map((entry) => {
              const isCredit = entry.type === 'CREDIT';
              return (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${isCredit ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                    {isCredit ? '+' : '−'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{entry.description || entry.referenceId || 'Transaction'}</div>
                    <div className="text-xs text-[var(--text-muted)]">{fmtDate(entry.createdAt)}</div>
                  </div>
                  <div className={`amount font-bold text-sm shrink-0 ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isCredit ? '+' : '−'}{fmt(entry.amount)}
                  </div>
                  <StatusBadge status={entry.type} />
                </div>
              );
            })}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-5" />
      </div>

      {/* Add Money Modal */}
      <Modal
        open={addModal}
        onClose={isProcessing ? () => {} : resetAddModal}
        title={payStatus === 'success' ? '🎉 Top-up Successful' : payStatus === 'failed' ? '❌ Payment Failed' : isProcessing ? '⏳ Processing…' : 'Add Money'}
      >
        {!isIdle ? (
          <PayStatusView
            status={payStatus} amount={amount} lastPayment={lastPayment} failMsg={failMsg}
            onDone={resetAddModal}
            onRetry={() => { setPayStatusSafe('idle'); setFailMsg(''); }}
          />
        ) : (
          <div className="space-y-5">
            <AmountInput
              label="Amount"
              min={1}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMoney()}
              className="text-2xl font-mono"
              autoFocus
            />
            <div>
              <label className="label">Quick Select</label>
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((a) => (
                  <button key={a}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${Number(amount) === a ? 'bg-cyan-500 text-white border-cyan-500' : 'border-[var(--border)] hover:border-cyan-500 hover:text-cyan-500'}`}
                    onClick={() => setAmount(String(a))}>
                    ₹{a.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            {Number(amount) > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm flex justify-between items-center">
                <span className="text-[var(--text-muted)]">You will be charged</span>
                <span className="font-bold amount text-lg">{fmt(amount)}</span>
              </div>
            )}
            <Button fullWidth size="lg" disabled={!amount || Number(amount) < 1} onClick={handleAddMoney}>
              Pay {amount ? fmt(amount) : ''} via Razorpay
            </Button>
            <p className="text-xs text-center text-[var(--text-muted)]">🔒 Secured by Razorpay · UPI · Cards · Net Banking</p>
          </div>
        )}
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={withdrawModal} onClose={() => { setWithdrawModal(false); setWithdrawAmt(''); }} title="Withdraw Funds">
        <div className="space-y-4">
          <AmountInput
            label="Amount"
            min={1}
            placeholder="0.00"
            value={withdrawAmt}
            onChange={(e) => setWithdrawAmt(e.target.value)}
            hint={`Available: ${fmt(balance?.balance)}`}
            className="text-2xl font-mono"
            autoFocus
          />
          <Button fullWidth loading={withdrawLoading} disabled={!withdrawAmt || Number(withdrawAmt) < 1} onClick={handleWithdraw}>
            Withdraw {withdrawAmt ? fmt(withdrawAmt) : ''}
          </Button>
        </div>
      </Modal>

      <ScratchCardModal
        open={scratchModal}
        onClose={() => setScratchModal(false)}
        triggerType="recharge"
        amount={scratchAmount}
        onPointsEarned={(pts) => {
          toast.success(`+${pts} bonus points added to your rewards!`, 'Scratch Reward');
          addNotification({ title: '🎁 Scratch Card Reward', message: `You earned ${pts} bonus points!`, type: 'success' });
        }}
      />
    </div>
  );
}
