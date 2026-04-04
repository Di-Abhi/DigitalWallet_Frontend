import { Receipt, ArrowUpRight, ArrowDownLeft, Flag } from 'lucide-react';
import { StatusBadge, EmptyState } from '../../../shared/components/UI';
import { IconButton, Pagination } from '../../../shared/components/Button';
import { formatCurrency as fmt, formatDateTime as fmtDate } from '../../../shared/utils';
import { toast } from '../../../shared/components/Toast';

const CREDIT_TYPES = ['TOPUP', 'CASHBACK'];

interface Transaction {
  id: number; type: string; amount: number; status: string;
  description?: string; referenceId?: string; createdAt?: string;
}

interface Props {
  transactions: Transaction[];
  page:         number;
  totalPages:   number;
  onPageChange: (p: number) => void;
}

export function TransactionList({ transactions, page, totalPages, onPageChange }: Props) {
  if (transactions.length === 0) {
    return <EmptyState icon={Receipt} title="No transactions found" desc="Try adjusting your filters" />;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm" role="grid" aria-label="Transaction list">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
              {['Transaction', 'Type', 'Amount', 'Status', 'Date', 'Action'].map((h) => (
                <th key={h} scope="col"
                  className={`p-4 ${h === 'Amount' ? 'text-right' : ['Status','Action'].includes(h) ? 'text-center' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isCredit = CREDIT_TYPES.includes(tx.type);
              return (
                <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                        ${isCredit ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}
                        aria-hidden="true">
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold">#{tx.id}</div>
                        <div className="text-xs text-[var(--text-muted)] truncate max-w-32">{tx.description || tx.referenceId || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><StatusBadge status={tx.type} /></td>
                  <td className="p-4 text-right">
                    <span className={`amount font-bold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isCredit ? '+' : '−'}{fmt(tx.amount)}
                    </span>
                  </td>
                  <td className="p-4 text-center"><StatusBadge status={tx.status} /></td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">{fmtDate(tx.createdAt)}</td>
                  <td className="p-4 text-center">
                    <IconButton icon={<Flag className="w-3 h-3" />} label={`Dispute #${tx.id}`} size="sm"
                      onClick={() => toast.info(`Dispute filed for transaction #${tx.id}`)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {transactions.map((tx) => {
          const isCredit = CREDIT_TYPES.includes(tx.type);
          return (
            <div key={tx.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                  ${isCredit ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}
                  aria-hidden="true">
                  {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">#{tx.id} • {tx.type}</div>
                  <div className="text-xs text-[var(--text-muted)]">{fmtDate(tx.createdAt)}</div>
                </div>
                <div className={`amount font-bold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isCredit ? '+' : '−'}{fmt(tx.amount)}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <StatusBadge status={tx.status} />
                {tx.description && <span className="text-xs text-[var(--text-muted)] truncate">{tx.description}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange}
        className="p-4 border-t border-[var(--border)]" />
    </>
  );
}
