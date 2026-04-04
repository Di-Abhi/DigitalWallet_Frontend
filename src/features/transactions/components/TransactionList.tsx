import { Receipt } from 'lucide-react';
import { EmptyState } from '../../../shared/components/UI';
import { Pagination } from '../../../shared/components/Button';
import { TransactionTableRow, TransactionCard } from './TransactionRow';
import type { Transaction } from '../types';

const TABLE_HEADERS = ['Transaction', 'Type', 'Amount', 'Status', 'Date', 'Action'] as const;
const CENTER_COLS   = new Set(['Status', 'Action']);
const RIGHT_COLS    = new Set(['Amount']);

interface Props {
  transactions:  Transaction[];
  currentUserId: number | null | undefined;
  page:          number;
  totalPages:    number;
  onPageChange:  (p: number) => void;
}

export function TransactionList({ transactions, currentUserId, page, totalPages, onPageChange }: Props) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions found"
        desc="Try adjusting your filters or direction tab"
      />
    );
  }

  return (
    <>
      {/* ── Desktop table ─────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm" role="grid" aria-label="Transaction list">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className={`p-4 ${
                    CENTER_COLS.has(h) ? 'text-center' : RIGHT_COLS.has(h) ? 'text-right' : 'text-left'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <TransactionTableRow key={tx.id} tx={tx} currentUserId={currentUserId} />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ──────────────────────────────────────────── */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {transactions.map((tx) => (
          <TransactionCard key={tx.id} tx={tx} currentUserId={currentUserId} />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="p-4 border-t border-[var(--border)]"
      />
    </>
  );
}
