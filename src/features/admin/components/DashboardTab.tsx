import { Users, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard, LoadingPage } from '../../../shared/components/UI';
import { formatNumber as fmt } from '../../../shared/utils';
import type { AdminStats } from '../types';

interface Props { stats: AdminStats | null; loading: boolean; }

export function DashboardTab({ stats, loading }: Props) {
  if (loading) return <LoadingPage />;
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Users}         label="Total Users"   value={fmt(stats.totalUsers)}       color="cyan" />
      <StatCard icon={TrendingUp}    label="Active Users"  value={fmt(stats.activeUsers)}      color="green" />
      <StatCard icon={AlertTriangle} label="Blocked Users" value={fmt(stats.blockedUsers)}     color="red" />
      <StatCard icon={Shield}        label="KYC Pending"   value={fmt(stats.kycPending)}       color="yellow" />
      <StatCard icon={Users}         label="New Today"     value={fmt(stats.newUsersToday)}    color="cyan" />
      <StatCard icon={Users}         label="This Week"     value={fmt(stats.newUsersThisWeek)} color="purple" />
      <StatCard icon={Shield}        label="KYC Approved"  value={fmt(stats.kycApproved)}      color="green" />
      <StatCard icon={Shield}        label="KYC Rejected"  value={fmt(stats.kycRejected)}      color="red" />
    </div>
  );
}
