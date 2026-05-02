import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, ElementType, memo } from 'react';
import { Search, CheckCircle } from 'lucide-react';

// ─── Shared error type (compatible with react-hook-form FieldError) ──────────
export interface FieldErrorLike { message?: string; }

function cls(...parts: (string | false | undefined)[]) { return parts.filter(Boolean).join(' '); }

// ─── FormGroup ────────────────────────────────────────────────────────────────
interface FormGroupProps { label?: string; htmlFor?: string; error?: FieldErrorLike; children: ReactNode; className?: string; }
export function FormGroup({ label, htmlFor, error, children, className = '' }: FormGroupProps) {
  return (
    <div className={className}>
      {label && <label className="label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {error?.message && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1" role="alert">{error.message}</p>}
    </div>
  );
}

// ─── InputField ───────────────────────────────────────────────────────────────
export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:        string;
  icon?:         ElementType;
  error?:        FieldErrorLike;
  rightElement?: ReactNode;
  hint?:         string;
}

export const InputField = memo(function InputField({ label, icon: Icon, error, rightElement, hint, className = '', id, ...props }: InputFieldProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <FormGroup label={label} htmlFor={inputId} error={error}>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />}
        <input
          id={inputId}
          className={cls(
  'input-field',
  !!Icon && 'pl-10',
  !!rightElement && 'pr-12',
  !!error && 'border-red-500 focus:ring-red-500/50',
  className || undefined
)}
        />
        {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
      {hint && !error && <p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1">{hint}</p>}
    </FormGroup>
  );
});

// ─── SelectField ──────────────────────────────────────────────────────────────
export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string;
  error?:       FieldErrorLike;
  placeholder?: string;
  options:      { value: string; label: string }[];
}

export const SelectField = memo(function SelectField({ label, error, placeholder, options, className = '', id, ...props }: SelectFieldProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <FormGroup label={label} htmlFor={selectId} error={error}>
      <select id={selectId} className={cls('input-field', error && 'border-red-500 focus:ring-red-500/50', className)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label: l }) => <option key={value} value={value}>{l}</option>)}
      </select>
    </FormGroup>
  );
});

// ─── TextareaField ────────────────────────────────────────────────────────────
export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldErrorLike;
}

export const TextareaField = memo(function TextareaField({ label, error, className = '', id, ...props }: TextareaFieldProps) {
  const areaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <FormGroup label={label} htmlFor={areaId} error={error}>
      <textarea id={areaId} className={cls('input-field resize-none', error && 'border-red-500 focus:ring-red-500/50', className)} {...props} />
    </FormGroup>
  );
});

// ─── SearchInput ──────────────────────────────────────────────────────────────
export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export const SearchInput = memo(function SearchInput({ className = '', containerClassName = '', ...props }: SearchInputProps) {
  return (
    <div className={cls('relative', containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
      <input type="search" className={cls('input-field pl-9', className)} {...props} />
    </div>
  );
});

// ─── AmountInput ──────────────────────────────────────────────────────────────
export interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?:    string;
  error?:    FieldErrorLike;
  currency?: string;
  hint?:     string;
}

export const AmountInput = memo(function AmountInput({ label, error, currency = '₹', hint, className = '', id, ...props }: AmountInputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <FormGroup label={label} htmlFor={inputId} error={error}>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium pointer-events-none select-none">{currency}</span>
        <input id={inputId} type="number" inputMode="decimal" className={cls('input-field pl-8', error && 'border-red-500 focus:ring-red-500/50', className)} {...props} />
      </div>
      {hint && !error && <p className="text-xs text-[var(--text-muted)] mt-1.5">{hint}</p>}
    </FormGroup>
  );
});

// ─── OtpInput ─────────────────────────────────────────────────────────────────
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number; }) {
  // Focus a specific box by index
  const focusBox = (parent: HTMLElement, index: number) => {
    const box = parent.querySelectorAll<HTMLInputElement>('input')[index];
    box?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="OTP input">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/, '');
            const arr = value.split('');
            arr[i] = char;
            onChange(arr.join('').slice(0, length));
            if (char && e.target.nextElementSibling)
              (e.target.nextElementSibling as HTMLInputElement).focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && e.currentTarget.previousElementSibling)
              (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
            // Allow arrow key navigation between boxes
            if (e.key === 'ArrowLeft' && e.currentTarget.previousElementSibling)
              (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
            if (e.key === 'ArrowRight' && e.currentTarget.nextElementSibling)
              (e.currentTarget.nextElementSibling as HTMLInputElement).focus();
          }}
          onPaste={(e) => {
            // Handle paste: extract digits, fill all boxes from current position
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
            if (!pasted) return;
            const arr = value.split('');
            pasted.split('').forEach((ch, idx) => { arr[i + idx] = ch; });
            const next = arr.join('').slice(0, length);
            onChange(next);
            // Focus the box after the last pasted digit
            const lastFilled = Math.min(i + pasted.length, length - 1);
            focusBox(e.currentTarget.parentElement!, lastFilled);
          }}
          className="w-11 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-slate-800/80 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
      ))}
    </div>
  );
}

// ─── PasswordStrength ─────────────────────────────────────────────────────────
const PW_CHECKS = [
  { label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number',    test: (p: string) => /\d/.test(p) },
  { label: 'Symbol',    test: (p: string) => /[@$!%*?&]/.test(p) },
  { label: '8+ chars',  test: (p: string) => p.length >= 8 },
];
const PW_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
const PW_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = PW_CHECKS.map((c) => ({ ...c, ok: c.test(password) }));
  const score  = checks.filter((c) => c.ok).length;
  return (
    <div className="mt-2.5 space-y-2" aria-label="Password strength">
      <div className="flex gap-1" role="progressbar" aria-valuenow={score} aria-valuemax={4}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cls('h-1.5 flex-1 rounded-full transition-all', i < score ? PW_COLORS[score - 1] : 'bg-slate-200 dark:bg-slate-700')} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {checks.map((c) => (
            <div key={c.label} className={cls('flex items-center gap-1 text-xs', c.ok ? 'text-emerald-500' : 'text-[var(--text-muted)]')}>
              <CheckCircle className={cls('w-3 h-3', !c.ok && 'opacity-40')} aria-hidden="true" />
              {c.label}
            </div>
          ))}
        </div>
        {score > 0 && <span className={cls('text-xs font-semibold', PW_COLORS[score - 1].replace('bg-', 'text-'))}>{PW_LABELS[score - 1]}</span>}
      </div>
    </div>
  );
}
