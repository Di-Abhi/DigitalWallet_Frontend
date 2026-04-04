import { Wallet, Zap, Gift, Shield, Sun, Moon } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../store/ThemeContext';

interface Props { children: React.ReactNode; title: string; subtitle: string; }

export function AuthShell({ children, title, subtitle }: Props) {
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
              { icon: Zap,    text: 'Instant transfers with zero fees',  color: 'text-cyan-400' },
              { icon: Gift,   text: 'Earn cashback on every transaction', color: 'text-purple-400' },
              { icon: Shield, text: '256-bit encrypted & KYC verified',  color: 'text-emerald-400' },
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
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
