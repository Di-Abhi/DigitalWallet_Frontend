export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'REJECTED' | 'APPROVED' | null;
export type PayStatus = 'idle' | 'creatingOrder' | 'paying' | 'verifying' | 'success' | 'failed';

export interface Balance {
  balance: number;
  status?: string;
  lastUpdated?: string;
}

export interface LedgerEntry {
  id: number;
  type: string;
  amount: number;
  description?: string;
  referenceId?: string;
  createdAt?: string;
}

export const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

declare global {
  interface Window { Razorpay: any; }
}
