import { Link } from 'react-router-dom';
import {
  Wallet, Shield, Zap, Gift, ArrowRight, Star, CheckCircle,
  Send, TrendingUp, Lock, Smartphone, Globe, ExternalLink,
  Mail, Phone, ChevronRight, Award, Users, CreditCard, Share2
} from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';

// ─── Navbar ───────────────────────────────────────────────────────────────────
function LandingNavbar() {
  const { isDark, toggle } = useTheme();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-none">PayVault</div>
              <div className="text-xs text-[var(--text-muted)]">Digital Wallet</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Security', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-medium">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost p-2 rounded-xl text-sm">
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn-secondary text-sm px-4 py-2 hidden sm:flex">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-2">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-500 text-sm font-semibold mb-8">
            <Zap className="w-3.5 h-3.5" />
            India's fastest digital wallet
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Your money,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
              your vault
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Send, receive, and manage your money with ease. Earn rewards on every transaction,
            stay secure with bank-grade encryption, and unlock your financial freedom.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/signup"
              className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">
              <span>Create free account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2">
              Sign in <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '2M+', label: 'Active Users' },
              { value: '₹500Cr+', label: 'Transactions' },
              { value: '4.9★', label: 'App Rating' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-cyan-500">{s.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="card shadow-2xl shadow-cyan-500/10 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-medium opacity-90">
                  <Wallet className="w-4 h-4" /> PayVault Balance
                </div>
                <span className="text-xs opacity-75 bg-white/20 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="text-4xl font-bold font-mono mb-1">₹24,850.00</div>
              <div className="text-sm opacity-80">Available balance</div>
            </div>
            {/* Card Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Send, label: 'Send', color: 'text-cyan-500' },
                  { icon: CreditCard, label: 'Add Money', color: 'text-emerald-500' },
                  { icon: Gift, label: 'Rewards', color: 'text-purple-500' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div className={`${color} p-2 rounded-lg bg-current/10`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Sent to Priya', amount: '-₹500', type: 'debit', time: '2 min ago' },
                  { label: 'Cashback earned', amount: '+₹25', type: 'credit', time: '1 hr ago' },
                  { label: 'Top-up via Razorpay', amount: '+₹2,000', type: 'credit', time: 'Yesterday' },
                ].map((tx) => (
                  <div key={tx.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div>
                      <div className="text-sm font-medium">{tx.label}</div>
                      <div className="text-xs text-[var(--text-muted)]">{tx.time}</div>
                    </div>
                    <span className={`font-mono font-semibold text-sm ${tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: Send,
      title: 'Instant Transfers',
      desc: 'Send money to anyone in seconds. Real-time transfers with zero processing fees between PayVault users.',
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
    },
    {
      icon: Gift,
      title: 'Rewards & Cashback',
      desc: 'Earn reward points on every transaction. Redeem for cashback, vouchers, or exclusive deals.',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      desc: 'Military-grade encryption, 2FA, and real-time fraud detection keep your money safe 24/7.',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      desc: 'Visualize spending patterns, download statements, and stay on top of your financial health.',
      color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/40',
    },
    {
      icon: Smartphone,
      title: 'Razorpay Top-Up',
      desc: "Add money instantly via UPI, cards, or net banking powered by Razorpay's secure gateway.",
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      icon: Award,
      title: 'Loyalty Tiers',
      desc: 'Level up from Bronze to Platinum. Higher tiers unlock better cashback rates and exclusive perks.',
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text-muted)] mb-4">
            <Star className="w-3.5 h-3.5 text-yellow-400" /> Everything you need
          </div>
          <h2 className="text-4xl font-bold mb-4">Packed with powerful features</h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            From instant transfers to smart rewards — PayVault gives you the tools to manage your money like a pro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className={`inline-flex p-3 rounded-2xl ${f.color} mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Security Section ─────────────────────────────────────────────────────────
function SecuritySection() {
  const items = [
    'End-to-end encryption for all transactions',
    'Two-factor authentication (2FA)',
    'Real-time fraud detection & alerts',
    'KYC verification for compliance',
    'Session management & auto-logout',
    'Idempotency keys prevent duplicate transactions',
  ];

  return (
    <section id="security" className="py-24 bg-[var(--bg-card)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-6">
              <Lock className="w-3.5 h-3.5" /> Security first
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Your money is <span className="text-cyan-500">always protected</span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg mb-8 leading-relaxed">
              We've built PayVault with security at every layer. From the moment you sign up to every transaction you make, your data and funds are protected.
            </p>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">256-bit Encrypted</h3>
              <p className="text-[var(--text-muted)] text-center text-sm mb-8">
                Same level of security used by leading banks and financial institutions worldwide.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: '99.9%', label: 'Uptime SLA' },
                  { value: '0', label: 'Breaches' },
                  { value: '24/7', label: 'Monitoring' },
                ].map((s) => (
                  <div key={s.label} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <div className="font-bold text-emerald-500">{s.value}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing / Plans ──────────────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      desc: 'Perfect to get started',
      features: ['₹10,000 monthly limit', 'Instant transfers', 'Basic rewards', 'Email support'],
      cta: 'Get started',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '₹99/mo',
      desc: 'For power users',
      features: ['Unlimited transfers', 'Priority support', 'Higher cashback rates', 'Advanced analytics', 'KYC fast-track'],
      cta: 'Start free trial',
      highlight: true,
    },
    {
      name: 'Business',
      price: '₹499/mo',
      desc: 'For teams & startups',
      features: ['Team wallet management', 'API access', 'Custom rewards', 'Dedicated support', 'Bulk transfers', 'White-label option'],
      cta: 'Contact sales',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-[var(--text-muted)] text-lg">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`card p-8 flex flex-col ${p.highlight ? 'ring-2 ring-cyan-500 shadow-xl shadow-cyan-500/10 relative' : ''}`}>
              {p.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-1">{p.name}</h3>
                <p className="text-[var(--text-muted)] text-sm mb-4">{p.desc}</p>
                <div className="text-4xl font-bold">{p.price}</div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup"
                className={p.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full text-center flex items-center justify-center gap-2'}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    { name: 'Arjun Sharma', role: 'Freelance Designer', text: 'PayVault changed how I manage client payments. The rewards are a bonus!', stars: 5 },
    { name: 'Priya Mehta', role: 'Startup Founder', text: 'The speed of transfers is insane. Moved ₹50k in seconds with zero issues.', stars: 5 },
    { name: 'Rohit Verma', role: 'Software Engineer', text: 'Love the KYC flow and security features. Finally a wallet I can trust.', stars: 5 },
  ];

  return (
    <section className="py-24 bg-[var(--bg-card)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Loved by thousands</h2>
          <p className="text-[var(--text-muted)]">Here's what our users say.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-500 text-sm font-semibold mb-6">
              <Users className="w-3.5 h-3.5" /> Join 2 million users
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Start your financial journey today
            </h2>
            <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Create a free account in under 60 seconds. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-cyan-500/25">
                <span>Create free account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3.5 flex items-center justify-center gap-2">
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  const links = {
    Product: ['Features', 'Pricing', 'Security', 'Roadmap'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance'],
    Support: ['Help Center', 'Contact Us', 'Status', 'Community'],
  };

  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-base leading-none">PayVault</div>
                <div className="text-xs text-[var(--text-muted)]">Digital Wallet</div>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 max-w-xs">
              India's most trusted digital wallet. Send, receive, and grow your money with confidence.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Share2, href: '#', label: 'Twitter' },
                { icon: ExternalLink, href: '#', label: 'GitHub' },
                { icon: Users, href: '#', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-cyan-500 hover:border-cyan-500/50 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-bold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} PayVault Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> India
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <a href="mailto:support@payvault.in" className="hover:text-[var(--text)] transition-colors">
                support@payvault.in
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <a href="tel:+911800123456" className="hover:text-[var(--text)] transition-colors">
                1800-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page (composed) ──────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
