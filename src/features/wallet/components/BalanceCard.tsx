import { Wallet, Plus, ArrowDownLeft } from 'lucide-react';
import { formatCurrency as fmt, formatDateTime as fmtDate } from '../../../shared/utils';
import type { Balance } from '../types';

interface Props {
  balance:      Balance;
  onAddMoney:   () => void;
  onWithdraw:   () => void;
}

export function BalanceCard({ balance, onAddMoney, onWithdraw }: Props) {
  return (
    <div className="card p-6 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-900 text-white border-0 relative overflow-hidden">
      <div className="absolute right-4 top-4 opacity-10"><Wallet className="w-24 h-24" /></div>
      <div className="relative">
        <p className="text-sm opacity-70 mb-1">Available Balance</p>
        <div className="amount text-4xl font-bold mb-1">{fmt(balance.balance)}</div>
        <p className="text-xs opacity-50">Last updated: {fmtDate(balance.lastUpdated)}</p>
        <p className="text-xs opacity-50 mt-0.5">Status: {balance.status || 'Active'}</p>
        <div className="flex gap-3 mt-5 flex-wrap">
          <button
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            onClick={onAddMoney}
          >
            <Plus className="w-4 h-4" /> Add Money
          </button>
          <button
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            onClick={onWithdraw}
          >
            <ArrowDownLeft className="w-4 h-4" /> Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
