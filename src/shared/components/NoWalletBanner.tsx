import { Link } from 'react-router-dom';
import {
  Wallet, Shield, FileText, ArrowRight,
  CheckCircle, Clock, XCircle, Lock
} from 'lucide-react';

type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'REJECTED' | 'APPROVED' | null;

interface NoWalletBannerProps {
  /** Pass the user's current KYC status if known, otherwise leave null */
  kycStatus?: KycStatus;
  /** Show compact inline version vs full-page */
  variant?: 'page' | 'inline';
}

/**
 * Shown whenever the backend returns a wallet-not-found error (404 / no wallet).
 * Guides the user to complete KYC so their wallet gets activated.
 */
export default function NoWalletBanner({ kycStatus = null, variant = 'page' }: NoWalletBannerProps) {

  const steps = [
    {
      icon: FileText,
      title: 'Submit KYC Documents',
      desc: 'Provide a valid government ID (Aadhaar, PAN, Passport, or Driving License) and your document number.',
      done: kycStatus !== null && kycStatus !== 'NOT_SUBMITTED',
      active: kycStatus === null || kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED',
    },
    {
      icon: Clock,
      title: 'Wait for Verification',
      desc: 'Our team reviews your documents within 24–48 hours. You will be notified once approved.',
      done: kycStatus === 'APPROVED',
      active: kycStatus === 'PENDING',
    },
    {
      icon: Wallet,
      title: 'Wallet Activated',
      desc: 'Once KYC is approved your wallet is created automatically and you can start transacting.',
      done: false,
      active: false,
    },
  ];

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bg: string }> = {
    NOT_SUBMITTED: {
      label: 'KYC Not Submitted',
      color: 'text-slate-500',
      icon: FileText,
      bg: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
    },
    PENDING: {
      label: 'KYC Under Review',
      color: 'text-yellow-600 dark:text-yellow-400',
      icon: Clock,
      bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    },
    REJECTED: {
      label: 'KYC Rejected — Resubmit Required',
      color: 'text-red-600 dark:text-red-400',
      icon: XCircle,
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    },
    APPROVED: {
      label: 'KYC Approved',
      color: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    },
  };

  const status = kycStatus ?? 'NOT_SUBMITTED';
  const cfg = statusConfig[status] || statusConfig.NOT_SUBMITTED;
  const StatusIcon = cfg.icon;

  /* ── Inline variant (used inside DashboardPage balance card area) ── */
  if (variant === 'inline') {
    return (
      <div className={`card border p-5 ${cfg.bg}`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-0.5">
            <StatusIcon className={`w-6 h-6 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</p>
            <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
              {status === 'PENDING'
                ? 'Your KYC is being reviewed. Your wallet will be activated automatically once approved (24–48 hrs).'
                : status === 'REJECTED'
                ? 'Your KYC was rejected. Please resubmit with correct documents to activate your wallet.'
                : 'Your wallet is not active yet. Complete KYC verification to unlock it.'}
            </p>
            {status !== 'PENDING' && (
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-cyan-500 hover:text-cyan-400 hover:underline transition-colors"
              >
                {status === 'REJECTED' ? 'Resubmit KYC' : 'Submit KYC Now'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Full page variant ── */
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">

      {/* Hero card */}
      <div className="card p-8 mb-6 text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          {/* Locked wallet icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Wallet Not Activated</h2>
          <p className="text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Your wallet will be created automatically once your KYC is verified.
            This is a one-time process required by RBI guidelines.
          </p>

          {/* Current KYC status badge */}
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
            <StatusIcon className="w-4 h-4" />
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-base mb-6">How to activate your wallet</h3>
        <div className="space-y-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-4">
                {/* Step indicator column */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all
                    ${step.done
                      ? 'bg-emerald-500 text-white'
                      : step.active
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]'
                    }`}>
                    {step.done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 min-h-8 transition-all ${step.done ? 'bg-emerald-400' : 'bg-[var(--border)]'}`} />
                  )}
                </div>

                {/* Step content */}
                <div className={`pb-6 flex-1 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                  <p className={`font-semibold text-sm mb-1 ${step.active ? 'text-cyan-600 dark:text-cyan-400' : step.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    {step.title}
                    {step.active && <span className="ml-2 text-xs font-normal opacity-70">← You are here</span>}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      {status !== 'PENDING' && (
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold">
                {status === 'REJECTED' ? 'Resubmit your KYC documents' : 'Ready to get started?'}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {status === 'REJECTED'
                  ? 'Please ensure your documents are clear and valid before resubmitting.'
                  : 'Submit your KYC in under 2 minutes. We support Aadhaar, PAN, Passport & more.'}
              </p>
            </div>
            <Link to="/profile" className="btn-primary shrink-0">
              <Shield className="w-4 h-4" />
              {status === 'REJECTED' ? 'Resubmit KYC' : 'Submit KYC Now'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Pending message */}
      {status === 'PENDING' && (
        <div className="card p-6 text-center">
          <Clock className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
          <p className="font-bold text-yellow-600 dark:text-yellow-400">Verification in Progress</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            We're reviewing your documents. You'll receive a notification once your wallet is activated (usually within 24–48 hours).
          </p>
        </div>
      )}
    </div>
  );
}
