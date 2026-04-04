import { useState, useCallback } from 'react';
import { adminApi } from '../../../core/api/adminApi';
import { toast } from '../../../shared/components/Toast';
import { getApiErrorMessage } from '../../../core/api/types';
import { useNotifications } from '../../../store/NotificationContext';
import type { AdminStats, AdminUser, KycItem } from '../types';

// ─── useAdminData ─────────────────────────────────────────────────────────────
// Centralises all admin API calls and loading state.
export function useAdminData() {
  const { addNotification } = useNotifications();

  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [kycQueue, setKycQueue] = useState<KycItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.dashboard(); setStats(res.data.data); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load dashboard stats')); }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async (search: string, page: number) => {
    setLoading(true);
    try {
      const res = search
        ? await adminApi.searchUsers(search, page, 15)
        : await adminApi.listUsers({ page, size: 15 });
      setUsers(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load users')); }
    finally { setLoading(false); }
  }, []);

  const loadKyc = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.pendingKyc(); setKycQueue(res.data.data.content); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load KYC queue')); }
    finally { setLoading(false); }
  }, []);

  const blockUser = async (userId: number, isBlocked: boolean, onDone: () => void) => {
    try {
      isBlocked ? await adminApi.unblockUser(userId) : await adminApi.blockUser(userId);
      toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'}`);
      addNotification({ title: 'User Updated', message: `User #${userId} ${isBlocked ? 'unblocked' : 'blocked'}`, type: 'info' });
      onDone();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Action failed')); }
  };

  const changeRole = async (userId: number, newRole: string, onDone: () => void) => {
    try { await adminApi.changeRole(userId, newRole); toast.success(`Role changed to ${newRole}`); onDone(); }
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
    try { await adminApi.rejectKycById(kycId, reason); toast.success('KYC rejected'); loadKyc(); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Rejection failed')); return false; }
    return true;
  };

  const addCatalogItem = async (form: Record<string, any>) => {
    try {
      await adminApi.addCatalogItem(form);
      toast.success('Catalog item added!');
      return true;
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to add item')); return false; }
  };

  return {
    stats, users, kycQueue, totalPages, loading,
    loadDashboard, loadUsers, loadKyc,
    blockUser, changeRole, approveKyc, rejectKyc, addCatalogItem,
  };
}
