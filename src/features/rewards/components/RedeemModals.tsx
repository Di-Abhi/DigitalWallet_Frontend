import { Modal } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import { AmountInput } from '../../../shared/components/Input';
import { formatCurrency as fmt } from '../../../shared/utils';
import type { CatalogItem, RewardSummary } from '../types';

// ─── Confirm item redemption ─────────────────────────────────────────────────
interface ConfirmProps {
  item:    CatalogItem | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (item: CatalogItem) => void;
}

export function RedeemItemModal({ item, loading, onClose, onConfirm }: ConfirmProps) {
  return (
    <Modal open={!!item} onClose={onClose} title="Confirm Redemption" size="sm">
      {item && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="font-bold mb-1">{item.name}</div>
            <div className="text-sm text-[var(--text-muted)]">{item.description}</div>
            <div className="mt-3 font-bold text-cyan-500 amount">{item.pointsRequired} pts required</div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button fullWidth loading={loading} onClick={() => onConfirm(item)}>Confirm</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Redeem points as cash ───────────────────────────────────────────────────
interface PointsProps {
  open:     boolean;
  points:   string;
  summary:  RewardSummary | null;
  loading:  boolean;
  onPoints: (v: string) => void;
  onClose:  () => void;
  onSubmit: () => void;
}

export function RedeemPointsModal({ open, points, summary, loading, onPoints, onClose, onSubmit }: PointsProps) {
  return (
    <Modal open={open} onClose={onClose} title="Redeem Points as Cash" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">Convert your reward points to wallet cash. 1 point = ₹1. Daily cap applies.</p>
        <AmountInput
          label="Points to redeem"
          currency="pts"
          placeholder="0"
          min={1}
          max={summary?.points}
          value={points}
          onChange={(e) => onPoints(e.target.value)}
          hint={`= ${fmt(points || '0')} wallet credit`}
          className="text-xl font-mono"
        />
        <Button fullWidth loading={loading} onClick={onSubmit}>
          Redeem {points || 0} pts
        </Button>
      </div>
    </Modal>
  );
}
