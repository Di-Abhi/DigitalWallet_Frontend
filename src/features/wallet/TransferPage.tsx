import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Search, User, CheckCircle, XCircle,
  ArrowLeft, AlertCircle, Loader2, ChevronRight,
} from 'lucide-react';
import { walletApi } from '../../core/api/walletApi';
import { getApiErrorMessage } from '../../core/api/types';
import { toast } from '../../shared/components/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReceiverSuggestion {
  userId: number;
  name: string;
  email: string;
  phone: string;
}

type Step = 'lookup' | 'confirm' | 'success';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const DEBOUNCE_MS = 600;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Receiver Card ────────────────────────────────────────────────────────────
function ReceiverCard({ receiver }: { receiver: ReceiverSuggestion }) {
  const initials = receiver.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[var(--text-primary)] truncate">{receiver.name}</p>
        {receiver.email && (
          <p className="text-xs text-[var(--text-muted)] truncate">{receiver.email}</p>
        )}
        {receiver.phone && (
          <p className="text-xs text-[var(--text-muted)] truncate">{receiver.phone}</p>
        )}
      </div>
      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-auto" />
    </div>
  );
}

// ─── Step 1: Lookup ───────────────────────────────────────────────────────────
interface LookupStepProps {
  onReceiverFound: (receiver: ReceiverSuggestion) => void;
}

function LookupStep({ onReceiverFound }: LookupStepProps) {
  const [identifier, setIdentifier] = useState('');
  const [receiver, setReceiver]     = useState<ReceiverSuggestion | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [amount, setAmount]         = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending]       = useState(false);

  const debouncedIdentifier = useDebounce(identifier.trim(), DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Lookup receiver whenever identifier changes (debounced)
  useEffect(() => {
    if (!debouncedIdentifier || debouncedIdentifier.length < 3) {
      setReceiver(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setReceiver(null);

    walletApi
      .receiverSuggestion(debouncedIdentifier)
      .then((res) => {
        if (!cancelled) {
          const data = res.data?.data;
          if (data?.userId) setReceiver(data);
          else setError('No account found for this identifier.');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = getApiErrorMessage(err, '');
          setError(msg || 'No account found for this identifier.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedIdentifier]);

  const handleSend = async () => {
    if (!receiver) return;
    const amt = parseFloat(amount);
    if (!amt || amt < 1) { toast.error('Enter a valid amount (min ₹1)'); return; }
    if (amt > 25000)     { toast.error('Maximum transfer is ₹25,000'); return; }

    setSending(true);
    try {
      const idempotencyKey = `${receiver.userId}-${Date.now()}`;
      await walletApi.transfer({
        receiverIdentifier: identifier.trim(),
        amount: amt,
        idempotencyKey,
        description: description.trim() || undefined,
      });
      onReceiverFound({ ...receiver, _amount: amt } as ReceiverSuggestion & { _amount: number });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Transfer failed. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const canSend = receiver && parseFloat(amount) >= 1 && !sending;

  return (
    <div className="space-y-6">
      {/* Identifier Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--text-muted)]">
          Send to (phone, email, or user ID)
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. 9876543210, user@email.com, or #12345"
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          {loading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
          )}
          {receiver && !loading && (
            <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          )}
          {error && !loading && identifier.length >= 3 && (
            <XCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>

        {/* Status messages */}
        {identifier.trim().length > 0 && identifier.trim().length < 3 && (
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Enter at least 3 characters to search
          </p>
        )}
        {error && !loading && identifier.trim().length >= 3 && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}
      </div>

      {/* Receiver Card — shown only when found */}
      {receiver && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Sending to
            </p>
            <ReceiverCard receiver={receiver} />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-muted)]">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[var(--text-muted)]">₹</span>
              <input
                type="number"
                min="1"
                max="25000"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-lg font-semibold"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Min ₹1 · Max ₹25,000 per transfer</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-muted)]">
              Note <span className="text-[var(--text-muted)] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={255}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner split, rent..."
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold text-base transition-all hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
          >
            {sending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
            ) : (
              <><Send className="w-5 h-5" /> Send {amount ? fmt(parseFloat(amount) || 0) : 'Money'}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Success ──────────────────────────────────────────────────────────
interface SuccessStepProps {
  receiver: ReceiverSuggestion & { _amount?: number };
  onDone: () => void;
}

function SuccessStep({ receiver, onDone }: SuccessStepProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Transfer Successful!</h2>
        <p className="text-[var(--text-muted)] mt-1">
          {receiver._amount ? fmt(receiver._amount) : 'Money'} sent to{' '}
          <span className="font-semibold text-[var(--text-primary)]">{receiver.name}</span>
        </p>
      </div>
      <div className="w-full space-y-3 mt-2">
        <button
          onClick={onDone}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold transition-all hover:from-cyan-600 hover:to-cyan-700"
        >
          Send Another
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3.5 rounded-2xl border border-[var(--border)] text-[var(--text-primary)] font-medium transition-all hover:bg-[var(--bg-card)]"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Main Transfer Page ───────────────────────────────────────────────────────
export default function TransferPage() {
  const navigate = useNavigate();
  const [step, setStep]         = useState<Step>('lookup');
  const [receiver, setReceiver] = useState<(ReceiverSuggestion & { _amount?: number }) | null>(null);

  const handleReceiverFound = useCallback(
    (r: ReceiverSuggestion & { _amount?: number }) => {
      setReceiver(r);
      setStep('success');
    },
    [],
  );

  const handleReset = () => {
    setReceiver(null);
    setStep('lookup');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-[var(--bg-card)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Send Money</h1>
          <p className="text-sm text-[var(--text-muted)]">Transfer instantly to any wallet</p>
        </div>
      </div>

      {/* Card */}
      <div className="card p-6">
        {step === 'lookup' && (
          <LookupStep onReceiverFound={handleReceiverFound} />
        )}
        {step === 'success' && receiver && (
          <SuccessStep receiver={receiver} onDone={handleReset} />
        )}
      </div>

      {/* Info strip */}
      {step === 'lookup' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-sm text-[var(--text-muted)]">
          <AlertCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <p>
            Transfers are instant and cannot be reversed. Always verify the receiver's name
            before confirming.
          </p>
        </div>
      )}
    </div>
  );
}