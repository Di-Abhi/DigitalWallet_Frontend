import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/UI';
import { TabButton, TabBar } from '../../../shared/components/Button';
import { formatCurrency as fmt, formatDate } from '../../../shared/utils';
import { ROUTES } from '../../../routes';
import { useAuth } from '../../../store/AuthContext';
import { DirectionIcon, AmountLabel } from '../../transactions/components/TransactionRow';
import { getDirection, type Transaction, type DirectionTab } from '../../transactions/types';

interface Props { transactions: Transaction[]; }

function EmptyTransactions() {
  return (
    <div className="py-10 text-center text-[var(--text-muted)] text-sm">
      <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" aria-hidden="true" />
      No transactions yet
    </div>
  );
}

function TransactionItem({ tx, currentUserId }: { tx: Transaction; currentUserId: number | null }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <DirectionIcon type={tx.type} currentUserId={currentUserId} senderUserId={tx.senderUserId} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{tx.type}</div>
        <div className="text-xs text-[var(--text-muted)] truncate">
          {tx.description || tx.referenceId || '—'}
        </div>
      </div>
      <div className="text-right shrink-0">
        <AmountLabel
          type={tx.type} amount={tx.amount}
          currentUserId={currentUserId} senderUserId={tx.senderUserId}
          className="text-sm"
        />
        <div className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(tx.createdAt)}</div>
      </div>
      <StatusBadge status={tx.status} />
    </div>
  );
}

export function RecentTransactions({ transactions }: Props) {
  const { user }        = useAuth();
  const currentUserId   = user?.id ?? null;
  const [tab, setTab]   = useState<DirectionTab>('all');

  const received = transactions.filter(
    (t) => getDirection(t.type, currentUserId, t.senderUserId) === 'received',
  );
  const sent = transactions.filter(
    (t) => getDirection(t.type, currentUserId, t.senderUserId) === 'sent',
  );
  const visible = tab === 'all' ? transactions : tab === 'received' ? received : sent;

  const totalIn  = received.reduce((s, t) => s + t.amount, 0);
  const totalOut = sent.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-base">Recent Transactions</h2>
        <Link to={ROUTES.TRANSACTIONS} className="text-xs text-cyan-500 hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {transactions.length === 0 ? <EmptyTransactions /> : (
        <>
          {/* Received / Sent quick stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Received</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 amount">+{fmt(totalIn)}</div>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
              <div className="text-xs text-red-500 dark:text-red-400 font-semibold mb-1">Sent</div>
              <div className="font-bold text-red-500 dark:text-red-400 amount">−{fmt(totalOut)}</div>
            </div>
          </div>

          {/* Direction tabs */}
          <TabBar className="mb-4">
            <TabButton active={tab === 'all'}      onClick={() => setTab('all')}>All</TabButton>
            <TabButton active={tab === 'received'} onClick={() => setTab('received')}>Received</TabButton>
            <TabButton active={tab === 'sent'}     onClick={() => setTab('sent')}>Sent</TabButton>
          </TabBar>

          {visible.length === 0 ? (
            <div className="py-6 text-center text-sm text-[var(--text-muted)]">
              No {tab} transactions
            </div>
          ) : (
            <div className="space-y-1">
              {visible.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
