import api from './client';
// ─── Wallet ──────────────────────────────────────────────────────────────────
export const walletApi = {
  balance: () => api.get('/api/wallet/balance'),
  transactions: (page = 0, size = 10) => api.get(`/api/wallet/transactions?page=${page}&size=${size}`),
  ledger: (page = 0, size = 20) => api.get(`/api/wallet/ledger?page=${page}&size=${size}`),
  transfer: (data: object) => api.post('/api/wallet/transfer', data),
  withdraw: (data: object) => api.post('/api/wallet/withdraw', data),
  statement: (from: string, to: string) => api.get(`/api/wallet/statement?from=${from}&to=${to}`),
  downloadStatement: (from: string, to: string) =>
    api.get(`/api/wallet/statement/download?from=${from}&to=${to}`, { responseType: 'blob' }),
  createOrder: (amount: number) => api.post(`/api/payment/create-order?amount=${amount}`),
  verifyPayment: (data: object) => api.post('/api/payment/verify', data),
  receiverSuggestion: (identifier: string) =>
    api.get(`/api/wallet/transfer/receiver?identifier=${encodeURIComponent(identifier)}`),
};