import { ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';
import { formatCurrency as fmt } from '../../../shared/utils';
import { getDirection, type Transaction, type DirectionTab } from '../types';

interface Props {
  transactions:  Transaction[];
  currentUserId: number | null | undefined;
  activeTab:     DirectionTab;
  onTabChange:   (tab: DirectionTab) => void;
}

export function TransactionSummary({ transactions, currentUserId, activeTab, onTabChange }: Props) {
  const received = transactions.filter(
    (t) => getDirection(t.type, currentUserId, t.senderId) === 'received',
  );
  const sent = transactions.filter(
    (t) => getDirection(t.type, currentUserId, t.senderId) === 'sent',
  );

  const totalIn  = received.reduce((s, t) => s + t.amount, 0);
  const totalOut = sent.reduce((s, t) => s + t.amount, 0);

  const tabs = [
    {
      id:          'all' as DirectionTab,
      label:       'All',
      icon:        Activity,
      count:       transactions.length,
      amount:      fmt(totalIn - totalOut),
      activeColor: 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30',
      iconColor:   'text-slate-500',
    },
    {
      id:          'received' as DirectionTab,
      label:       'Received',
      icon:        ArrowDownLeft,
      count:       received.length,
      amount:      `+${fmt(totalIn)}`,
      activeColor: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
      iconColor:   'text-emerald-500',
    },
    {
      id:          'sent' as DirectionTab,
      label:       'Sent',
      icon:        ArrowUpRight,
      count:       sent.length,
      amount:      `−${fmt(totalOut)}`,
      activeColor: 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
      iconColor:   'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3" role="tablist" aria-label="Transaction direction filter">
      {tabs.map(({ id, label, icon: Icon, count, amount, activeColor, iconColor }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            aria-label={`Show ${label} transactions`}
            onClick={() => onTabChange(id)}
            className={`card p-4 text-left transition-all border-2 hover:shadow-md ${
              isActive ? activeColor : 'border-transparent hover:border-[var(--border)]'
            }`}
          >
            <div className={`flex items-center gap-2 mb-2 ${isActive ? '' : iconColor}`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <div className="font-bold text-lg amount truncate">{amount}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {count} transaction{count !== 1 ? 's' : ''}
            </div>
          </button>
        );
      })}
    </div>
  );
}
