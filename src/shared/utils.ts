// ─── Currency Formatting ──────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupees.
 * @example formatCurrency(1234.5) → "₹1,234.50"
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  currency = '₹',
): string {
  return `${currency}${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats a number as a plain locale string (no currency symbol).
 * @example formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(value: number | undefined | null): string {
  return Number(value || 0).toLocaleString();
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

/**
 * Formats an ISO date string to a readable date + time string.
 * @example formatDateTime("2024-01-15T10:30:00Z") → "15 Jan 2024, 10:30 AM"
 */
export function formatDateTime(date?: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats an ISO date string to a date-only string.
 * @example formatDate("2024-01-15T10:30:00Z") → "15 Jan 2024"
 */
export function formatDate(date?: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns relative time string.
 * @example timeAgo("2024-01-14T10:30:00Z") → "2 days ago"
 */
export function timeAgo(date: string | null | undefined): string {
  if (!date) return '—';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [secs, unit] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

// ─── CSV Download ─────────────────────────────────────────────────────────────

/**
 * Generates and triggers a CSV download.
 */
export function downloadCsv(
  headers: string[],
  rows: (string | number)[][],
  filename = 'download.csv',
): void {
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

export const VALIDATION = {
  required: (label: string) => ({ required: `${label} is required` }),

  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address',
    },
  },

  phone: {
    required: 'Phone is required',
    pattern: {
      value: /^[0-9]{10,15}$/,
      message: 'Invalid phone number',
    },
  },

  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Min 8 characters' },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      message: 'Must contain uppercase, number & symbol',
    },
  },

  fullName: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Min 2 characters' },
  },
} as const;

// ─── Class Utility ────────────────────────────────────────────────────────────

/** Merges class names, filtering out falsy values. */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
