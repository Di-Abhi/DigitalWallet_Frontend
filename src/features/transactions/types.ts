// ─── Transaction shape from /api/wallet/transactions ─────────────────────────
// The backend returns `type: 'TRANSFER'` for BOTH sender and receiver.
// To show the correct direction, we use `senderUserId` compared to the
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
 * - TRANSFER         → check senderUserId vs currentUserId
 *                      • if I am the sender   → "sent"
 *                      • if I am the receiver → "received"
 *                      • if unknown (null)    → fall back to "sent" (safe default)
 */
export function getDirection(
  type: string,
  currentUserId?: number | null,
  senderUserId?: number | null,
): 'received' | 'sent' {
  if ((ALWAYS_RECEIVED as readonly string[]).includes(type)) return 'received';
  if ((ALWAYS_SENT     as readonly string[]).includes(type)) return 'sent';

  // TRANSFER: compare IDs
  if (type === 'TRANSFER') {
    if (currentUserId != null && senderUserId != null) {
      return currentUserId === senderUserId ? 'sent' : 'received';
    }
    // Fallback: description often says "Transfer from …" vs "Transfer to …"
    // This is a best-effort heuristic when IDs are not present
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
