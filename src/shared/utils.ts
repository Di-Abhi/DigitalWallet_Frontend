// ─── Currency Formatting ──────────────────────────────────────────────────────
export function formatCurrency(amount: number | string | undefined | null, currency = '₹'): string {
  return `${currency}${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number | undefined | null): string {
  return Number(value || 0).toLocaleString();
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export function formatDateTime(date?: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date?: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(date: string | null | undefined): string {
  if (!date) return '—';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals: [number, string][] = [[31536000,'year'],[2592000,'month'],[86400,'day'],[3600,'hour'],[60,'minute']];
  for (const [secs, unit] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

// ─── CSV Download ─────────────────────────────────────────────────────────────
export function downloadCsv(headers: string[], rows: (string | number)[][], filename = 'download.csv'): void {
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Validation Helpers ───────────────────────────────────────────────────────
// Patterns match the backend Swagger schema exactly:
//   SignupRequest.phone:    "^[0-9]{10,15}$"
//   PhoneLoginRequest.phone: "^[0-9]{10}$"
//   SignupRequest.password:  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])..."
export const VALIDATION = {
  required: (label: string) => ({ required: `${label} is required` }),

  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Enter a valid email address',
    },
  },

  // Used for signup — backend accepts 10-15 digits
  phone: {
    required: 'Phone is required',
    pattern: {
      value: /^[0-9]{10,15}$/,
      message: 'Enter a valid 10–15 digit phone number',
    },
  },

  // Used for phone login — backend requires exactly 10 digits
  phoneLogin: {
    required: 'Phone is required',
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Enter a valid 10-digit phone number',
    },
  },

  // Matches backend pattern: lowercase + uppercase + digit + special char, min 8
  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Min 8 characters' },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      message: 'Must contain uppercase, lowercase, number & symbol (@$!%*?&)',
    },
  },

  fullName: {
  required: 'Name is required',
  minLength: { value: 2, message: 'Min 2 characters' },
  maxLength: { value: 100, message: 'Max 100 characters' },
  pattern: {
    value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
    message: 'Enter a valid name',
  },
},
} as const;

// ─── Class Utility ────────────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}