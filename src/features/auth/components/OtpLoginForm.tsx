import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [step, setStep]         = useState<Step>('email');
  const [email, setEmail]       = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [expiryMins, setExpiryMins] = useState(5);
  const [cooldown, setCooldown]     = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up interval on unmount
  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (step === 'otp' && otp.length === 6 && !loading) {
      verifyOtp();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step]);

  const startCooldown = (secs = 30) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setCooldown(secs);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); cooldownRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed)               { setEmailErr('Email is required'); return; }
    if (!EMAIL_RE.test(trimmed)){ setEmailErr('Enter a valid email address'); return; }
    setEmailErr('');
    setLoading(true);
    try {
      const res = await authApi.sendOtp({ email: trimmed });
      setEmail(trimmed); // store trimmed value
      setExpiryMins(res.data?.expiryMinutes ?? 5);
      setStep('otp');
      startCooldown(30);
      toast.success('OTP sent! Check your inbox.');
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const verifyOtp = useCallback(async () => {
    const trimmedOtp = otp.trim();
    if (trimmedOtp.length < 6) { toast.error('Enter the complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      // POST /api/auth/verify-otp → { accessToken, refreshToken, tokenType, expiresIn, user }
      const res = await authApi.verifyOtp({ email, otp: trimmedOtp });
      const { accessToken, refreshToken, user } = res.data;
      onSuccess({ accessToken, refreshToken, user });
    } catch (e: any) {
      const status = e.response?.status;
      const msg    = e.response?.data?.message;
      if (status === 400 || status === 401) {
        toast.error(msg || 'Invalid or expired OTP. Please try again.');
      } else if (!e.response || status >= 500) {
        // 500 often means Redis deserialization issue — guide user to resend
        toast.error('Server error verifying OTP. Please tap "Resend OTP" to get a fresh code.');
      } else {
        toast.error(msg || 'OTP verification failed. Try again.');
      }
      setOtp('');
    } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, otp, onSuccess]);

  const resendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await authApi.sendOtp({ email });
      setExpiryMins(res.data?.expiryMinutes ?? 5);
      setOtp('');
      startCooldown(30);
      toast.success('New OTP sent! Check your inbox.');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to resend OTP. Try again.');
    } finally { setLoading(false); }
  };

  const goBack = () => {
    setStep('email');
    setOtp('');
    if (cooldownRef.current) { clearInterval(cooldownRef.current); cooldownRef.current = null; }
    setCooldown(0);
  };

  // ── Step 1: Email entry ───────────────────────────────────────────────────
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
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
          <Mail className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-cyan-700 dark:text-cyan-400">
            We'll send a 6-digit code to your email. No password needed.
          </p>
        </div>
        <Button fullWidth size="lg" loading={loading} disabled={!email.trim()}
          onClick={sendOtp} icon={<Mail className="w-4 h-4" />} className="shadow-lg shadow-cyan-500/20">
          Send OTP
        </Button>
      </div>
    );
  }

  // ── Step 2: OTP entry ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Sent-to banner */}
      <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-400">OTP sent to your email</p>
            <p className="text-xs text-cyan-600 dark:text-cyan-500 mt-0.5 break-all font-medium">{email}</p>
          </div>
        </div>
      </div>

      {/* OTP boxes */}
      <div>
        <label className="label text-center block mb-4">Enter 6-digit OTP</label>
        <OtpInput value={otp} onChange={setOtp} />
        <p className="text-center text-xs text-[var(--text-muted)] mt-2">
          Auto-submits when all digits are entered
        </p>
      </div>

      {/* Verify button */}
      <Button fullWidth size="lg" loading={loading} disabled={otp.length < 6}
        onClick={verifyOtp} icon={<CheckCircle className="w-4 h-4" />} className="shadow-lg shadow-cyan-500/20">
        Verify & Sign In
      </Button>

      {/* Navigation row */}
      <div className="flex items-center justify-between">
        <button type="button"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          onClick={goBack}>
          ← Change email
        </button>
        <button type="button" onClick={resendOtp} disabled={cooldown > 0 || loading}
          className={`text-xs font-medium transition-colors ${
            cooldown > 0 || loading
              ? 'text-[var(--text-muted)] cursor-not-allowed'
              : 'text-cyan-500 hover:text-cyan-400 hover:underline'
          }`}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
        </button>
      </div>

      <p className="text-center text-xs text-[var(--text-muted)]">
        OTP expires in <span className="font-semibold">{expiryMins} minutes</span>
      </p>
    </div>
  );
}