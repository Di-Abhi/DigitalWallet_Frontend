import { useState, useEffect } from 'react';
import { isWalletNotFound } from '../../core/api/types';
import { LoadingPage } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useAuth } from '../../store/AuthContext';
import { userApi }   from '../../core/api/userApi';
import { walletApi } from '../../core/api/walletApi';
import { rewardsApi } from '../../core/api/rewardApi';
import NoWalletBanner from '../../shared/components/NoWalletBanner';
import { DashboardBalanceCard } from './components/DashboardBalanceCard';
import { DashboardStats }      from './components/DashboardStats';
import { RecentTransactions }  from './components/RecentTransactions';

interface Balance     { balance: number; status: string; }
interface Transaction { id: number; type: string; amount: number; status: string; description?: string; referenceId?: string; createdAt?: string; }
interface Rewards     { points: number; tier: string; nextTier?: string; pointsToNextTier?: number; }
type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'REJECTED' | 'APPROVED' | null;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [balance, setBalance]     = useState<Balance | null>(null);
  const [recentTx, setRecentTx]   = useState<Transaction[]>([]);
  const [rewards, setRewards]     = useState<Rewards | null>(null);
  const [loading, setLoading]     = useState(true);
  const [walletMissing, setWalletMissing] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus>(null);

  useEffect(() => {
    (async () => {
      try {
        const kycRes = await userApi.kycStatus().catch(() => null);
        if (kycRes) setKycStatus(kycRes.data?.data?.status ?? null);

        const [bRes, txRes, rRes] = await Promise.allSettled([
          walletApi.balance(),
          walletApi.transactions(0, 5),
          rewardsApi.summary(),
        ]);

        if (bRes.status === 'rejected') {
          if (isWalletNotFound(bRes.reason)) { setWalletMissing(true); setLoading(false); return; }
          toast.error('Failed to load wallet balance');
        } else { setBalance(bRes.value.data.data); }

        if (txRes.status === 'fulfilled') setRecentTx(txRes.value.data.content || []);
        if (rRes.status  === 'fulfilled') setRewards(rRes.value.data.data);
      } catch { toast.error('Failed to load dashboard data'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingPage />;

  const firstName = user?.fullName?.split(' ')[0];

  if (walletMissing) return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Good {greeting()}, {firstName}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Let's get your wallet set up.</p>
      </div>
      <NoWalletBanner kycStatus={kycStatus} variant="page" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Good {greeting()}, {firstName}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Here's what's happening with your wallet today.</p>
      </div>

      <DashboardBalanceCard balance={balance?.balance ?? 0} status={balance?.status ?? 'Active'} />
      <DashboardStats rewards={rewards} recentTx={recentTx} />
      <RecentTransactions transactions={recentTx} />
    </div>
  );
}
