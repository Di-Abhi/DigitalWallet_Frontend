import api from './client';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  loginPhone: (data) => api.post('/api/auth/login/phone', data),
  sendOtp: (data) => api.post('/api/auth/send-otp', data),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),
  logout: (data) => api.post('/api/auth/logout', data),
  refresh: (data) => api.post('/api/auth/refresh', data),
  forgotSendOtp: (data) => api.post('/api/auth/forgot-password/send-otp', data),
  forgotVerifyOtp: (data) => api.post('/api/auth/forgot-password/verify-otp', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// ─── Wallet ──────────────────────────────────────────────────────────────────
export const walletApi = {
  balance: () => api.get('/api/wallet/balance'),
  transactions: (page = 0, size = 10) => api.get(`/api/wallet/transactions?page=${page}&size=${size}`),
  ledger: (page = 0, size = 20) => api.get(`/api/wallet/ledger?page=${page}&size=${size}`),
  transfer: (data) => api.post('/api/wallet/transfer', data),
  withdraw: (data) => api.post('/api/wallet/withdraw', data),
  statement: (from, to) => api.get(`/api/wallet/statement?from=${from}&to=${to}`),
  downloadStatement: (from, to) => api.get(`/api/wallet/statement/download?from=${from}&to=${to}`, { responseType: 'blob' }),
  createOrder: (amount) => api.post(`/api/payment/create-order?amount=${amount}`),
  verifyPayment: (data) => api.post('/api/payment/verify', data),
};

// ─── Rewards ─────────────────────────────────────────────────────────────────
export const rewardsApi = {
  summary: () => api.get('/api/rewards/summary'),
  catalog: () => api.get('/api/rewards/catalog'),
  transactions: () => api.get('/api/rewards/transactions'),
  redeem: (data) => api.post('/api/rewards/redeem', data),
  redeemPoints: (points) => api.post(`/api/rewards/redeem-points?points=${points}`),
};

// ─── User / KYC ──────────────────────────────────────────────────────────────
export const userApi = {
  profile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  kycStatus: () => api.get('/api/kyc/status'),
  kycSubmit: (formData) => api.post('/api/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => api.get('/api/admin/dashboard'),
  listUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/admin/users?${q}`);
  },
  getUser: (userId) => api.get(`/api/admin/users/${userId}`),
  blockUser: (userId) => api.patch(`/api/admin/users/${userId}/block`),
  unblockUser: (userId) => api.patch(`/api/admin/users/${userId}/unblock`),
  changeRole: (userId, newRole) => api.patch(`/api/admin/users/${userId}/role?newRole=${newRole}`),
  searchUsers: (q, page = 0, size = 20) => api.get(`/api/admin/users/search?q=${q}&page=${page}&size=${size}`),
  pendingKyc: (page = 0) => api.get(`/api/admin/kyc/pending?page=${page}`),
  approveKycById: (kycId) => api.post(`/api/admin/kyc/${kycId}/approve`),
  rejectKycById: (kycId, reason) => api.post(`/api/admin/kyc/${kycId}/reject?reason=${encodeURIComponent(reason)}`),
  approveKycByUserId: (userId) => api.post(`/api/admin/kyc/user/${userId}/approve`),
  rejectKycByUserId: (userId, reason) => api.post(`/api/admin/kyc/user/${userId}/reject?reason=${encodeURIComponent(reason)}`),
  addCatalogItem: (data) => api.post('/api/rewards/catalog/add', data),
};
