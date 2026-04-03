import api from './client';
// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => api.get('/api/admin/dashboard'),
  listUsers: (params: Record<string, string | number> = {}) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api.get(`/api/admin/users?${q}`);
  },
  getUser: (userId: number) => api.get(`/api/admin/users/${userId}`),
  blockUser: (userId: number) => api.patch(`/api/admin/users/${userId}/block`),
  unblockUser: (userId: number) => api.patch(`/api/admin/users/${userId}/unblock`),
  changeRole: (userId: number, newRole: string) =>
    api.patch(`/api/admin/users/${userId}/role?newRole=${newRole}`),
  searchUsers: (q: string, page = 0, size = 20) =>
    api.get(`/api/admin/users/search?q=${q}&page=${page}&size=${size}`),
  pendingKyc: (page = 0) => api.get(`/api/admin/kyc/pending?page=${page}`),
  approveKycById: (kycId: number) => api.post(`/api/admin/kyc/${kycId}/approve`),
  rejectKycById: (kycId: number, reason: string) =>
    api.post(`/api/admin/kyc/${kycId}/reject?reason=${encodeURIComponent(reason)}`),
  approveKycByUserId: (userId: number) => api.post(`/api/admin/kyc/user/${userId}/approve`),
  rejectKycByUserId: (userId: number, reason: string) =>
    api.post(`/api/admin/kyc/user/${userId}/reject?reason=${encodeURIComponent(reason)}`),
  addCatalogItem: (data: object) => api.post('/api/rewards/catalog/add', data),
};
