import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Wallet, Eye, EyeOff, ArrowRight, Mail, Phone, Lock, User } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { authApi } from '../../core/api/services';
import { toast } from '../../shared/components/Toast';
import { Spinner } from '../../shared/components/UI';
import { useTheme } from '../../store/ThemeContext';

function AuthShell({ children, title, subtitle }) {
  const { isDark, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-none">PayVault</div>
              <div className="text-xs text-[var(--text-muted)]">Digital Wallet</div>
            </div>
          </div>
          <button className="btn-ghost p-2 rounded-xl text-[var(--text-muted)]" onClick={toggle}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="card shadow-xl p-8">
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-[var(--text-muted)] text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon: Icon, error, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />}
        <input className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500/50' : ''}`} {...props} />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState('email'); // email | phone
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your PayVault account">
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {['email', 'phone'].map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${mode === m ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-[var(--text-muted)]'}`}>
            {m === 'email' ? <Mail className="w-3.5 h-3.5 inline mr-1.5" /> : <Phone className="w-3.5 h-3.5 inline mr-1.5" />}
            {m}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === 'email' ? (
          <InputGroup label="Email" icon={Mail} type="email" placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })} />
        ) : (
          <InputGroup label="Phone" icon={Phone} type="tel" placeholder="10-digit number"
            error={errors.phone?.message}
            {...register('phone', { required: 'Phone is required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })} />
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-cyan-500 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              type={showPw ? 'text' : 'password'} placeholder="••••••••"
              {...register('password', { required: 'Password is required' })} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0.5"
              onClick={() => setShowPw((v) => !v)}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
          {loading ? <Spinner size="sm" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        No account?{' '}
        <Link to="/signup" className="text-cyan-500 font-semibold hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}

// ─── Signup ───────────────────────────────────────────────────────────────────
export function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [email, setEmail] = useState('');
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();
  const [otp, setOtp] = useState('');
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.signup(data);
      setEmail(data.email);
      toast.info('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp });
      const { accessToken, refreshToken, user } = res.data;
      login(user, { accessToken, refreshToken });
      toast.success('Account created! Welcome to PayVault 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <AuthShell title="Verify your email" subtitle={`We sent a code to ${email}`}>
        <div className="space-y-4">
          <InputGroup label="OTP Code" icon={Mail} type="text" placeholder="Enter OTP"
            value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={8} />
          <button className="btn-primary w-full" onClick={verifyOtp} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Verify & Create Account'}
          </button>
          <button className="btn-ghost w-full text-center text-sm" onClick={() => setStep(1)}>← Back</button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create account" subtitle="Join PayVault in seconds">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputGroup label="Full Name" icon={User} placeholder="John Doe" error={errors.fullName?.message}
          {...register('fullName', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })} />
        <InputGroup label="Email" icon={Mail} type="email" placeholder="you@example.com" error={errors.email?.message}
          {...register('email', { required: 'Email is required' })} />
        <InputGroup label="Phone" icon={Phone} type="tel" placeholder="10-digit number" error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required', pattern: { value: /^[0-9]{10,15}$/, message: 'Invalid phone' } })} />
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input className="input-field pl-10 pr-10" type={showPw ? 'text' : 'password'} placeholder="Min 8 chars with uppercase, number & symbol"
              {...register('password', {
                required: 'Password is required',
                pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, message: 'Must contain uppercase, number & symbol' },
                minLength: { value: 8, message: 'Min 8 characters' }
              })} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0.5" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-cyan-500 font-semibold hover:underline">Sign in</Link>
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
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotSendOtp({ email });
      toast.info('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await authApi.forgotVerifyOtp({ email, otp });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const resetPw = async () => {
    setLoading(true);
    try {
      await authApi.resetPassword({ resetToken, newPassword: password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Reset password" subtitle="We'll help you get back in">
      <div className="space-y-4">
        {step >= 1 && (
          <InputGroup label="Email" icon={Mail} type="email" placeholder="your@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={step > 1} />
        )}
        {step === 1 && (
          <button className="btn-primary w-full" onClick={sendOtp} disabled={loading || !email}>
            {loading ? <Spinner size="sm" /> : 'Send OTP'}
          </button>
        )}

        {step >= 2 && (
          <InputGroup label="OTP Code" icon={Mail} type="text" placeholder="Enter OTP"
            value={otp} onChange={(e) => setOtp(e.target.value)} disabled={step > 2} />
        )}
        {step === 2 && (
          <button className="btn-primary w-full" onClick={verifyOtp} disabled={loading || !otp}>
            {loading ? <Spinner size="sm" /> : 'Verify OTP'}
          </button>
        )}

        {step === 3 && (
          <>
            <InputGroup label="New Password" icon={Lock} type="password" placeholder="Strong password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn-primary w-full" onClick={resetPw} disabled={loading || !password}>
              {loading ? <Spinner size="sm" /> : 'Reset Password'}
            </button>
          </>
        )}

        <Link to="/login" className="btn-ghost w-full text-center text-sm block">← Back to login</Link>
      </div>
    </AuthShell>
  );
}
