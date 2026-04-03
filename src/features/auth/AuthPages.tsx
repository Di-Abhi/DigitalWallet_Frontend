import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Wallet, Eye, EyeOff, ArrowRight, Mail, Phone, Lock, User,
  Shield, CheckCircle, Zap, Gift,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { authApi } from '../../core/api/authApi';
import { toast } from '../../shared/components/Toast';
import { useTheme } from '../../store/ThemeContext';
import { ROUTES } from '../../routes';
import { Button, TabButton, TabBar, LinkButton } from '../../shared/components/Button';
import { InputField, OtpInput, PasswordStrength } from '../../shared/components/Input';
import { VALIDATION } from '../../shared/utils';

// ─── Auth Shell ───────────────────────────────────────────────────────────────
function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const { isDark, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg text-white leading-none">PayVault</div>
            <div className="text-xs text-slate-400">Digital Wallet</div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your money,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">supercharged</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Instant transfers, smart rewards, and bank-grade security — all in one place.
          </p>
          <div className="space-y-4">
            {[
              { icon: Zap,    text: 'Instant transfers with zero fees',    color: 'text-cyan-400' },
              { icon: Gift,   text: 'Earn cashback on every transaction',   color: 'text-purple-400' },
              { icon: Shield, text: '256-bit encrypted & KYC verified',     color: 'text-emerald-400' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3">
                <div className={`${color} shrink-0`}><Icon className="w-5 h-5" /></div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-6">
          {[{ value: '2M+', label: 'Users' }, { value: '₹500Cr+', label: 'Processed' }, { value: '4.9★', label: 'Rating' }].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold text-cyan-400">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 relative">
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">PayVault</span>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={toggle} className="rounded-xl text-[var(--text-muted)]">
              {isDark ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
        <div className="w-full max-w-md mt-12 lg:mt-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-[var(--text-muted)]">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ text }: { text: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-[var(--bg)] px-3 text-[var(--text-muted)]">{text}</span>
      </div>
    </div>
  );
}

// ─── PasswordInput — InputField with show/hide toggle ────────────────────────
function PasswordInput({ showPw, onToggle, ...props }: any & { showPw: boolean; onToggle: () => void }) {
  return (
    <InputField
      {...props}
      icon={Lock}
      type={showPw ? 'text' : 'password'}
      rightElement={
        <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-0.5"
          onClick={onToggle} aria-label={showPw ? 'Hide password' : 'Show password'}>
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
interface LoginFormData { email: string; phone: string; password: string; }

export function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [mode, setMode]       = useState<'email' | 'phone'>('email');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = mode === 'email'
        ? await authApi.login({ email: data.email, password: data.password })
        : await authApi.loginPhone({ phone: data.phone, password: data.password });
      const { accessToken, refreshToken, user } = res.data;
      login(user, { accessToken, refreshToken });
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate(user.role === 'ADMIN' ? ROUTES.ADMIN : ROUTES.DASHBOARD);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your PayVault account">
      <TabBar className="mb-6">
        <TabButton active={mode === 'email'} onClick={() => setMode('email')} icon={<Mail className="w-3.5 h-3.5" />}>Email</TabButton>
        <TabButton active={mode === 'phone'} onClick={() => setMode('phone')} icon={<Phone className="w-3.5 h-3.5" />}>Phone</TabButton>
      </TabBar>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {mode === 'email'
          ? <InputField label="Email address" icon={Mail} type="email" placeholder="you@example.com" error={errors.email}
              {...register('email', VALIDATION.email)} />
          : <InputField label="Phone number" icon={Phone} type="tel" placeholder="10-digit number" error={errors.phone}
              {...register('phone', VALIDATION.phone)} />
        }

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Password</label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-cyan-500 hover:text-cyan-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <PasswordInput label="" placeholder="••••••••" showPw={showPw} onToggle={() => setShowPw((v) => !v)}
            error={errors.password} {...register('password', { required: 'Password is required' })} />
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30">
          Sign in
        </Button>
      </form>

      <Divider text="Don't have an account?" />

      <LinkButton href={ROUTES.SIGNUP} variant="secondary" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
        Create free account
      </LinkButton>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        By signing in you agree to our{' '}
        <a href="#" className="text-cyan-500 hover:underline">Terms</a>{' '}and{' '}
        <a href="#" className="text-cyan-500 hover:underline">Privacy Policy</a>
      </p>
    </AuthShell>
  );
}

// ─── SignupPage ───────────────────────────────────────────────────────────────
interface SignupFormData { fullName: string; email: string; phone: string; password: string; }

export function SignupPage() {
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [step, setStep]       = useState<1 | 2>(1);
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupFormData>();
  const passwordValue = watch('password', '');

  const onSubmit = async (data: SignupFormData) => {
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
        <InputField label="Full name" icon={User} placeholder="John Doe" error={errors.fullName}
          {...register('fullName', VALIDATION.fullName)} />
        <InputField label="Email address" icon={Mail} type="email" placeholder="you@example.com" error={errors.email}
          {...register('email', VALIDATION.email)} />
        <InputField label="Phone number" icon={Phone} type="tel" placeholder="10-digit number" error={errors.phone}
          {...register('phone', VALIDATION.phone)} />
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

      <Divider text="Already have an account?" />
      <LinkButton href={ROUTES.LOGIN} variant="secondary" fullWidth>Sign in instead</LinkButton>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        By creating an account you agree to our{' '}
        <a href="#" className="text-cyan-500 hover:underline">Terms</a> and{' '}
        <a href="#" className="text-cyan-500 hover:underline">Privacy Policy</a>
      </p>
    </AuthShell>
  );
}

// ─── ForgotPasswordPage ───────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(1);
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);

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

  const steps = [{ num: 1, label: 'Email' }, { num: 2, label: 'Verify' }, { num: 3, label: 'Reset' }];

  return (
    <AuthShell title="Reset your password" subtitle="We'll help you get back in">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
              ${step > s.num ? 'bg-emerald-500 text-white' : step === s.num ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]'}`}>
              {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs font-medium ${step === s.num ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`h-px flex-1 ${step > s.num ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />}
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
