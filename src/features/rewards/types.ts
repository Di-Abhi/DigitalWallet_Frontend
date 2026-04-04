export interface RewardSummary {
  tier: string;
  points: number;
  nextTier?: string;
  pointsToNextTier?: number;
}

export interface CatalogItem {
  id: number;
  name: string;
  description?: string;
  type: string;
  pointsRequired: number;
  cashbackAmount?: number;
  tierRequired?: string;
  stock?: number;
  active: boolean;
}

export interface HistoryItem {
  id: number;
  type: string;
  points: number;
  description?: string;
  createdAt?: string;
}

export const TIER_INFO: Record<string, { color: string; label: string; min: number }> = {
  BRONZE:   { color: 'from-orange-400 to-orange-600', label: 'Bronze',   min: 0 },
  SILVER:   { color: 'from-slate-400 to-slate-600',   label: 'Silver',   min: 500 },
  GOLD:     { color: 'from-yellow-400 to-yellow-600', label: 'Gold',     min: 2000 },
  PLATINUM: { color: 'from-cyan-400 to-cyan-600',     label: 'Platinum', min: 5000 },
};
