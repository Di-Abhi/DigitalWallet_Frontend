import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/UI';
import { formatCurrency as fmt, formatDate } from '../../../shared/utils';
import { ROUTES } from '../../../routes';

interface Transaction {
  id: number; type: string; amount: number; status: string;
  description?: string; referenceId?: string; createdAt?: string;
}

interface Props { transactions: Transaction[]; }

const CREDIT_TYPES = ['TOPUP', 'CASHBACK'];

export function RecentTransactions({ transactions }: Props) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-base">Recent Transactions</h2>
        <Link to={ROUTES.TRANSACTIONS} className="text-xs text-cyan-500 hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center text-[var(--text-muted)] text-sm">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          No transactions yet
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isCredit = CREDIT_TYPES.includes(tx.type);
            return (
              <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                  ${isCredit ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                  {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{tx.type}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate">{tx.description || tx.referenceId || '—'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-semibold text-sm amount ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isCredit ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{formatDate(tx.createdAt)}</div>
                </div>
                <StatusBadge status={tx.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
