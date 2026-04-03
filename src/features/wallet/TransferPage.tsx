import { getApiErrorMessage, isWalletNotFound } from '../../core/api/types';
import { formatCurrency as fmt } from '../../shared/utils';
import { Button } from '../../shared/components/Button';
import { InputField, AmountInput } from '../../shared/components/Input';
import { useState, ChangeEvent, FormEvent } from 'react';
import { Send, User, Info, CheckCircle } from 'lucide-react';
import { userApi } from '../../core/api/userApi';
import { toast } from '../../shared/components/Toast';
import { useNotifications } from '../../store/NotificationContext';
import { Spinner } from '../../shared/components/UI';
import NoWalletBanner from '../../shared/components/NoWalletBanner';
import { ScratchCardModal } from '../../shared/components/ScratchCard';
import { walletApi } from '../../core/api/walletApi';

// fmt → imported from '../../shared/utils'

type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'REJECTED' | 'APPROVED' | null;


interface TransferForm {
  receiverId: string;
  amount: string;
  description: string;
}
interface TransferSuccess {
  amount: string;
  receiverId: string;
}

export default function TransferPage() {
  const { addNotification } = useNotifications();
  const [form, setForm] = useState<TransferForm>({ receiverId: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<TransferSuccess | null>(null);
  const [walletMissing, setWalletMissing] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus>(null);

  // ── Scratch card state ─────────────────────────────────────────────────
  const [scratchModal, setScratchModal] = useState(false);
  const [scratchAmount, setScratchAmount] = useState(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.receiverId || !form.amount) return toast.error('Fill in all required fields');
    if (Number(form.amount) < 1 || Number(form.amount) > 25000) return toast.error('Amount must be ₹1–₹25,000');
    setLoading(true);
    try {
      await walletApi.transfer({
        receiverId: Number(form.receiverId),
        amount: Number(form.amount),
        description: form.description,
        idempotencyKey: `txn_${Date.now()}_${form.receiverId}`,
      });
      setSuccess({ amount: form.amount, receiverId: form.receiverId });
      addNotification({ title: 'Transfer Successful', message: `₹${form.amount} sent to User #${form.receiverId}`, type: 'success' });
      toast.success(`Transfer of ${fmt(form.amount)} successful!`);
      setForm({ receiverId: '', amount: '', description: '' });
      // Show scratch card after successful transfer
      setScratchAmount(Number(form.amount));
      setTimeout(() => setScratchModal(true), 600);
    } catch (err) {
      if (isWalletNotFound(err)) {
        const kycRes = await userApi.kycStatus().catch(() => null);
        setKycStatus(kycRes?.data?.data?.status ?? null);
        setWalletMissing(true);
      } else {
        toast.error(getApiErrorMessage(err, 'Transfer failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Send / Transfer</h1>

      {/* Wallet not activated guard */}
      {walletMissing && (
        <NoWalletBanner kycStatus={kycStatus} variant="inline" />
      )}

      {success && (
        <div className="card p-5 border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
            <div>
              <div className="font-bold text-emerald-700 dark:text-emerald-400">Transfer Successful!</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-500">
                {fmt(success.amount)} sent to User #{success.receiverId}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Recipient User ID *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input name="receiverId" type="number" placeholder="Enter recipient's user ID"
              className="input-field pl-10" value={form.receiverId} onChange={handleChange} required />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <Info className="w-3 h-3" /> Ask the recipient for their User ID
          </p>
        </div>

        <div>
          <label className="label">Amount (₹) *</label>
          <input name="amount" type="number" min="1" max="25000" placeholder="0.00"
            className="input-field text-2xl font-mono" value={form.amount} onChange={handleChange} required />
          <p className="text-xs text-[var(--text-muted)] mt-1">Max: ₹25,000 per transfer</p>
        </div>

        <div>
          <label className="label">Note (optional)</label>
          <input name="description" type="text" maxLength={255} placeholder="What's this for?"
            className="input-field" value={form.description} onChange={handleChange} />
        </div>

        {form.amount && Number(form.amount) > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--text-muted)]">Transfer amount</span>
              <span className="font-semibold amount">{fmt(form.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Processing fee</span>
              <span className="font-semibold text-emerald-500">Free</span>
            </div>
            <div className="border-t border-[var(--border)] mt-3 pt-3 flex justify-between font-bold">
              <span>Total deducted</span>
              <span className="amount">{fmt(form.amount)}</span>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : <><Send className="w-4 h-4" /> Send Money</>}
        </button>
      </form>

      <div className="card p-4">
        <h3 className="font-semibold text-sm mb-3">Transfer Guidelines</h3>
        <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
          <li>• Transfers are instant and irreversible</li>
          <li>• Maximum ₹25,000 per transaction</li>
          <li>• Duplicate protection via idempotency key</li>
          <li>• Both sender and receiver are notified</li>
        </ul>
      </div>

      {/*  Scratch Card Modal — shown after successful transfer */}
      <ScratchCardModal
        open={scratchModal}
        onClose={() => setScratchModal(false)}
        triggerType="transfer"
        amount={scratchAmount}
        onPointsEarned={(pts) => {
          toast.success(`+${pts} bonus points added to your rewards!`, 'Scratch Reward');
          addNotification({ title: 'Scratch Card Reward', message: `You earned ${pts} bonus points!`, type: 'success' });
        }}
      />
    </div>
  );
}
