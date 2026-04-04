import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Phone, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { authApi } from '../../core/api/authApi';
import { toast } from '../../shared/components/Toast';
import { ROUTES } from '../../routes';
import { Button, LinkButton } from '../../shared/components/Button';
import { InputField, OtpInput, PasswordStrength } from '../../shared/components/Input';
import { VALIDATION } from '../../shared/utils';
import { AuthShell }    from './components/AuthShell';
import { AuthDivider }  from './components/AuthDivider';
import { PasswordInput } from './components/PasswordInput';

interface FormData { fullName: string; email: string; phone: string; password: string; }

export function SignupPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [step, setStep]       = useState<1 | 2>(1);
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();
  const passwordValue = watch('password', '');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.signup(data);
      setEmail(data.email);
      toast.info('OTP sent to your email');
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) return toast.error('Enter the complete 6-digit OTP');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp });
      const { accessToken, refreshToken, user } = res.data;
      login(user, { accessToken, refreshToken });
      toast.success('Account created! Welcome to PayVault 🎉');
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  if (step === 2) return (
    <AuthShell title="Verify your email" subtitle={`We sent a 6-digit code to ${email}`}>
      <div className="space-y-6">
        <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-400">Check your inbox</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-500 mt-0.5">
                Didn't receive it? Check spam or{' '}
                <button className="underline font-medium" onClick={() => setStep(1)}>go back</button>.
              </p>
            </div>
          </div>
        </div>
        <div>
          <label className="label text-center block mb-4">Enter OTP</label>
          <OtpInput value={otp} onChange={setOtp} />
        </div>
        <Button fullWidth size="lg" loading={loading} disabled={otp.length < 6} onClick={verifyOtp}
          icon={<CheckCircle className="w-4 h-4" />} className="shadow-lg shadow-cyan-500/20">
          Verify & Create Account
        </Button>
        <Button variant="ghost" fullWidth size="sm" onClick={() => setStep(1)}>← Back to signup</Button>
      </div>
    </AuthShell>
  );

  return (
    <AuthShell title="Create account" subtitle="Join 2 million users on PayVault">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Full name" icon={User} placeholder="John Doe"
          error={errors.fullName} {...register('fullName', VALIDATION.fullName)} />
        <InputField label="Email address" icon={Mail} type="email" placeholder="you@example.com"
          error={errors.email} {...register('email', VALIDATION.email)} />
        <InputField label="Phone number" icon={Phone} type="tel" placeholder="10-digit number"
          error={errors.phone} {...register('phone', VALIDATION.phone)} />
        <div>
          <PasswordInput label="Password" placeholder="Min 8 chars with uppercase, number & symbol"
            showPw={showPw} onToggle={() => setShowPw((v) => !v)}
            error={errors.password} {...register('password', VALIDATION.password)} />
          <PasswordStrength password={passwordValue} />
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shadow-lg shadow-cyan-500/20 mt-2">
          Create Account
        </Button>
      </form>
      <AuthDivider text="Already have an account?" />
      <LinkButton href={ROUTES.LOGIN} variant="secondary" fullWidth>Sign in instead</LinkButton>
      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        By creating an account you agree to our{' '}
        <a href="#" className="text-cyan-500 hover:underline">Terms</a> and{' '}
        <a href="#" className="text-cyan-500 hover:underline">Privacy Policy</a>
      </p>
    </AuthShell>
  );
}
