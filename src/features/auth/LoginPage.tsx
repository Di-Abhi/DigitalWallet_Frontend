import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { authApi } from '../../core/api/authApi';
import { toast } from '../../shared/components/Toast';
import { ROUTES } from '../../routes';
import { Button, TabButton, TabBar, LinkButton } from '../../shared/components/Button';
import { InputField } from '../../shared/components/Input';
import { VALIDATION } from '../../shared/utils';
import { AuthShell }    from './components/AuthShell';
import { AuthDivider }  from './components/AuthDivider';
import { PasswordInput } from './components/PasswordInput';

interface FormData { email: string; phone: string; password: string; }

export function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [mode, setMode]       = useState<'email' | 'phone'>('email');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
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
          ? <InputField label="Email address" icon={Mail} type="email" placeholder="you@example.com"
              error={errors.email} {...register('email', VALIDATION.email)} />
          : <InputField label="Phone number" icon={Phone} type="tel" placeholder="10-digit number"
              error={errors.phone} {...register('phone', VALIDATION.phone)} />
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

      <AuthDivider text="Don't have an account?" />
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
