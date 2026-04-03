import api from './client';
// ─── Rewards ─────────────────────────────────────────────────────────────────
export const rewardsApi = {
  summary: () => api.get('/api/rewards/summary'),
  catalog: () => api.get('/api/rewards/catalog'),
  transactions: () => api.get('/api/rewards/transactions'),
  redeem: (data: object) => api.post('/api/rewards/redeem', data),
  redeemPoints: (points: number) => api.post(`/api/rewards/redeem-points?points=${points}`),
};