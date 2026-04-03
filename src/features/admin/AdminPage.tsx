import { useState, useEffect, useCallback, ChangeEvent, useMemo } from 'react';
import { Users, Shield, AlertTriangle, TrendingUp, Check, X, RefreshCw, Plus, LayoutDashboardIcon, User, File, Gift, LucideIcon } from 'lucide-react';
import { adminApi } from '../../core/api/adminApi';
import { StatCard, StatusBadge, LoadingPage, Modal, EmptyState } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useNotifications } from '../../store/NotificationContext';
import { useDebounce } from '../../store/hooks';
import { getApiErrorMessage } from '../../core/api/types';
import { formatNumber as fmt } from '../../shared/utils';
import { Button, IconButton, Pagination, TabButton, TabBar } from '../../shared/components/Button';
import { SearchInput, InputField, SelectField, TextareaField } from '../../shared/components/Input';

interface AdminStats {
  totalUsers?: number; activeUsers?: number; blockedUsers?: number; kycPending?: number;
  newUsersToday?: number; newUsersThisWeek?: number; kycApproved?: number; kycRejected?: number;
}
interface AdminUser { id: number; name?: string; email?: string; role?: string; status?: string; kycStatus?: string; }
interface KycItem   { id?: number; kycId?: number; userId?: number; userName?: string; userEmail?: string; docType?: string; docNumber?: string; docFilePath?: string; }
interface CatalogForm { name: string; description: string; pointsRequired: string; type: string; stock: string; cashbackAmount: string; }
type TabId = 'dashboard' | 'users' | 'kyc' | 'catalog';

const ROLE_OPTIONS    = ['USER', 'ADMIN', 'MERCHANT'].map((r) => ({ value: r, label: r }));
const CATALOG_TYPES   = ['CASHBACK', 'COUPON', 'VOUCHER'].map((t) => ({ value: t, label: t }));
const EMPTY_CATALOG: CatalogForm = { name: '', description: '', pointsRequired: '', type: 'CASHBACK', stock: '', cashbackAmount: '' };

