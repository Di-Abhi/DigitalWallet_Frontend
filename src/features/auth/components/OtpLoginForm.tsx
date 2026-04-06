import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { authApi } from '../../../core/api/authApi';
import { toast } from '../../../shared/components/Toast';
import { Button } from '../../../shared/components/Button';
import { InputField, OtpInput } from '../../../shared/components/Input';

type Step = 'email' | 'otp';

interface Props {
  onSuccess: (res: { accessToken: string; refreshToken: string; user: any }) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OtpLoginForm({ onSuccess }: Props) {
  const [step, setStep]   = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [otp, setOtp]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [expiryMins, setExpiryMins]   = useState(5);
  const [cooldown, setCooldown]       = useState(0);

  // ── Resend cooldown timer ─────────────────────────────────────────────────
  const startCooldown = (secs = 30) => {
    setCooldown(secs);
    const t = setInterval(() => {
      setCooldown((p) => {
        if (p <= 1) { clearInterval(t); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  // ── Step 1: send OTP via POST /api/auth/send-otp ─────────────────────────
  const sendOtp = async () => {
    if (!email)               { setEmailErr('Email is required'); return; }
    if (!EMAIL_RE.test(email)){ setEmailErr('Enter a valid email address'); return; }
    setEmailErr('');
    setLoading(true);
    try {
      // Uses the real working endpoint confirmed by Swagger
      const res = await authApi.sendOtp({ email });
      const mins = res.data?.expiryMinutes ?? 5;
      setExpiryMins(mins);
      toast.success('OTP sent! Check your inbox.');
      setStep('otp');
      startCooldown(30);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Step 2: verify OTP via POST /api/auth/verify-otp → returns tokens ────
  const verifyOtp = async () => {
    if (otp.length < 6) {
      toast.error('Enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      // Same endpoint used by SignupPage — returns { accessToken, refreshToken, user }
      const res = await authApi.verifyOtp({ email, otp });
      const { accessToken, refreshToken, user } = res.data;
      onSuccess({ accessToken, refreshToken, user });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid or expired OTP. Try again.');
      setOtp('');
    } finally { setLoading(false); }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await authApi.sendOtp({ email });
      setExpiryMins(res.data?.expiryMinutes ?? 5);
      setOtp('');
      toast.success('OTP resent! Check your inbox.');
      startCooldown(30);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 — Email entry
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'email') {
    return (
      <div className="space-y-5">
        <InputField
          label="Email address"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          value={email}
          autoFocus
          error={emailErr ? { message: emailErr } : undefined}
          onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
          onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
        />

        {/* Hint */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
          <Mail className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-cyan-700 dark:text-cyan-400">
            We'll send a 6-digit code to your email. No password needed.
          </p>
        </div>

        <Button
          fullWidth
          size="lg"
          loading={loading}
          disabled={!email}
          onClick={sendOtp}
          icon={<Mail className="w-4 h-4" />}
          className="shadow-lg shadow-cyan-500/20"
        >
          Send OTP
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2 — OTP entry
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Sent-to banner */}
      <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-400">
              OTP sent to your email
            </p>
            <p className="text-xs text-cyan-600 dark:text-cyan-500 mt-0.5 break-all font-medium">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* OTP boxes */}
      <div>
        <label className="label text-center block mb-4">Enter 6-digit OTP</label>
        <OtpInput value={otp} onChange={setOtp} />
      </div>

      {/* Verify */}
      <Button
        fullWidth
        size="lg"
        loading={loading}
        disabled={otp.length < 6}
        onClick={verifyOtp}
        icon={<CheckCircle className="w-4 h-4" />}
        className="shadow-lg shadow-cyan-500/20"
      >
        Verify & Sign In
      </Button>

      {/* Navigation row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          onClick={() => { setStep('email'); setOtp(''); }}
        >
          ← Change email
        </button>

        <button
          type="button"
          onClick={resendOtp}
          disabled={cooldown > 0 || loading}
          className={`text-xs font-medium transition-colors ${
            cooldown > 0 || loading
              ? 'text-[var(--text-muted)] cursor-not-allowed'
              : 'text-cyan-500 hover:text-cyan-400 hover:underline'
          }`}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
        </button>
      </div>

      {/* Expiry */}
      <p className="text-center text-xs text-[var(--text-muted)]">
        OTP expires in <span className="font-semibold">{expiryMins} minutes</span>
      </p>
    </div>
  );
}
