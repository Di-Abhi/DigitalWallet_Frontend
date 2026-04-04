import { useState, useEffect } from 'react';
import { RefreshCw, Gift, History } from 'lucide-react';
import { rewardsApi } from '../../core/api/rewardApi';
import { LoadingPage } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { IconButton, TabButton, TabBar } from '../../shared/components/Button';
import { useNotifications } from '../../store/NotificationContext';
import { formatCurrency as fmt } from '../../shared/utils';
import { TierCard }         from './components/TierCard';
import { RewardCatalog }    from './components/RewardCatalog';
import { RewardHistory }    from './components/RewardHistory';
import { RedeemItemModal, RedeemPointsModal } from './components/RedeemModals';
import type { RewardSummary, CatalogItem, HistoryItem } from './types';

export default function RewardsPage() {
  const { addNotification } = useNotifications();
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<'catalog' | 'history'>('catalog');

  // Modal state
  const [redeemItem, setRedeemItem]         = useState<CatalogItem | null>(null);
  const [redeemPtsOpen, setRedeemPtsOpen]   = useState(false);
  const [ptsToRedeem, setPtsToRedeem]       = useState('');
  const [actionLoading, setActionLoading]   = useState(false);

  const load = async () => {
    try {
      const [sRes, cRes, hRes] = await Promise.allSettled([
        rewardsApi.summary(), rewardsApi.catalog(), rewardsApi.transactions(),
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
      const res  = await rewardsApi.redeem({ rewardId: item.id });
      const data = res.data.data;
      toast.success(`Redeemed! ${data.couponCode ? `Coupon: ${data.couponCode}` : 'Cashback credited.'}`);
      addNotification({ title: 'Reward Redeemed!', message: `${item.name} redeemed successfully`, type: 'success' });
      setRedeemItem(null);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Redemption failed'); }
    finally { setActionLoading(false); }
  };

  const handleRedeemPoints = async () => {
    const pts = Number(ptsToRedeem);
    if (!pts || pts < 1) return toast.error('Enter valid points');
    setActionLoading(true);
    try {
      await rewardsApi.redeemPoints(pts);
      toast.success(`${pts} points redeemed as ${fmt(pts)}!`);
      addNotification({ title: 'Points Redeemed', message: `${pts} points → ${fmt(pts)} wallet credit`, type: 'success' });
      setRedeemPtsOpen(false);
      setPtsToRedeem('');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Redemption failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rewards & Loyalty</h1>
        <IconButton icon={<RefreshCw className="w-4 h-4" />} label="Refresh rewards" onClick={load} />
      </div>

      {summary && (
        <TierCard summary={summary} onRedeemAsCash={() => setRedeemPtsOpen(true)} />
      )}

      <TabBar className="w-fit">
        <TabButton active={tab === 'catalog'} onClick={() => setTab('catalog')} icon={<Gift className="w-4 h-4" />} className="px-4">Catalog</TabButton>
        <TabButton active={tab === 'history'} onClick={() => setTab('history')} icon={<History className="w-4 h-4" />} className="px-4">History</TabButton>
      </TabBar>

      {tab === 'catalog' && <RewardCatalog catalog={catalog} summary={summary} onRedeem={setRedeemItem} />}
      {tab === 'history' && <RewardHistory history={history} />}

      <RedeemItemModal
        item={redeemItem} loading={actionLoading}
        onClose={() => setRedeemItem(null)}
        onConfirm={handleRedeem}
      />
      <RedeemPointsModal
        open={redeemPtsOpen} points={ptsToRedeem} summary={summary}
        loading={actionLoading}
        onPoints={setPtsToRedeem}
        onClose={() => setRedeemPtsOpen(false)}
        onSubmit={handleRedeemPoints}
      />
    </div>
  );
}
