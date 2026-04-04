import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import { AmountInput } from '../../../shared/components/Input';
import { formatCurrency as fmt } from '../../../shared/utils';
import { QUICK_AMOUNTS, type PayStatus } from '../types';

// ─── Processing / result views ───────────────────────────────────────────────
function ProcessingView({ status }: { status: PayStatus }) {
  const MAP = {
    creatingOrder: { msg: 'Creating payment order…',       sub: 'Connecting to Razorpay' },
    paying:        { msg: 'Razorpay checkout is open',     sub: 'Complete the payment in the Razorpay popup' },
    verifying:     { msg: 'Verifying payment…',            sub: 'Crediting your wallet — please wait' },
  } as const;
  const info = MAP[status as keyof typeof MAP];
  if (!info) return null;
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
      <p className="font-semibold">{info.msg}</p>
      <p className="text-sm text-[var(--text-muted)]">{info.sub}</p>
    </div>
  );
}

interface ResultViewProps {
  status:      'success' | 'failed';
  amount:      string;
  lastPayment: { paymentId: string; orderId: string } | null;
  failMsg:     string;
  onDone:      () => void;
  onRetry:     () => void;
}

function ResultView({ status, amount, lastPayment, failMsg, onDone, onRetry }: ResultViewProps) {
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
          {[['Payment ID', lastPayment.paymentId], ['Order ID', lastPayment.orderId]].map(([label, val]) => (
            <div key={label} className="flex justify-between gap-2">
              <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider shrink-0">{label}</span>
              <span className="font-mono font-semibold truncate">{val}</span>
            </div>
          ))}
        </div>
      )}
      <Button fullWidth onClick={onDone}>Done</Button>
    </div>
  );

  return (
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
}

// ─── Idle entry form ─────────────────────────────────────────────────────────
interface EntryFormProps {
  amount:    string;
  onAmount:  (v: string) => void;
  onSubmit:  () => void;
}

function EntryForm({ amount, onAmount, onSubmit }: EntryFormProps) {
  return (
    <div className="space-y-5">
      <AmountInput
        label="Amount"
        min={1}
        placeholder="0.00"
        value={amount}
        onChange={(e) => onAmount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        className="text-2xl font-mono"
        autoFocus
      />
      <div>
        <label className="label">Quick Select</label>
        <div className="flex gap-2 flex-wrap">
          {QUICK_AMOUNTS.map((a) => (
            <button key={a}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all
                ${Number(amount) === a
                  ? 'bg-cyan-500 text-white border-cyan-500'
                  : 'border-[var(--border)] hover:border-cyan-500 hover:text-cyan-500'}`}
              onClick={() => onAmount(String(a))}>
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
      <Button fullWidth size="lg" disabled={!amount || Number(amount) < 1} onClick={onSubmit}>
        Pay {amount ? fmt(amount) : ''} via Razorpay
      </Button>
      <p className="text-xs text-center text-[var(--text-muted)]">🔒 Secured by Razorpay · UPI · Cards · Net Banking</p>
    </div>
  );
}

// ─── AddMoneyModal ───────────────────────────────────────────────────────────
interface Props {
  open:        boolean;
  amount:      string;
  payStatus:   PayStatus;
  lastPayment: { paymentId: string; orderId: string } | null;
  failMsg:     string;
  onAmount:    (v: string) => void;
  onClose:     () => void;
  onSubmit:    () => void;
  onRetry:     () => void;
}

const MODAL_TITLES: Partial<Record<PayStatus, string>> = {
  success:       '🎉 Top-up Successful',
  failed:        '❌ Payment Failed',
  creatingOrder: '⏳ Processing…',
  paying:        '⏳ Processing…',
  verifying:     '⏳ Processing…',
};

export function AddMoneyModal({ open, amount, payStatus, lastPayment, failMsg, onAmount, onClose, onSubmit, onRetry }: Props) {
  const isProcessing = ['creatingOrder', 'paying', 'verifying'].includes(payStatus);

  return (
    <Modal
      open={open}
      onClose={isProcessing ? () => {} : onClose}
      title={MODAL_TITLES[payStatus] ?? 'Add Money'}
    >
      {payStatus === 'idle' && (
        <EntryForm amount={amount} onAmount={onAmount} onSubmit={onSubmit} />
      )}
      {isProcessing && <ProcessingView status={payStatus} />}
      {(payStatus === 'success' || payStatus === 'failed') && (
        <ResultView
          status={payStatus as 'success' | 'failed'}
          amount={amount} lastPayment={lastPayment} failMsg={failMsg}
          onDone={onClose} onRetry={onRetry}
        />
      )}
    </Modal>
  );
}
