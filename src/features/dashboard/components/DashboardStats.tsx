import { Gift, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { StatCard } from '../../../shared/components/UI';
import { formatCurrency as fmt } from '../../../shared/utils';
import { useAuth } from '../../../store/AuthContext';
import { getDirection } from '../../transactions/types';
import type { Transaction } from '../../transactions/types';

interface Rewards {
  points: number;
  tier: string;
  nextTier?: string;
  pointsToNextTier?: number;
}

interface Props {
  rewards:  Rewards | null;
  recentTx: Transaction[];
}

const TIER_COLORS: Record<string, string> = {
  SILVER: 'text-slate-400', GOLD: 'text-yellow-400',
  PLATINUM: 'text-cyan-400', BRONZE: 'text-orange-400',
};

export function DashboardStats({ rewards, recentTx }: Props) {
  const { user }      = useAuth();
  const currentUserId = user?.id ?? null;

  // Use user-aware getDirection so TRANSFER received shows as credit
  const credits = recentTx
    .filter((t) => getDirection(t.type, currentUserId, t.senderId) === 'received')
    .reduce((s, t) => s + t.amount, 0);

  const debits = recentTx
    .filter((t) => getDirection(t.type, currentUserId, t.senderId) === 'sent')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Gift}
        label="Reward Points"
        value={rewards?.points?.toLocaleString() || '0'}
        color="cyan"
        sub={
          <span className={`font-semibold ${TIER_COLORS[rewards?.tier ?? ''] || 'text-slate-400'}`}>
            {rewards?.tier || 'BRONZE'} Tier
          </span> as unknown as string
        }
      />
      <StatCard
        icon={TrendingUp}
        label="Points to Next Tier"
        value={rewards?.pointsToNextTier?.toLocaleString() || '0'}
        color="purple"
        sub={rewards?.nextTier ? `→ ${rewards.nextTier}` : 'Max tier!'}
      />
      <StatCard icon={ArrowDownLeft} label="Recent Credits" color="green" value={fmt(credits)} />
      <StatCard icon={ArrowUpRight}  label="Recent Debits"  color="red"   value={fmt(debits)} />
    </div>
  );
}
