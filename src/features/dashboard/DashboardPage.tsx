import { isWalletNotFound } from '../../core/api/types';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Send, Plus, Gift, ArrowUpRight, ArrowDownLeft, TrendingUp, Clock } from 'lucide-react';
import { userApi } from '../../core/api/userApi';
import { StatCard, StatusBadge, LoadingPage } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useAuth } from '../../store/AuthContext';
import NoWalletBanner from '../../shared/components/NoWalletBanner';
import { walletApi } from '../../core/api/walletApi';
import { rewardsApi } from '../../core/api/rewardApi';

function formatAmount(a: number | undefined | null): string {
  return `₹${Number(a || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}
function formatDate(d: string | undefined | null): string {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}


interface Balance { balance: number; status: string; }
interface Transaction {
  id: number; type: string; amount: number; status: string;
  description?: string; referenceId?: string; createdAt?: string;
}
interface Rewards {
  points: number; tier: string; nextTier?: string; pointsToNextTier?: number;
}
type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'REJECTED' | 'APPROVED' | null;

export default function DashboardPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletMissing, setWalletMissing] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch KYC status first — needed for banner context regardless
        const kycRes = await userApi.kycStatus().catch(() => null);
        if (kycRes) setKycStatus(kycRes.data?.data?.status ?? null);

        const [bRes, txRes, rRes] = await Promise.allSettled([
          walletApi.balance(),
          walletApi.transactions(0, 5),
          rewardsApi.summary(),
        ]);

        // If balance call failed, check if it's a "wallet not found" case
        if (bRes.status === 'rejected') {
          if (isWalletNotFound(bRes.reason)) {
            setWalletMissing(true);
            setLoading(false);
            return;
          }
          toast.error('Failed to load wallet balance');
        } else {
          setBalance(bRes.value.data.data);
        }

        if (txRes.status === 'fulfilled') setRecentTx(txRes.value.data.content || []);
        if (rRes.status === 'fulfilled') setRewards(rRes.value.data.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingPage />;

  // ── No wallet yet: show KYC guidance ─────────────────────────────────────
  if (walletMissing) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Let's get your wallet set up.</p>
        </div>
        <NoWalletBanner kycStatus={kycStatus} variant="page" />
      </div>
    );
  }

  // ── Normal dashboard ──────────────────────────────────────────────────────
  const tierColors: Record<string, string> = {
    SILVER: 'text-slate-400', GOLD: 'text-yellow-400',
    PLATINUM: 'text-cyan-400', BRONZE: 'text-orange-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Here's what's happening with your wallet today.</p>
      </div>

      {/* Balance card */}
      <div className="card p-6 bg-gradient-to-br from-cyan-500 to-cyan-700 text-white border-0 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute right-12 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Total Balance</span>
          </div>
          <div className="amount text-4xl font-bold mb-1">{formatAmount(balance?.balance)}</div>
          <div className="text-sm opacity-70 mb-6">Status: {balance?.status || 'Active'}</div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/wallet" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <Plus className="w-4 h-4" /> Add Money
            </Link>
            <Link to="/transfer" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <Send className="w-4 h-4" /> Send
            </Link>
            <Link to="/rewards" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <Gift className="w-4 h-4" /> Redeem
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Gift} label="Reward Points" value={rewards?.points?.toLocaleString() || '0'} color="cyan"
          sub={<span className={`font-semibold ${tierColors[rewards?.tier ?? ''] || 'text-slate-400'}`}>{rewards?.tier || 'BRONZE'} Tier</span> as unknown as string} />
        <StatCard icon={TrendingUp} label="Points to Next Tier" value={rewards?.pointsToNextTier?.toLocaleString() || '0'} color="purple"
          sub={rewards?.nextTier ? `→ ${rewards.nextTier}` : 'Max tier!'} />
        <StatCard icon={ArrowDownLeft} label="Recent Credits" color="green"
          value={formatAmount(recentTx.filter(t => ['TOPUP','CASHBACK'].includes(t.type)).reduce((s, t) => s + t.amount, 0))} />
        <StatCard icon={ArrowUpRight} label="Recent Debits" color="red"
          value={formatAmount(recentTx.filter(t => ['TRANSFER','WITHDRAW'].includes(t.type)).reduce((s, t) => s + t.amount, 0))} />
      </div>

      {/* Recent transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-cyan-500 hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {recentTx.length === 0 ? (
          <div className="py-10 text-center text-[var(--text-muted)] text-sm">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No transactions yet
          </div>
        ) : (
          <div className="space-y-3">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  ['TOPUP','CASHBACK'].includes(tx.type) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                }`}>
                  {['TOPUP','CASHBACK'].includes(tx.type) ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{tx.type}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate">{tx.description || tx.referenceId || '—'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-semibold text-sm amount ${['TOPUP','CASHBACK'].includes(tx.type) ? 'text-emerald-600' : 'text-red-500'}`}>
                    {['TOPUP','CASHBACK'].includes(tx.type) ? '+' : '-'}{formatAmount(tx.amount)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{formatDate(tx.createdAt)}</div>
                </div>
                <StatusBadge status={tx.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
