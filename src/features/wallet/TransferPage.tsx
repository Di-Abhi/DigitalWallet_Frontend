import { getApiErrorMessage, isReceiverNotFound, isWalletNotFound } from '../../core/api/types';
import { formatCurrency as fmt } from '../../shared/utils';
import { useState, ChangeEvent, FormEvent } from 'react';
import { Send, Phone, Info, CheckCircle } from 'lucide-react';
import { userApi } from '../../core/api/userApi';
import { walletApi } from '../../core/api/walletApi';
import { toast } from '../../shared/components/Toast';
import { useNotifications } from '../../store/NotificationContext';
import NoWalletBanner from '../../shared/components/NoWalletBanner';
import { ScratchCardModal } from '../../shared/components/ScratchCard';
import { Button } from '../../shared/components/Button';
import { InputField, AmountInput } from '../../shared/components/Input';

type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'REJECTED' | 'APPROVED' | null;

interface TransferForm   { receiverPhone: string; amount: string; description: string; }
interface TransferSuccess { amount: string; receiverPhone: string; }

// Phone number validation: 10-15 digits
const PHONE_RE = /^[0-9]{10,15}$/;

export default function TransferPage() {
  const { addNotification } = useNotifications();
  const [form, setForm]     = useState<TransferForm>({ receiverPhone: '', amount: '', description: '' });
  const [errors, setErrors] = useState<Partial<TransferForm>>({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState<TransferSuccess | null>(null);
  const [walletMissing, setWalletMissing] = useState(false);
  const [kycStatus, setKycStatus]         = useState<KycStatus>(null);
  const [scratchModal, setScratchModal]   = useState(false);
  const [scratchAmount, setScratchAmount] = useState(0);

  const set = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = (): boolean => {
    const newErrors: Partial<TransferForm> = {};
    if (!form.receiverPhone)               newErrors.receiverPhone = 'Phone number is required';
    else if (!PHONE_RE.test(form.receiverPhone)) newErrors.receiverPhone = 'Enter a valid 10–15 digit phone number';
    if (!form.amount)                      newErrors.amount = 'Amount is required';
    else if (Number(form.amount) < 1)      newErrors.amount = 'Minimum transfer is ₹1';
    else if (Number(form.amount) > 25000)  newErrors.amount = 'Maximum transfer is ₹25,000';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await walletApi.transfer({
        receiverPhone: form.receiverPhone,
        amount: Number(form.amount),
        description: form.description,
        idempotencyKey: `txn_${Date.now()}_${form.receiverPhone}`,
      });
      setSuccess({ amount: form.amount, receiverPhone: form.receiverPhone });
      addNotification({ title: 'Transfer Successful', message: `₹${form.amount} sent to ${form.receiverPhone}`, type: 'success' });
      toast.success(`Transfer of ${fmt(form.amount)} successful!`);
      setScratchAmount(Number(form.amount));
      setForm({ receiverPhone: '', amount: '', description: '' });
      setTimeout(() => setScratchModal(true), 600);
    } catch (err) {
      if (isReceiverNotFound(err)) {
        toast.error('No account found for that phone number. Ask the recipient to sign up first.');
      } else if (isWalletNotFound(err)) {
        const kycRes = await userApi.kycStatus().catch(() => null);
        setKycStatus(kycRes?.data?.data?.status ?? null);
        setWalletMissing(true);
      } else {
        toast.error(getApiErrorMessage(err, 'Transfer failed'));
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Send / Transfer</h1>

      {walletMissing && <NoWalletBanner kycStatus={kycStatus} variant="inline" />}

      {success && (
        <div className="card p-5 border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
            <div>
              <div className="font-bold text-emerald-700 dark:text-emerald-400">Transfer Successful!</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-500">
                {fmt(success.amount)} sent to {success.receiverPhone}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <InputField
          label="Recipient Phone Number *"
          name="receiverPhone"
          type="tel"
          placeholder="Enter recipient's phone number"
          icon={Phone}
          value={form.receiverPhone}
          onChange={set}
          error={errors.receiverPhone ? { message: errors.receiverPhone } : undefined}
          hint="Enter the recipient's registered phone number"
        />

        <AmountInput
          label="Amount *"
          name="amount"
          min="1"
          max="25000"
          placeholder="0.00"
          value={form.amount}
          onChange={set}
          error={errors.amount ? { message: errors.amount } : undefined}
          hint="Max: ₹25,000 per transfer"
          className="text-2xl font-mono"
        />

        <InputField
          label="Note (optional)"
          name="description"
          type="text"
          maxLength={255}
          placeholder="What's this for?"
          value={form.description}
          onChange={set}
        />

        {form.amount && Number(form.amount) > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Transfer amount</span>
              <span className="font-semibold amount">{fmt(form.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Processing fee</span>
              <span className="font-semibold text-emerald-500">Free</span>
            </div>
            <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold">
              <span>Total deducted</span>
              <span className="amount">{fmt(form.amount)}</span>
            </div>
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} icon={<Send className="w-4 h-4" />}>
          Send Money
        </Button>
      </form>

      <div className="card p-4">
        <h3 className="font-semibold text-sm mb-3">Transfer Guidelines</h3>
        <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
          <li>• Transfers are instant and irreversible</li>
          <li>• Maximum ₹25,000 per transaction</li>
          <li>• Recipient must have a registered PayVault account</li>
          <li>• Both sender and receiver are notified</li>
        </ul>
      </div>

      <ScratchCardModal
        open={scratchModal}
        onClose={() => setScratchModal(false)}
        triggerType="transfer"
        amount={scratchAmount}
        onPointsEarned={(pts) => {
          toast.success(`+${pts} bonus points added to your rewards!`, 'Scratch Reward');
          addNotification({ title: '🎁 Scratch Card Reward', message: `You earned ${pts} bonus points!`, type: 'success' });
        }}
      />
    </div>
  );
}