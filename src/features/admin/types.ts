// ─── Admin feature types ──────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers?: number;
  activeUsers?: number;
  blockedUsers?: number;
  kycPending?: number;
  newUsersToday?: number;
  newUsersThisWeek?: number;
  kycApproved?: number;
  kycRejected?: number;
}

export interface AdminUser {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  kycStatus?: string;
}

export interface KycItem {
  id?: number;
  kycId?: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  docType?: string;
  docNumber?: string;
  docFilePath?: string;
}

export interface CatalogForm {
  name: string;
  description: string;
  pointsRequired: string;
  type: string;
  stock: string;
  cashbackAmount: string;
}

export type TabId = 'dashboard' | 'users' | 'kyc' | 'catalog';

export const EMPTY_CATALOG: CatalogForm = {
  name: '', description: '', pointsRequired: '', type: 'CASHBACK', stock: '', cashbackAmount: '',
};

export const ROLE_OPTIONS  = ['USER', 'ADMIN', 'MERCHANT'].map((r) => ({ value: r, label: r }));
export const CATALOG_TYPES = ['CASHBACK', 'COUPON', 'VOUCHER'].map((t) => ({ value: t, label: t }));
