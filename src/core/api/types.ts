// ─── Typed API Error ──────────────────────────────────────────────────────────
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  path?: string;
}

export interface ApiError {
  response?: {
    status: number;
    data?: ApiErrorResponse;
  };
  message?: string;
}

export function getApiErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  const e = err as ApiError;
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;
}

export function isWalletNotFound(err: unknown): boolean {
  const e = err as ApiError;
  const status = e?.response?.status;
  const msg = (e?.response?.data?.message || '').toLowerCase();
  return (
    status === 404 ||
    msg.includes('wallet not found') ||
    msg.includes('wallet does not exist') ||
    msg.includes('no wallet') ||
    msg.includes('wallet not activated') ||
    msg.includes('wallet inactive')
  );
}

export function isReceiverNotFound(err: unknown): boolean {
  const e = err as ApiError;
  const status = e?.response?.status;
  const msg = (e?.response?.data?.message || '').toLowerCase();

  return (
    status === 404 ||
    msg.includes('user not found') ||
    msg.includes('receiver not found') ||
    msg.includes('phone not registered') ||
    msg.includes('invalid receiver')
  );
}
