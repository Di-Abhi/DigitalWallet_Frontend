// ─── Transaction shape from /api/wallet/transactions ─────────────────────────
// The backend returns `type: 'TRANSFER'` for BOTH sender and receiver.
// To show the correct direction, we use `senderId` compared to the
// currently logged-in user's ID.
export interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  description?: string;
  referenceId?: string;
  createdAt?: string;
  // Present on TRANSFER transactions — identifies who sent and who received
  // API returns these as senderId / receiverId (not senderUserId / receiverUserId)
  senderId?:   number | null;
  receiverId?: number | null;
  // Legacy aliases kept for safety (unused by API)
  senderUserId?:   number | null;
  receiverUserId?: number | null;
}

// ─── Direction helpers ────────────────────────────────────────────────────────
// Types that are ALWAYS received (no sender/receiver concept needed)
export const ALWAYS_RECEIVED = ['TOPUP', 'CASHBACK'] as const;
// Types that are ALWAYS sent (no sender/receiver concept needed)
export const ALWAYS_SENT     = ['WITHDRAW', 'REDEEM'] as const;

/**
 * Returns the true direction of a transaction FROM THE CURRENT USER'S PERSPECTIVE.
 *
 * Rules:
 * - TOPUP, CASHBACK  → always "received"  (money comes into wallet)
 * - WITHDRAW, REDEEM → always "sent"      (money leaves wallet)
 * - TRANSFER         → check senderId vs currentUserId
 *                      • if I am the sender   → "sent"
 *                      • if I am the receiver → "received"
 *                      • if unknown (null)    → fall back to "sent" (safe default)
 *
 * NOTE: The API returns `senderId` (not `senderUserId`). Pass `tx.senderId` here.
 */
export function getDirection(
  type: string,
  currentUserId?: number | null,
  senderId?: number | null,
): 'received' | 'sent' {
  if ((ALWAYS_RECEIVED as readonly string[]).includes(type)) return 'received';
  if ((ALWAYS_SENT     as readonly string[]).includes(type)) return 'sent';

  // TRANSFER: compare IDs
  if (type === 'TRANSFER') {
    if (currentUserId != null && senderId != null) {
      return currentUserId === senderId ? 'sent' : 'received';
    }
    return 'sent';
  }

  return 'sent';
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
export type DirectionTab = 'all' | 'sent' | 'received';

export const TYPE_OPTIONS   = ['TOPUP', 'TRANSFER', 'WITHDRAW', 'CASHBACK', 'REDEEM']
  .map((t) => ({ value: t, label: t }));
export const STATUS_OPTIONS = ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED']
  .map((s) => ({ value: s, label: s }));