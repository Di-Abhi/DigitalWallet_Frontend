import { Link } from 'react-router-dom';
import { Wallet, Plus, Send, Gift } from 'lucide-react';
import { formatCurrency as fmt } from '../../../shared/utils';
import { ROUTES } from '../../../routes';

interface Props { balance: number; status: string; }

export function DashboardBalanceCard({ balance, status }: Props) {
  return (
    <div className="card p-6 bg-gradient-to-br from-cyan-500 to-cyan-700 text-white border-0 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
      <div className="absolute right-12 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-80">Total Balance</span>
        </div>
        <div className="amount text-4xl font-bold mb-1">{fmt(balance)}</div>
        <div className="text-sm opacity-70 mb-6">Status: {status || 'Active'}</div>
        <div className="flex gap-3 flex-wrap">
          {[
            { to: ROUTES.WALLET,   icon: Plus,  label: 'Add Money' },
            { to: ROUTES.TRANSFER, icon: Send,  label: 'Send' },
            { to: ROUTES.REWARDS,  icon: Gift,  label: 'Redeem' },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={label} to={to}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
