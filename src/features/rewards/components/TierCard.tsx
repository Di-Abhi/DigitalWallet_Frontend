import { Award, Zap } from 'lucide-react';
import { TIER_INFO, type RewardSummary } from '../types';

interface Props {
  summary:          RewardSummary;
  onRedeemAsCash:   () => void;
}

export function TierCard({ summary, onRedeemAsCash }: Props) {
  const tier     = summary.tier || 'BRONZE';
  const tierInfo = TIER_INFO[tier] || TIER_INFO.BRONZE;
  const progress = summary.nextTier
    ? Math.min(100, Math.round(
        ((summary.points - (TIER_INFO[tier]?.min || 0)) /
        ((summary.pointsToNextTier ?? 0) + summary.points - (TIER_INFO[tier]?.min || 0))) * 100,
      ))
    : 100;

  return (
    <div className={`card p-6 bg-gradient-to-br ${tierInfo.color} text-white border-0 relative overflow-hidden`}>
      <div className="absolute right-4 top-4 opacity-10"><Award className="w-24 h-24" /></div>
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6" />
          <span className="font-bold text-lg">{tierInfo.label} Member</span>
        </div>
        <div className="amount text-4xl font-bold mb-1">{summary.points?.toLocaleString() || 0}</div>
        <div className="text-sm opacity-80 mb-4">Available Points • 1 pt = ₹1</div>

        {summary.nextTier && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1 opacity-80">
              <span>{tierInfo.label}</span>
              <span>{summary.nextTier} ({summary.pointsToNextTier} pts away)</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          onClick={onRedeemAsCash}
        >
          <Zap className="w-4 h-4" /> Redeem as Cash
        </button>
      </div>
    </div>
  );
}
