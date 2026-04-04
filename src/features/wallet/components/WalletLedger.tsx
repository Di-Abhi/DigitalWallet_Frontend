import { Wallet } from 'lucide-react';
import { formatCurrency as fmt, formatDateTime as fmtDate } from '../../../shared/utils';
import { StatusBadge, EmptyState } from '../../../shared/components/UI';
import { Pagination } from '../../../shared/components/Button';
import type { LedgerEntry } from '../types';

interface Props {
  entries:      LedgerEntry[];
  page:         number;
  totalPages:   number;
  onPageChange: (p: number) => void;
}

export function WalletLedger({ entries, page, totalPages, onPageChange }: Props) {
  return (
    <div className="card p-6">
      <h2 className="font-bold mb-5">Ledger</h2>

      {entries.length === 0 ? (
        <EmptyState icon={Wallet} title="No ledger entries yet" desc="Your transaction history will appear here" />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isCredit = entry.type === 'CREDIT';
            return (
              <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                  ${isCredit ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                  {isCredit ? '+' : '−'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{entry.description || entry.referenceId || 'Transaction'}</div>
                  <div className="text-xs text-[var(--text-muted)]">{fmtDate(entry.createdAt)}</div>
                </div>
                <div className={`amount font-bold text-sm shrink-0 ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isCredit ? '+' : '−'}{fmt(entry.amount)}
                </div>
                <StatusBadge status={entry.type} />
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} className="mt-5" />
    </div>
  );
}
