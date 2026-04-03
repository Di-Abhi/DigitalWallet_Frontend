import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode, memo } from 'react';
import { Spinner } from './UI';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
};

const SIZE: Record<ButtonSize, string> = {
  xs: 'py-1 px-2.5 text-xs',
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2.5 px-4 text-sm',
  lg: 'py-3 px-5 text-base',
};

function cls(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

// ─── Button ───────────────────────────────────────────────────────────────────
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  fullWidth?: boolean;
  icon?:      ReactNode;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  children:   ReactNode;
}

export const Button = memo(function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  fullWidth = false,
  icon,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const left = icon ?? leftIcon;
  return (
    <button
      className={cls(VARIANT[variant], SIZE[size], fullWidth && 'w-full', 'flex items-center justify-center gap-2', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading
        ? <Spinner size="sm" />
        : <>{left && <span aria-hidden="true">{left}</span>}{children}{rightIcon && <span aria-hidden="true">{rightIcon}</span>}</>
      }
    </button>
  );
});

// ─── LinkButton ───────────────────────────────────────────────────────────────
export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  fullWidth?: boolean;
  icon?:      ReactNode;
  rightIcon?: ReactNode;
  children:   ReactNode;
}

export const LinkButton = memo(function LinkButton({
  variant = 'primary', size = 'md', fullWidth = false, icon, rightIcon, children, className = '', ...props
}: LinkButtonProps) {
  return (
    <a className={cls(VARIANT[variant], SIZE[size], fullWidth && 'w-full', 'inline-flex items-center justify-center gap-2', className)} {...props}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
      {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </a>
  );
});

// ─── IconButton ───────────────────────────────────────────────────────────────
const ICON_PAD: Record<ButtonSize, string> = { xs: 'p-1', sm: 'p-1.5', md: 'p-2', lg: 'p-2.5' };

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon:     ReactNode;
  label:    string;
  variant?: ButtonVariant;
  size?:    ButtonSize;
}

export const IconButton = memo(function IconButton({
  icon, label, variant = 'ghost', size = 'md', className = '', ...props
}: IconButtonProps) {
  return (
    <button className={cls(VARIANT[variant], ICON_PAD[size], 'rounded-lg', className)} aria-label={label} title={label} {...props}>
      <span aria-hidden="true">{icon}</span>
    </button>
  );
});

// ─── TabButton ────────────────────────────────────────────────────────────────
export interface TabButtonProps {
  active:     boolean;
  onClick:    () => void;
  children:   ReactNode;
  icon?:      ReactNode;
  className?: string;
}

export const TabButton = memo(function TabButton({ active, onClick, children, icon, className = '' }: TabButtonProps) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cls(
        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all',
        active ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]',
        className,
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
});

// ─── TabBar ───────────────────────────────────────────────────────────────────
export function TabBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div role="tablist" className={cls('flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl', className)}>
      {children}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationProps {
  page: number; totalPages: number; onPageChange: (page: number) => void; className?: string;
}

export const Pagination = memo(function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className={cls('flex items-center justify-center gap-2', className)} role="navigation" aria-label="Pagination">
      <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 0} aria-label="Previous page">← Prev</Button>
      <span className="text-sm text-[var(--text-muted)]" aria-live="polite">Page {page + 1} / {totalPages}</span>
      <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} aria-label="Next page">Next →</Button>
    </div>
  );
});
