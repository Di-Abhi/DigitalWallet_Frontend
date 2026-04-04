import { Eye, EyeOff, Lock } from 'lucide-react';
import { InputField } from '../../../shared/components/Input';

interface Props {
  showPw:    boolean;
  onToggle:  () => void;
  [key: string]: any;
}

export function PasswordInput({ showPw, onToggle, ...props }: Props) {
  return (
    <InputField
      {...props}
      icon={Lock}
      type={showPw ? 'text' : 'password'}
      rightElement={
        <button type="button"
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-0.5"
          onClick={onToggle}
          aria-label={showPw ? 'Hide password' : 'Show password'}>
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}
