import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import { authApi } from '../../core/api/authApi';
import { toast } from '../../shared/components/Toast';
import { ROUTES } from '../../routes';
import { Button, LinkButton } from '../../shared/components/Button';
import { InputField, OtpInput, PasswordStrength } from '../../shared/components/Input';
import { AuthShell }    from './components/AuthShell';
import { PasswordInput } from './components/PasswordInput';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]             = useState(1);
  const [email, setEmail]           = useState('');
  const [otp, setOtp]               = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const sendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try { await authApi.forgotSendOtp({ email }); toast.info('OTP sent to your email'); setStep(2); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try { const res = await authApi.forgotVerifyOtp({ email, otp }); setResetToken(res.data.resetToken); setStep(3); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const resetPw = async () => {
    setLoading(true);
    try { await authApi.resetPassword({ resetToken, newPassword: password }); toast.success('Password reset successfully!'); navigate(ROUTES.LOGIN); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  const STEPS = [{ num: 1, label: 'Email' }, { num: 2, label: 'Verify' }, { num: 3, label: 'Reset' }];

  return (
    <AuthShell title="Reset your password" subtitle="We'll help you get back in">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
              ${step > s.num ? 'bg-emerald-500 text-white' : step === s.num ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]'}`}>
              {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs font-medium ${step === s.num ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${step > s.num ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />}
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {step === 1 && (
          <>
            <InputField label="Email address" icon={Mail} type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button fullWidth size="lg" loading={loading} disabled={!email} onClick={sendOtp}
              icon={<Mail className="w-4 h-4" />}>Send OTP</Button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-[var(--text-muted)]">
              Code sent to <span className="font-semibold text-[var(--text)]">{email}</span>
            </div>
            <div>
              <label className="label text-center block mb-4">Enter 6-digit OTP</label>
              <OtpInput value={otp} onChange={setOtp} />
            </div>
            <Button fullWidth size="lg" loading={loading} disabled={otp.length < 6} onClick={verifyOtp}>Verify OTP</Button>
          </>
        )}
        {step === 3 && (
          <>
            <div>
              <PasswordInput label="New Password" placeholder="New strong password"
                showPw={showPw} onToggle={() => setShowPw((v) => !v)}
                value={password} onChange={(e: any) => setPassword(e.target.value)} />
              <PasswordStrength password={password} />
            </div>
            <Button fullWidth size="lg" loading={loading} disabled={!password} onClick={resetPw}
              icon={<CheckCircle className="w-4 h-4" />}>Reset Password</Button>
          </>
        )}
        <LinkButton href={ROUTES.LOGIN} variant="ghost" fullWidth className="text-sm justify-center">
          ← Back to login
        </LinkButton>
      </div>
    </AuthShell>
  );
}
