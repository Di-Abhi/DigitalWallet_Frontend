// ─── User / KYC ──────────────────────────────────────────────────────────────
import api from './client';
export const userApi = {
  profile: () => api.get('/api/users/profile'),
  updateProfile: (data: object) => api.put('/api/users/profile', data),
  kycStatus: () => api.get('/api/kyc/status'),
  kycSubmit: (formData: FormData) =>
    api.post('/api/kyc/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};