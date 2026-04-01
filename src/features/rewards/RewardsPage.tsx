import { useState, useEffect } from 'react';
import { Gift, Star, Zap, Award, ShoppingBag, RefreshCw } from 'lucide-react';
import { rewardsApi } from '../../core/api/services';
import { Modal, StatusBadge, LoadingPage, EmptyState } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useNotifications } from '../../store/NotificationContext';

function fmt(a: number | string): string {
  return `₹${Number(a || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

const TIER_INFO: Record<string, { color: string; label: string; min: number }> = {
  BRONZE: { color: 'from-orange-400 to-orange-600', label: 'Bronze', min: 0 },
  SILVER: { color: 'from-slate-400 to-slate-600', label: 'Silver', min: 500 },
  GOLD: { color: 'from-yellow-400 to-yellow-600', label: 'Gold', min: 2000 },
  PLATINUM: { color: 'from-cyan-400 to-cyan-600', label: 'Platinum', min: 5000 },
};

const TYPE_ICONS: Record<string, React.ElementType> = { CASHBACK: Zap, COUPON: ShoppingBag, VOUCHER: Gift };

interface RewardSummary {
  tier: string;
  points: number;
  nextTier?: string;
  pointsToNextTier?: number;
}
interface CatalogItem {
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
interface HistoryItem {
  id: number;
  type: string;
  points: number;
  description?: string;
  createdAt?: string;
}

export default function RewardsPage() {
  const { addNotification } = useNotifications();
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemModal, setRedeemModal] = useState<CatalogItem | null>(null);
  const [redeemPtsModal, setRedeemPtsModal] = useState(false);
  const [ptsToRedeem, setPtsToRedeem] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState<'catalog' | 'history'>('catalog');

  const load = async () => {
    try {
      const [sRes, cRes, hRes] = await Promise.allSettled([
        rewardsApi.summary(),
        rewardsApi.catalog(),
        rewardsApi.transactions(),
      ]);
      if (sRes.status === 'fulfilled') setSummary(sRes.value.data.data);
      if (cRes.status === 'fulfilled') setCatalog(cRes.value.data.data || []);
      if (hRes.status === 'fulfilled') setHistory(hRes.value.data.data || []);
    } catch { toast.error('Failed to load rewards'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRedeem = async (item: CatalogItem) => {
    setActionLoading(true);
    try {
      const res = await rewardsApi.redeem({ rewardId: item.id });
      const data = res.data.data;
      toast.success(`Redeemed! ${data.couponCode ? `Coupon: ${data.couponCode}` : 'Cashback credited.'}`);
      addNotification({ title: 'Reward Redeemed!', message: `${item.name} redeemed successfully`, type: 'success' });
      setRedeemModal(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally { setActionLoading(false); }
  };

  const handleRedeemPoints = async () => {
    const pts = Number(ptsToRedeem);
    if (!pts || pts < 1) return toast.error('Enter valid points');
    setActionLoading(true);
    try {
      await rewardsApi.redeemPoints(pts);
      toast.success(`${pts} points redeemed as ${fmt(pts)}!`);
      addNotification({ title: 'Points Redeemed', message: `${pts} points → ${fmt(pts)} wallet credit`, type: 'success' });
      setRedeemPtsModal(false);
      setPtsToRedeem('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally { setActionLoading(false); }
  };

  if (loading) return <LoadingPage />;

  const tier = summary?.tier || 'BRONZE';
  const tierInfo = TIER_INFO[tier] || TIER_INFO.BRONZE;
  const progress = summary?.nextTier
    ? Math.min(100, Math.round(((summary.points - (TIER_INFO[tier]?.min || 0)) /
        ((summary.pointsToNextTier ?? 0) + summary.points - (TIER_INFO[tier]?.min || 0))) * 100))
    : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rewards & Loyalty</h1>
        <button className="btn-ghost p-2" onClick={load}><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Tier card */}
      <div className={`card p-6 bg-gradient-to-br ${tierInfo.color} text-white border-0 relative overflow-hidden`}>
        <div className="absolute right-4 top-4 opacity-10"><Award className="w-24 h-24" /></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6" />
            <span className="font-bold text-lg">{tierInfo.label} Member</span>
          </div>
          <div className="amount text-4xl font-bold mb-1">{summary?.points?.toLocaleString() || 0}</div>
          <div className="text-sm opacity-80 mb-4">Available Points • 1 pt = ₹1</div>

          {summary?.nextTier && (
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

          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              onClick={() => setRedeemPtsModal(true)}>
              <Zap className="w-4 h-4" /> Redeem as Cash
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {(['catalog', 'history'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-[var(--text-muted)]'}`}>
            {t === 'catalog' ? '🎁 Catalog' : '📜 History'}
          </button>
        ))}
      </div>

      {/* Catalog */}
      {tab === 'catalog' && (
        catalog.length === 0 ? (
          <EmptyState icon={Gift} title="Catalog is empty" desc="No rewards available right now" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((item) => {
              const Icon = TYPE_ICONS[item.type] || Gift;
              const canAfford = (summary?.points || 0) >= item.pointsRequired;
              return (
                <div key={item.id} className={`card p-5 flex flex-col gap-3 transition-all hover:shadow-md ${!item.active ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="badge-blue">{item.type}</span>
                  </div>
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{item.description}</div>
                  </div>
                  {(item.cashbackAmount ?? 0) > 0 && (
                    <div className="text-emerald-500 font-semibold text-sm">Cashback: {fmt(item.cashbackAmount ?? 0)}</div>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <div className="font-bold text-cyan-500 amount">{item.pointsRequired} pts</div>
                      {item.tierRequired && <div className="text-xs text-[var(--text-muted)]">Req: {item.tierRequired}</div>}
                      {(item.stock ?? 0) > 0 && <div className="text-xs text-[var(--text-muted)]">{item.stock} left</div>}
                    </div>
                    <button
                      className={canAfford && item.active ? 'btn-primary px-4 py-2 text-sm' : 'btn-secondary px-4 py-2 text-sm opacity-60 cursor-not-allowed'}
                      disabled={!canAfford || !item.active}
                      onClick={() => canAfford && item.active && setRedeemModal(item)}>
                      Redeem
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* History */}
      {tab === 'history' && (
        history.length === 0 ? (
          <EmptyState icon={Star} title="No reward activity" desc="Your reward transactions will appear here" />
        ) : (
          <div className="card p-6 space-y-3">
            {history.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  tx.type === 'EARN' || tx.type === 'BONUS'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                }`}>
                  {tx.type === 'EARN' || tx.type === 'BONUS' ? '+' : '−'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{tx.description || tx.type}</div>
                  <div className="text-xs text-[var(--text-muted)]">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}</div>
                </div>
                <div className={`amount font-bold text-sm ${tx.type === 'EARN' || tx.type === 'BONUS' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'EARN' || tx.type === 'BONUS' ? '+' : '−'}{tx.points} pts
                </div>
                <StatusBadge status={tx.type} />
              </div>
            ))}
          </div>
        )
      )}

      {/* Redeem item modal */}
      <Modal open={!!redeemModal} onClose={() => setRedeemModal(null)} title="Confirm Redemption" size="sm">
        {redeemModal && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="font-bold mb-1">{redeemModal.name}</div>
              <div className="text-sm text-[var(--text-muted)]">{redeemModal.description}</div>
              <div className="mt-3 font-bold text-cyan-500 amount">{redeemModal.pointsRequired} pts required</div>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setRedeemModal(null)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={() => handleRedeem(redeemModal)} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Redeem points modal */}
      <Modal open={redeemPtsModal} onClose={() => setRedeemPtsModal(false)} title="Redeem Points as Cash" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Convert your reward points to wallet cash. 1 point = ₹1. Daily cap applies.</p>
          <div>
            <label className="label">Points to redeem</label>
            <input type="number" min="1" max={summary?.points} className="input-field text-xl font-mono"
              placeholder="0" value={ptsToRedeem} onChange={(e) => setPtsToRedeem(e.target.value)} />
            <p className="text-xs text-[var(--text-muted)] mt-1">= {fmt(ptsToRedeem || '0')} wallet credit</p>
          </div>
          <button className="btn-primary w-full" onClick={handleRedeemPoints} disabled={actionLoading}>
            {actionLoading ? 'Processing...' : `Redeem ${ptsToRedeem || 0} pts`}
          </button>
        </div>
      </Modal>
    </div>
  );
}
