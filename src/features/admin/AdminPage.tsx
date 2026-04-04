import { useState, useEffect } from 'react';
import { Shield, RefreshCw, LayoutDashboardIcon, User, File, Gift, LucideIcon } from 'lucide-react';
import { IconButton, TabButton, TabBar } from '../../shared/components/Button';
import { useDebounce } from '../../store/hooks';
import { useAdminData } from './hooks/useAdminData';
import { DashboardTab }  from './components/DashboardTab';
import { UsersTab }      from './components/UsersTab';
import { KycTab }        from './components/KycTab';
import { CatalogTab }    from './components/CatalogTab';
import { DocPreviewModal, RejectKycModal } from './components/AdminModals';
import { EMPTY_CATALOG, type TabId, type CatalogForm } from './types';

const TABS: { id: TabId; icon: LucideIcon; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboardIcon, label: 'Dashboard' },
  { id: 'users',     icon: User,                label: 'Users' },
  { id: 'kyc',       icon: File,                label: 'KYC Queue' },
  { id: 'catalog',   icon: Gift,                label: 'Catalog' },
];

export default function AdminPage() {
  const [tab, setTab]     = useState<TabId>('dashboard');
  const [page, setPage]   = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch   = useDebounce(search, 500);

  // Modal state
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [catalogModal, setCatalogModal] = useState(false);
  const [catalogForm, setCatalogForm]   = useState<CatalogForm>(EMPTY_CATALOG);

  const {
    stats, users, kycQueue, totalPages, loading,
    loadDashboard, loadUsers, loadKyc,
    blockUser, changeRole, approveKyc, rejectKyc, addCatalogItem,
  } = useAdminData();

  // Reload when tab / search / page changes
  useEffect(() => {
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'users') loadUsers(debouncedSearch, page);
    else if (tab === 'kyc') loadKyc();
  }, [tab, debouncedSearch, page, loadDashboard, loadUsers, loadKyc]);

  const switchTab = (id: TabId) => { setTab(id); setPage(0); setSearch(''); };
  const refresh   = () => {
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'users') loadUsers(debouncedSearch, page);
    else if (tab === 'kyc') loadKyc();
  };

  const handleReject = async (kycId: number, reason: string) => {
    const ok = await rejectKyc(kycId, reason);
    if (ok) { setRejectModal(null); setRejectReason(''); }
  };

  const handleCatalogChange = (key: keyof CatalogForm, value: string) =>
    setCatalogForm((f) => ({ ...f, [key]: value }));

  const handleCatalogSubmit = async () => {
    const ok = await addCatalogItem({
      ...catalogForm,
      pointsRequired: Number(catalogForm.pointsRequired),
      stock: Number(catalogForm.stock),
      cashbackAmount: Number(catalogForm.cashbackAmount) || 0,
    });
    if (ok) { setCatalogModal(false); setCatalogForm(EMPTY_CATALOG); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-500" aria-hidden="true" /> Admin Panel
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage users, KYC, and rewards</p>
        </div>
        <IconButton icon={<RefreshCw className="w-4 h-4" />} label="Refresh current tab" onClick={refresh} />
      </div>

      {/* Tab bar */}
      <TabBar className="w-fit">
        {TABS.map(({ id, icon: Icon, label }) => (
          <TabButton key={id} active={tab === id} icon={<Icon className="w-4 h-4" />}
            onClick={() => switchTab(id)} className="px-4">
            {label}
          </TabButton>
        ))}
      </TabBar>

      {/* Tab content */}
      {tab === 'dashboard' && <DashboardTab stats={stats} loading={loading} />}

      {tab === 'users' && (
        <UsersTab
          users={users} loading={loading} page={page} totalPages={totalPages}
          search={search}
          onSearch={(v) => { setSearch(v); setPage(0); }}
          onPageChange={setPage}
          onBlock={(id, blocked) => blockUser(id, blocked, () => loadUsers(debouncedSearch, page))}
          onRoleChange={(id, role) => changeRole(id, role, () => loadUsers(debouncedSearch, page))}
        />
      )}

      {tab === 'kyc' && (
        <KycTab
          queue={kycQueue} loading={loading}
          onApprove={approveKyc}
          onReject={(id) => setRejectModal(id)}
          onPreview={setPreviewUrl}
        />
      )}

      {tab === 'catalog' && (
        <CatalogTab
          open={catalogModal} form={catalogForm}
          onOpen={() => setCatalogModal(true)}
          onClose={() => { setCatalogModal(false); setCatalogForm(EMPTY_CATALOG); }}
          onChange={handleCatalogChange}
          onSubmit={handleCatalogSubmit}
        />
      )}

      {/* Global modals */}
      <DocPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      <RejectKycModal
        kycId={rejectModal} reason={rejectReason}
        onReason={setRejectReason}
        onClose={() => { setRejectModal(null); setRejectReason(''); }}
        onSubmit={handleReject}
      />
    </div>
  );
}
