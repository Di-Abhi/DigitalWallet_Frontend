import { ButtonHTMLAttributes, ReactNode, memo } from 'react';
import { Spinner } from './UI';

// ─── Button Variants ──────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2.5 px-4 text-sm',
  lg: 'py-3 px-5 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          {children}
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

// ─── Icon Button ──────────────────────────────────────────────────────────────
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
}

const ICON_SIZE_CLASSES: Record<string, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

export const IconButton = memo(function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`${VARIANT_CLASSES[variant]} ${ICON_SIZE_CLASSES[size]} rounded-lg ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
});

// ─── Tab Button ───────────────────────────────────────────────────────────────
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const TabButton = memo(function TabButton({
  active,
  onClick,
  children,
  icon,
  className = '',
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all
        ${active
          ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--text)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
        }
        ${className}
      `}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
});

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
interface TabBarProps {
  children: ReactNode;
  className?: string;
}

export function TabBar({ children, className = '' }: TabBarProps) {
  return (
    <div className={`flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = memo(function Pagination({
  page,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} role="navigation" aria-label="Pagination">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
      >
        ←
      </Button>
      <span className="text-sm text-[var(--text-muted)]" aria-current="page">
        Page {page + 1} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
      >
        →
      </Button>
    </div>
  );
});
