import { Gift, Zap, ShoppingBag } from 'lucide-react';
import { EmptyState } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import { formatCurrency as fmt } from '../../../shared/utils';
import type { CatalogItem, RewardSummary } from '../types';

const TYPE_ICONS: Record<string, React.ElementType> = { CASHBACK: Zap, COUPON: ShoppingBag, VOUCHER: Gift };

interface Props {
  catalog:  CatalogItem[];
  summary:  RewardSummary | null;
  onRedeem: (item: CatalogItem) => void;
}

export function RewardCatalog({ catalog, summary, onRedeem }: Props) {
  if (catalog.length === 0) {
    return <EmptyState icon={Gift} title="Catalog is empty" desc="No rewards available right now" />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {catalog.map((item) => {
        const Icon      = TYPE_ICONS[item.type] || Gift;
        const canAfford = (summary?.points || 0) >= item.pointsRequired;
        return (
          <div key={item.id}
            className={`card p-5 flex flex-col gap-3 transition-all hover:shadow-md ${!item.active ? 'opacity-50' : ''}`}>
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
              <Button
                variant={canAfford && item.active ? 'primary' : 'secondary'}
                size="sm"
                disabled={!canAfford || !item.active}
                onClick={() => canAfford && item.active && onRedeem(item)}
              >
                Redeem
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
