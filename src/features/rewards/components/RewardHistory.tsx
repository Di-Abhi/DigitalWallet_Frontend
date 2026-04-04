import { Star } from 'lucide-react';
import { EmptyState, StatusBadge } from '../../../shared/components/UI';
import type { HistoryItem } from '../types';

interface Props { history: HistoryItem[]; }

export function RewardHistory({ history }: Props) {
  if (history.length === 0) {
    return <EmptyState icon={Star} title="No reward activity" desc="Your reward transactions will appear here" />;
  }

  return (
    <div className="card p-6 space-y-3">
      {history.map((tx) => {
        const isEarn = tx.type === 'EARN' || tx.type === 'BONUS';
        return (
          <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
              ${isEarn ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
              {isEarn ? '+' : '−'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{tx.description || tx.type}</div>
              <div className="text-xs text-[var(--text-muted)]">
                {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
              </div>
            </div>
            <div className={`amount font-bold text-sm ${isEarn ? 'text-emerald-600' : 'text-red-500'}`}>
              {isEarn ? '+' : '−'}{tx.points} pts
            </div>
            <StatusBadge status={tx.type} />
          </div>
        );
      })}
    </div>
  );
}
