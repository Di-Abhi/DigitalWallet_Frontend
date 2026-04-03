import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, ElementType, memo } from 'react';
import { CheckCircle } from 'lucide-react';

// ─── Shared error type (compatible with react-hook-form FieldError) ─────────
export interface FieldErrorLike {
  message?: string;
}

// ─── Form Group wrapper ───────────────────────────────────────────────────────
interface FormGroupProps {
  label?: string;
  error?: FieldErrorLike;
  children: ReactNode;
  className?: string;
}

export function FormGroup({ label, error, children, className = '' }: FormGroupProps) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ElementType;
  error?: FieldErrorLike;
  rightElement?: ReactNode;
}

export const InputField = memo(function InputField({
  label,
  icon: Icon,
  error,
  rightElement,
  className = '',
  ...props
}: InputFieldProps) {
  return (
    <FormGroup label={label} error={error}>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
            aria-hidden="true"
          />
        )}
        <input
          className={`
            input-field
            ${Icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </FormGroup>
  );
});

// ─── Select Field ─────────────────────────────────────────────────────────────
interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldErrorLike;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const SelectField = memo(function SelectField({
  label,
  error,
  placeholder,
  options,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <FormGroup label={label} error={error}>
      <select
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label: optLabel }) => (
          <option key={value} value={value}>
            {optLabel}
          </option>
        ))}
      </select>
    </FormGroup>
  );
});

// ─── Textarea Field ───────────────────────────────────────────────────────────
interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldErrorLike;
}

export const TextareaField = memo(function TextareaField({
  label,
  error,
  className = '',
  ...props
}: TextareaFieldProps) {
  return (
    <FormGroup label={label} error={error}>
      <textarea
        className={`input-field resize-none ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`}
        {...props}
      />
    </FormGroup>
  );
});

// ─── Search Input ─────────────────────────────────────────────────────────────
import { Search } from 'lucide-react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export const SearchInput = memo(function SearchInput({
  className = '',
  containerClassName = '',
  ...props
}: SearchInputProps) {
  return (
    <div className={`relative ${containerClassName}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        className={`input-field pl-9 ${className}`}
        {...props}
      />
    </div>
  );
});

// ─── OTP Input ────────────────────────────────────────────────────────────────
interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
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
            if (char && e.target.nextElementSibling) {
              (e.target.nextElementSibling as HTMLInputElement).focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && e.currentTarget.previousElementSibling) {
              (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
            }
          }}
          className="w-11 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-slate-800/80 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
      ))}
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
interface PasswordStrengthProps {
  password: string;
}

const PW_CHECKS = [
  { label: 'Uppercase', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Number',    test: (pw: string) => /\d/.test(pw) },
  { label: 'Symbol',    test: (pw: string) => /[@$!%*?&]/.test(pw) },
  { label: '8+ chars',  test: (pw: string) => pw.length >= 8 },
];

const PW_SCORE_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
const PW_SCORE_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const checks = PW_CHECKS.map((c) => ({ ...c, ok: c.test(password) }));
  const score = checks.filter((c) => c.ok).length;

  return (
    <div className="mt-2.5 space-y-2" aria-label="Password strength">
      <div className="flex gap-1" role="progressbar" aria-valuenow={score} aria-valuemax={4}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < score ? PW_SCORE_COLORS[score - 1] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {checks.map((c) => (
            <div
              key={c.label}
              className={`flex items-center gap-1 text-xs ${
                c.ok ? 'text-emerald-500' : 'text-[var(--text-muted)]'
              }`}
            >
              <CheckCircle className={`w-3 h-3 ${c.ok ? '' : 'opacity-40'}`} aria-hidden="true" />
              {c.label}
            </div>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-semibold ${PW_SCORE_COLORS[score - 1].replace('bg-', 'text-')}`}>
            {PW_SCORE_LABELS[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Amount Input ─────────────────────────────────────────────────────────────
interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: FieldErrorLike;
  currency?: string;
}

export const AmountInput = memo(function AmountInput({
  label,
  error,
  currency = '₹',
  className = '',
  ...props
}: AmountInputProps) {
  return (
    <FormGroup label={label} error={error}>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium pointer-events-none">
          {currency}
        </span>
        <input
          type="number"
          inputMode="decimal"
          className={`input-field pl-8 ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`}
          {...props}
        />
      </div>
    </FormGroup>
  );
});
