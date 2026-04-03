import { useState, InputHTMLAttributes } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, FieldError } from 'react-hook-form';
import {
  Wallet, Eye, EyeOff, ArrowRight, Mail, Phone, Lock, User,
  Shield, CheckCircle, Zap, Gift
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { authApi } from '../../core/api/authApi';
import { toast } from '../../shared/components/Toast';
import { Spinner } from '../../shared/components/UI';
import { useTheme } from '../../store/ThemeContext';

// ─── Auth Shell ───────────────────────────────────────────────────────────────
interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  illustration?: React.ReactNode;
}

function AuthShell({ children, title, subtitle }: AuthShellProps) {
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Ambient effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg text-white leading-none">PayVault</div>
            <div className="text-xs text-slate-400">Digital Wallet</div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your money,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">
              supercharged
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Instant transfers, smart rewards, and bank-grade security — all in one place.
          </p>

          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Instant transfers with zero fees', color: 'text-cyan-400' },
              { icon: Gift, text: 'Earn cashback on every transaction', color: 'text-purple-400' },
              { icon: Shield, text: '256-bit encrypted & KYC verified', color: 'text-emerald-400' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3">
                <div className={`${color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust badges */}
        <div className="relative flex items-center gap-6">
          {[
            { value: '2M+', label: 'Users' },
            { value: '₹500Cr+', label: 'Processed' },
            { value: '4.9★', label: 'Rating' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold text-cyan-400">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 relative">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">PayVault</span>
          </div>
          <div className="ml-auto">
            <button onClick={toggle} className="btn-ghost p-2 rounded-xl text-[var(--text-muted)] text-sm">
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Form card */}
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

// ─── Input Group ──────────────────────────────────────────────────────────────
interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
  error?: FieldError | { message?: string };
  rightElement?: React.ReactNode;
}

function InputGroup({ label, icon: Icon, error, rightElement, ...props }: InputGroupProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />}
        <input
          className={`input-field ${Icon ? 'pl-10' : ''} ${rightElement ? 'pr-12' : ''} ${error ? 'border-red-500 focus:ring-red-500/50' : ''}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">{error.message}</p>}
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Symbol', ok: /[@$!%*?&]/.test(password) },
    { label: '8+ chars', ok: password.length >= 8 },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {checks.map((c) => (
            <div key={c.label} className={`flex items-center gap-1 text-xs ${c.ok ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
              <CheckCircle className={`w-3 h-3 ${c.ok ? '' : 'opacity-40'}`} />
              {c.label}
            </div>
          ))}
        </div>
        <span className={`text-xs font-semibold ${colors[score - 1]?.replace('bg-', 'text-') || 'text-[var(--text-muted)]'}`}>
          {score > 0 ? labels[score - 1] : ''}
        </span>
      </div>
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/, '');
            const arr = value.split('');
            arr[i] = char;
            onChange(arr.join('').slice(0, 6));
            if (char && e.target.nextElementSibling) {
              (e.target.nextElementSibling as HTMLInputElement).focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && e.currentTarget.previousElementSibling) {
              (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
            }
          }}
          className="w-11 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-slate-800/80 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
      ))}
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
interface LoginFormData {
  email: string;
  phone: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      let res;
      if (mode === 'email') {
        res = await authApi.login({ email: data.email, password: data.password });
      } else {
        res = await authApi.loginPhone({ phone: data.phone, password: data.password });
      }
      const { accessToken, refreshToken, user } = res.data;
      login(user, { accessToken, refreshToken });
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your PayVault account">
      {/* Mode toggle */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {(['email', 'phone'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all capitalize
              ${mode === m ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            {m === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            {m === 'email' ? 'Email' : 'Phone'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {mode === 'email' ? (
          <InputGroup label="Email address" icon={Mail} type="email" placeholder="you@example.com"
            error={errors.email}
            {...register('email', { required: 'Email is required' })} />
        ) : (
          <InputGroup label="Phone number" icon={Phone} type="tel" placeholder="10-digit number"
            error={errors.phone}
            {...register('phone', {
              required: 'Phone is required',
              pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' }
            })} />
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-cyan-500 hover:text-cyan-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <InputGroup
            label=""
            icon={Lock}
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password}
            rightElement={
              <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-0.5"
                onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password', { required: 'Password is required' })}
          />
        </div>

        <button type="submit"
          className="btn-primary w-full py-3 text-base shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all"
          disabled={loading}>
          {loading ? <Spinner size="sm" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--bg)] px-3 text-[var(--text-muted)]">Don't have an account?</span>
        </div>
      </div>

      <Link to="/signup"
        className="btn-secondary w-full text-center flex items-center justify-center gap-2">
        Create free account <ArrowRight className="w-4 h-4" />
      </Link>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        By signing in you agree to our{' '}
        <a href="#" className="text-cyan-500 hover:underline">Terms</a>{' '}and{' '}
        <a href="#" className="text-cyan-500 hover:underline">Privacy Policy</a>
      </p>
    </AuthShell>
  );
}

// ─── Signup Page ──────────────────────────────────────────────────────────────
interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupFormData>();
  const { login } = useAuth();
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
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) return toast.error('Enter the complete 6-digit OTP');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp });
      const { accessToken, refreshToken, user } = res.data;
      login(user, { accessToken, refreshToken });
      toast.success('Account created! Welcome to PayVault 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
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

          <button className="btn-primary w-full py-3 text-base shadow-lg shadow-cyan-500/20"
            onClick={verifyOtp} disabled={loading || otp.length < 6}>
            {loading ? <Spinner size="sm" /> : <><CheckCircle className="w-4 h-4" /> Verify & Create Account</>}
          </button>

          <button className="btn-ghost w-full text-center text-sm py-2" onClick={() => setStep(1)}>
            ← Back to signup
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create account" subtitle="Join 2 million users on PayVault">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputGroup label="Full name" icon={User} placeholder="John Doe" error={errors.fullName}
          {...register('fullName', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Min 2 characters' }
          })} />

        <InputGroup label="Email address" icon={Mail} type="email" placeholder="you@example.com"
          error={errors.email}
          {...register('email', { required: 'Email is required' })} />

        <InputGroup label="Phone number" icon={Phone} type="tel" placeholder="10-digit number"
          error={errors.phone}
          {...register('phone', {
            required: 'Phone is required',
            pattern: { value: /^[0-9]{10,15}$/, message: 'Invalid phone number' }
          })} />

        <div>
          <InputGroup
            label="Password"
            icon={Lock}
            type={showPw ? 'text' : 'password'}
            placeholder="Min 8 chars with uppercase, number & symbol"
            error={errors.password}
            rightElement={
              <button type="button"
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-0.5"
                onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password', {
              required: 'Password is required',
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message: 'Must contain uppercase, number & symbol'
              },
              minLength: { value: 8, message: 'Min 8 characters' }
            })}
          />
          <PasswordStrength password={passwordValue} />
        </div>

        <button type="submit"
          className="btn-primary w-full py-3 text-base shadow-lg shadow-cyan-500/20 mt-2"
          disabled={loading}>
          {loading ? <Spinner size="sm" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--bg)] px-3 text-[var(--text-muted)]">Already have an account?</span>
        </div>
      </div>

      <Link to="/login" className="btn-secondary w-full text-center flex items-center justify-center gap-2">
        Sign in instead
      </Link>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        By creating an account you agree to our{' '}
        <a href="#" className="text-cyan-500 hover:underline">Terms</a> and{' '}
        <a href="#" className="text-cyan-500 hover:underline">Privacy Policy</a>
      </p>
    </AuthShell>
  );
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotSendOtp({ email });
      toast.info('OTP sent to your email');
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await authApi.forgotVerifyOtp({ email, otp });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const resetPw = async () => {
    setLoading(true);
    try {
      await authApi.resetPassword({ resetToken, newPassword: password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  const stepMeta = [
    { num: 1, label: 'Email' },
    { num: 2, label: 'Verify' },
    { num: 3, label: 'Reset' },
  ];

  return (
    <AuthShell title="Reset your password" subtitle="We'll help you get back in">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepMeta.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
              ${step > s.num ? 'bg-emerald-500 text-white' : step === s.num ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]'}`}>
              {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs font-medium ${step === s.num ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
              {s.label}
            </span>
            {i < stepMeta.length - 1 && (
              <div className={`h-px flex-1 ${step > s.num ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {/* Step 1 */}
        {step === 1 && (
          <>
            <InputGroup label="Email address" icon={Mail} type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-primary w-full py-3" onClick={sendOtp} disabled={loading || !email}>
              {loading ? <Spinner size="sm" /> : <><Mail className="w-4 h-4" /> Send OTP</>}
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-[var(--text-muted)]">
              Code sent to <span className="font-semibold text-[var(--text)]">{email}</span>
            </div>
            <div>
              <label className="label text-center block mb-4">Enter 6-digit OTP</label>
              <OtpInput value={otp} onChange={setOtp} />
            </div>
            <button className="btn-primary w-full py-3" onClick={verifyOtp}
              disabled={loading || otp.length < 6}>
              {loading ? <Spinner size="sm" /> : 'Verify OTP'}
            </button>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  className="input-field pl-10 pr-12"
                  type={showPw ? 'text' : 'password'}
                  placeholder="New strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-0.5"
                  onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>
            <button className="btn-primary w-full py-3" onClick={resetPw}
              disabled={loading || !password}>
              {loading ? <Spinner size="sm" /> : <><CheckCircle className="w-4 h-4" /> Reset Password</>}
            </button>
          </>
        )}

        <Link to="/login" className="btn-ghost w-full text-center text-sm flex items-center justify-center gap-1">
          ← Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