export default function AdminPage() {
  const { addNotification } = useNotifications();
  const [tab, setTab]           = useState<TabId>('dashboard');
  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [kycQueue, setKycQueue] = useState<KycItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [addCatalogModal, setAddCatalogModal] = useState(false);
  const [catalogForm, setCatalogForm]         = useState<CatalogForm>(EMPTY_CATALOG);
  const [rejectModal, setRejectModal]         = useState<number | null>(null);
  const [rejectReason, setRejectReason]       = useState('');
  const [previewUrl, setPreviewUrl]           = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.dashboard(); setStats(res.data.data); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load dashboard stats')); }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = debouncedSearch
        ? await adminApi.searchUsers(debouncedSearch, page, 15)
        : await adminApi.listUsers({ page, size: 15 });
      setUsers(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load users')); }
    finally { setLoading(false); }
  }, [debouncedSearch, page]);

  const loadKyc = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.pendingKyc(); setKycQueue(res.data.data.content); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load KYC queue')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'users') loadUsers();
    else if (tab === 'kyc') loadKyc();
  }, [tab, loadDashboard, loadUsers, loadKyc]);

  const userCountLabel = useMemo(() =>
    debouncedSearch ? `${users.length} result(s) for "${debouncedSearch}"` : `${users.length} users`,
    [users.length, debouncedSearch]
  );

  const blockUser = async (userId: number, isBlocked: boolean) => {
    try {
      isBlocked ? await adminApi.unblockUser(userId) : await adminApi.blockUser(userId);
      toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'}`);
      addNotification({ title: 'User Updated', message: `User #${userId} ${isBlocked ? 'unblocked' : 'blocked'}`, type: 'info' });
      loadUsers();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Action failed')); }
  };

  const changeRole = async (userId: number, newRole: string) => {
    try { await adminApi.changeRole(userId, newRole); toast.success(`Role changed to ${newRole}`); loadUsers(); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Action failed')); }
  };

  const approveKyc = async (kycId: number) => {
    try {
      await adminApi.approveKycById(kycId);
      toast.success('KYC approved');
      addNotification({ title: 'KYC Approved', message: `KYC #${kycId} approved`, type: 'success' });
      loadKyc();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Approval failed')); }
  };

  const rejectKyc = async (kycId: number, reason: string) => {
    try { await adminApi.rejectKycById(kycId, reason); toast.success('KYC rejected'); setRejectModal(null); loadKyc(); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Rejection failed')); }
  };

  const addCatalogItem = async () => {
    try {
      await adminApi.addCatalogItem({ ...catalogForm, pointsRequired: Number(catalogForm.pointsRequired), stock: Number(catalogForm.stock), cashbackAmount: Number(catalogForm.cashbackAmount) || 0 });
      toast.success('Catalog item added!');
      setAddCatalogModal(false);
      setCatalogForm(EMPTY_CATALOG);
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to add item')); }
  };

  const refreshCurrent = () => { if (tab === 'dashboard') loadDashboard(); else if (tab === 'users') loadUsers(); else if (tab === 'kyc') loadKyc(); };

  const TABS: { id: TabId; icon: LucideIcon; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboardIcon, label: 'Dashboard' },
    { id: 'users',     icon: User,                label: 'Users' },
    { id: 'kyc',       icon: File,                label: 'KYC Queue' },
    { id: 'catalog',   icon: Gift,                label: 'Catalog' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-500" aria-hidden="true" /> Admin Panel
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage users, KYC, and rewards</p>
        </div>
        <IconButton icon={<RefreshCw className="w-4 h-4" />} label="Refresh current tab" onClick={refreshCurrent} />
      </div>

      {/* Tabs */}
      <TabBar className="w-fit">
        {TABS.map(({ id, icon: Icon, label }) => (
          <TabButton key={id} active={tab === id} icon={<Icon className="w-4 h-4" />}
            onClick={() => { setTab(id); setPage(0); setSearch(''); }} className="px-4">
            {label}
          </TabButton>
        ))}
      </TabBar>

      {/* ── Dashboard Tab ─────────────────────────────────────────────── */}
      {tab === 'dashboard' && (loading ? <LoadingPage /> : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}         label="Total Users"   value={fmt(stats.totalUsers)}        color="cyan" />
          <StatCard icon={TrendingUp}    label="Active Users"  value={fmt(stats.activeUsers)}       color="green" />
          <StatCard icon={AlertTriangle} label="Blocked Users" value={fmt(stats.blockedUsers)}      color="red" />
          <StatCard icon={Shield}        label="KYC Pending"   value={fmt(stats.kycPending)}        color="yellow" />
          <StatCard icon={Users}         label="New Today"     value={fmt(stats.newUsersToday)}     color="cyan" />
          <StatCard icon={Users}         label="This Week"     value={fmt(stats.newUsersThisWeek)}  color="purple" />
          <StatCard icon={Shield}        label="KYC Approved"  value={fmt(stats.kycApproved)}       color="green" />
          <StatCard icon={Shield}        label="KYC Rejected"  value={fmt(stats.kycRejected)}       color="red" />
        </div>
      ) : null)}

      {/* ── Users Tab ─────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <SearchInput
              containerClassName="flex-1"
              placeholder="Search name, email, phone…"
              aria-label="Search users"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
            <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{userCountLabel}</span>
          </div>

          <div className="card overflow-hidden">
            {loading ? <LoadingPage /> : users.length === 0 ? <EmptyState icon={Users} title="No users found" /> : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm" role="grid" aria-label="Users list">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                        {['User', 'Role', 'KYC', 'Status', 'Actions'].map((h) => (
                          <th key={h} scope="col" className={`p-4 ${h === 'KYC' || h === 'Status' || h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white font-bold text-xs flex items-center justify-center" aria-hidden="true">
                                {(u.name || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold">{u.name}</div>
                                <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <SelectField
                              options={ROLE_OPTIONS}
                              value={u.role || 'USER'}
                              aria-label={`Role for ${u.name}`}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => changeRole(u.id, e.target.value)}
                              className="py-1 text-xs w-28"
                            />
                          </td>
                          <td className="p-4 text-center"><StatusBadge status={u.kycStatus || 'NOT_SUBMITTED'} /></td>
                          <td className="p-4 text-center"><StatusBadge status={u.status || 'ACTIVE'} /></td>
                          <td className="p-4 text-center">
                            <Button
                              variant={u.status === 'BLOCKED' ? 'secondary' : 'danger'}
                              size="xs"
                              aria-label={`${u.status === 'BLOCKED' ? 'Unblock' : 'Block'} ${u.name}`}
                              onClick={() => blockUser(u.id, u.status === 'BLOCKED')}
                            >
                              {u.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-[var(--border)]">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white font-bold flex items-center justify-center" aria-hidden="true">
                          {(u.name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <StatusBadge status={u.status || 'ACTIVE'} />
                        <StatusBadge status={u.kycStatus || 'NOT_SUBMITTED'} />
                        <Button
                          variant={u.status === 'BLOCKED' ? 'secondary' : 'danger'}
                          size="xs"
                          aria-label={`${u.status === 'BLOCKED' ? 'Unblock' : 'Block'} ${u.name}`}
                          onClick={() => blockUser(u.id, u.status === 'BLOCKED')}
                        >
                          {u.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="p-4 border-t border-[var(--border)]" />
              </>
            )}
          </div>
        </div>
      )}

      {/* ── KYC Tab ───────────────────────────────────────────────────── */}
      {tab === 'kyc' && (loading ? <LoadingPage /> : kycQueue.length === 0 ? (
        <EmptyState icon={Shield} title="No pending KYC submissions" desc="All caught up!" />
      ) : (
        <div className="space-y-3" role="list" aria-label="KYC queue">
          {kycQueue.map((k) => {
            const kycId = k.kycId ?? k.id ?? 0;
            return (
              <div key={kycId} role="listitem" className="card p-5 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-48">
                  <div className="font-bold">{k.userName || `User #${k.userId}`}</div>
                  <div className="text-sm text-[var(--text-muted)]">{k.userEmail}</div>
                  <div className="mt-2 flex gap-3 text-xs text-[var(--text-muted)]">
                    <span>Doc: <span className="font-semibold text-[var(--text)]">{k.docType}</span></span>
                    <span>#{k.docNumber}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {k.docFilePath && (
                    <Button variant="secondary" size="sm" onClick={() => setPreviewUrl(k.docFilePath!)}
                      aria-label={`View document for ${k.userName}`}>
                      View
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" icon={<Check className="w-4 h-4" />}
                    onClick={() => approveKyc(kycId)} aria-label={`Approve KYC for ${k.userName}`}
                    className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 hover:bg-emerald-200 border-0">
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" icon={<X className="w-4 h-4" />}
                    onClick={() => setRejectModal(kycId)} aria-label={`Reject KYC for ${k.userName}`}>
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* ── Catalog Tab ───────────────────────────────────────────────── */}
      {tab === 'catalog' && (
        <div className="space-y-4">
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddCatalogModal(true)}>
            Add Catalog Item
          </Button>
          <div className="card p-6">
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              Use "Add Catalog Item" to create new rewards for users.<br />
              <span className="text-xs">Items added here will appear in the Rewards Catalog.</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Document Preview Modal ────────────────────────────────────── */}
      <Modal open={!!previewUrl} onClose={() => setPreviewUrl(null)} title="KYC Document" size="lg">
        <div className="w-full h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
          {previewUrl?.endsWith('.pdf')
            ? <iframe src={previewUrl} className="w-full h-full" title="KYC document PDF" />
            : <img src={previewUrl ?? ''} alt="KYC document" className="max-h-full object-contain" />}
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" fullWidth onClick={() => setPreviewUrl(null)}>Close</Button>
          <a href={previewUrl || ''} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 text-center flex items-center justify-center">Open Full</a>
        </div>
      </Modal>

      {/* ── Reject KYC Modal ──────────────────────────────────────────── */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject KYC" size="sm">
        <div className="space-y-4">
          <TextareaField
            label="Rejection Reason"
            rows={3}
            placeholder="State the reason…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            aria-required="true"
          />
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" fullWidth disabled={!rejectReason}
              onClick={() => rejectModal && rejectKyc(rejectModal, rejectReason)}>
              Reject KYC
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Add Catalog Modal ─────────────────────────────────────────── */}
      <Modal open={addCatalogModal} onClose={() => setAddCatalogModal(false)} title="Add Reward Item" size="lg">
        <div className="grid grid-cols-2 gap-4">
          {([
            { label: 'Name',                  key: 'name'           as keyof CatalogForm, type: 'text',   placeholder: 'e.g. 10% Cashback' },
            { label: 'Points Required',       key: 'pointsRequired' as keyof CatalogForm, type: 'number', placeholder: '100' },
            { label: 'Stock',                 key: 'stock'          as keyof CatalogForm, type: 'number', placeholder: '50' },
            { label: 'Cashback Amount (₹)',   key: 'cashbackAmount' as keyof CatalogForm, type: 'number', placeholder: '0' },
          ] as const).map(({ label, key, type, placeholder }) => (
            <InputField key={key} label={label} type={type} placeholder={placeholder}
              value={catalogForm[key]}
              onChange={(e) => setCatalogForm({ ...catalogForm, [key]: e.target.value })}
            />
          ))}
          <SelectField label="Type" options={CATALOG_TYPES} value={catalogForm.type}
            onChange={(e) => setCatalogForm({ ...catalogForm, type: e.target.value })} />
          <div className="col-span-2">
            <InputField label="Description" placeholder="Short description" value={catalogForm.description}
              onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="secondary" fullWidth onClick={() => setAddCatalogModal(false)}>Cancel</Button>
          <Button fullWidth onClick={addCatalogItem}>Add Item</Button>
        </div>
      </Modal>
    </div>
  );
}
