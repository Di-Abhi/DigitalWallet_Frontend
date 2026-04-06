import { ArrowDownLeft, ArrowUpRight, Flag } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/UI';
import { IconButton } from '../../../shared/components/Button';
import { formatCurrency as fmt, formatDateTime as fmtDate } from '../../../shared/utils';
import { toast } from '../../../shared/components/Toast';
import { getDirection, type Transaction } from '../types';

// ─── Shared helper: resolve direction for a single row ────────────────────────
function resolveDirection(tx: Transaction, currentUserId?: number | null) {
  return getDirection(tx.type, currentUserId, tx.senderId);
}

// ─── DirectionIcon ────────────────────────────────────────────────────────────
export function DirectionIcon({
  type,
  currentUserId,
  senderId,
  size = 'md',
}: {
  type:           string;
  currentUserId?: number | null;
  senderId?:  number | null;
  size?:          'sm' | 'md';
}) {
  const isReceived = getDirection(type, currentUserId, senderId) === 'received';
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center shrink-0 ${
        isReceived
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
          : 'bg-red-100 dark:bg-red-900/30 text-red-500'
      }`}
      aria-hidden="true"
    >
      {isReceived
        ? <ArrowDownLeft className={iconSize} />
        : <ArrowUpRight  className={iconSize} />}
    </div>
  );
}

// ─── AmountLabel ─────────────────────────────────────────────────────────────
export function AmountLabel({
  type,
  amount,
  currentUserId,
  senderId,
  className = '',
}: {
  type:           string;
  amount:         number;
  currentUserId?: number | null;
  senderId?:  number | null;
  className?:     string;
}) {
  const isReceived = getDirection(type, currentUserId, senderId) === 'received';
  return (
    <span className={`amount font-bold ${isReceived ? 'text-emerald-600' : 'text-red-500'} ${className}`}>
      {isReceived ? '+' : '−'}{fmt(amount)}
    </span>
  );
}

// ─── DirectionBadge ───────────────────────────────────────────────────────────
// Small pill showing "Received" or "Sent" label — used alongside the type badge
export function DirectionBadge({
  type,
  currentUserId,
  senderId,
}: {
  type:           string;
  currentUserId?: number | null;
  senderId?:  number | null;
}) {
  if (type !== 'TRANSFER') return null; // only ambiguous for transfers
  const isReceived = getDirection(type, currentUserId, senderId) === 'received';
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
      isReceived
        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
        : 'bg-red-100 dark:bg-red-900/30 text-red-500'
    }`}>
      {isReceived ? 'Received' : 'Sent'}
    </span>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────
export function TransactionTableRow({
  tx,
  currentUserId,
}: {
  tx:            Transaction;
  currentUserId?: number | null;
}) {
  return (
    <tr className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <DirectionIcon type={tx.type} currentUserId={currentUserId} senderId={tx.senderId} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">#{tx.id}</span>
              <DirectionBadge type={tx.type} currentUserId={currentUserId} senderId={tx.senderId} />
            </div>
            <div className="text-xs text-[var(--text-muted)] truncate max-w-36">
              {tx.description || tx.referenceId || '—'}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4"><StatusBadge status={tx.type} /></td>
      <td className="p-4 text-right">
        <AmountLabel type={tx.type} amount={tx.amount} currentUserId={currentUserId} senderId={tx.senderId} />
      </td>
      <td className="p-4 text-center"><StatusBadge status={tx.status} /></td>
      <td className="p-4 text-xs text-[var(--text-muted)]">{fmtDate(tx.createdAt)}</td>
      <td className="p-4 text-center">
        <IconButton
          icon={<Flag className="w-3 h-3" />}
          label={`Dispute transaction #${tx.id}`}
          size="sm"
          onClick={() => toast.info(`Dispute filed for transaction #${tx.id}`)}
        />
      </td>
    </tr>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────
export function TransactionCard({
  tx,
  currentUserId,
}: {
  tx:            Transaction;
  currentUserId?: number | null;
}) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <DirectionIcon type={tx.type} currentUserId={currentUserId} senderId={tx.senderId} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm">#{tx.id} · {tx.type}</span>
            <DirectionBadge type={tx.type} currentUserId={currentUserId} senderId={tx.senderId} />
          </div>
          <div className="text-xs text-[var(--text-muted)]">{fmtDate(tx.createdAt)}</div>
        </div>
        <AmountLabel type={tx.type} amount={tx.amount} currentUserId={currentUserId} senderId={tx.senderId} className="text-sm" />
      </div>
      <div className="flex gap-2 mt-1.5">
        <StatusBadge status={tx.status} />
        {tx.description && (
          <span className="text-xs text-[var(--text-muted)] truncate">{tx.description}</span>
        )}
      </div>
    </div>
  );
}
