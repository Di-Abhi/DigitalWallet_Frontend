import { useState, useCallback, useRef } from 'react';
import { walletApi } from '../../../core/api/walletApi';
import { userApi }   from '../../../core/api/userApi';
import { toast }     from '../../../shared/components/Toast';
import { isWalletNotFound } from '../../../core/api/types';
import { formatCurrency as fmt } from '../../../shared/utils';
import { useAuth }          from '../../../store/AuthContext';
import { useNotifications } from '../../../store/NotificationContext';
import type { Balance, LedgerEntry, KycStatus, PayStatus } from '../types';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SXNZeesPumUKeY';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useWallet(page: number) {
  const { user }            = useAuth();
  const { addNotification } = useNotifications();

  // Data
  const [balance, setBalance]       = useState<Balance | null>(null);
  const [ledger, setLedger]         = useState<LedgerEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [walletMissing, setWalletMissing] = useState(false);
  const [kycStatus, setKycStatus]   = useState<KycStatus>(null);

  // Add money
  const [amount, setAmount]         = useState('');
  const [payStatus, setPayStatus]   = useState<PayStatus>('idle');
  const [lastPayment, setLastPayment] = useState<{ paymentId: string; orderId: string } | null>(null);
  const [failMsg, setFailMsg]       = useState('');
  const payStatusRef                = useRef<PayStatus>('idle');

  // Scratch card
  const [scratchModal, setScratchModal]   = useState(false);
  const [scratchAmount, setScratchAmount] = useState(0);

  const setPayStatusSafe = (v: PayStatus | ((prev: PayStatus) => PayStatus)) => {
    const next = typeof v === 'function' ? v(payStatusRef.current) : v;
    payStatusRef.current = next;
    setPayStatus(next);
  };

  const loadData = useCallback(async () => {
    try {
      const kycRes = await userApi.kycStatus().catch(() => null);
      if (kycRes) setKycStatus(kycRes.data?.data?.status ?? null);

      const [bRes, lRes] = await Promise.allSettled([
        walletApi.balance(),
        walletApi.ledger(page, 15),
      ]);

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

  const resetAddModal = () => {
    setAmount('');
    setPayStatusSafe('idle');
    setLastPayment(null);
    setFailMsg('');
  };

  const handleAddMoney = async () => {
    const rupees = Number(amount);
    if (!rupees || rupees < 1) return toast.error('Enter a valid amount (min ₹1)');
    setPayStatusSafe('creatingOrder');

    const sdkReady = await loadRazorpayScript();
    if (!sdkReady) {
      toast.error('Could not load Razorpay SDK. Check your internet connection.');
      setPayStatusSafe('idle');
      return;
    }

    let order: any;
    try { const res = await walletApi.createOrder(rupees); order = res.data; }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create payment order'); setPayStatusSafe('idle'); return; }

    if (!order?.orderId) { toast.error('Invalid order received. Please try again.'); setPayStatusSafe('idle'); return; }
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
      await walletApi.verifyPayment({
        razorpayPaymentId: rzpResponse.razorpay_payment_id,
        razorpayOrderId:   rzpResponse.razorpay_order_id,
        razorpaySignature: rzpResponse.razorpay_signature,
      });
      setLastPayment({ paymentId: rzpResponse.razorpay_payment_id, orderId: rzpResponse.razorpay_order_id });
      setPayStatusSafe('success');
      toast.success(`${fmt(amount)} added to your wallet!`, 'Top-up Successful');
      addNotification({ title: 'Wallet Topped Up', message: `${fmt(amount)} credited via Razorpay`, type: 'success' });
      setScratchAmount(Number(amount));
      setTimeout(() => setScratchModal(true), 900);
      setTimeout(loadData, 800);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification failed — contact support with your Payment ID';
      setFailMsg(msg); setPayStatusSafe('failed'); toast.error(msg);
    }
  };

  return {
    // data
    balance, ledger, totalPages, loading, walletMissing, kycStatus,
    // add money
    amount, setAmount, payStatus, lastPayment, failMsg,
    scratchModal, setScratchModal, scratchAmount,
    // actions
    loadData, resetAddModal, handleAddMoney, setPayStatusSafe,
  };
}

export function useWithdraw(onSuccess: () => void) {
  const { addNotification } = useNotifications();
  const [withdrawAmt, setWithdrawAmt]     = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!withdrawAmt || Number(withdrawAmt) < 1) return toast.error('Enter a valid amount');
    setWithdrawLoading(true);
    try {
      await walletApi.withdraw({ amount: Number(withdrawAmt) });
      const fmt = (await import('../../../shared/utils')).formatCurrency;
      toast.success(`${fmt(withdrawAmt)} withdrawn successfully`);
      addNotification({ title: 'Withdrawal Successful', message: `${fmt(withdrawAmt)} withdrawn`, type: 'success' });
      setWithdrawAmt('');
      onSuccess();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Withdrawal failed'); }
    finally { setWithdrawLoading(false); }
  };

  return { withdrawAmt, setWithdrawAmt, withdrawLoading, handleWithdraw };
}

export function useStatement() {
  const [stmtFrom, setStmtFrom] = useState('');
  const [stmtTo, setStmtTo]     = useState('');

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

  return { stmtFrom, setStmtFrom, stmtTo, setStmtTo, downloadStatement };
}
