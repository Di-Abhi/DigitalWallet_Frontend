import { Modal } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import { AmountInput } from '../../../shared/components/Input';
import { formatCurrency as fmt } from '../../../shared/utils';
import type { Balance } from '../types';

interface Props {
  open:     boolean;
  balance:  Balance | null;
  amount:   string;
  loading:  boolean;
  onAmount: (v: string) => void;
  onClose:  () => void;
  onSubmit: () => void;
}

export function WithdrawModal({ open, balance, amount, loading, onAmount, onClose, onSubmit }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Withdraw Funds">
      <div className="space-y-4">
        <AmountInput
          label="Amount"
          min={1}
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          hint={`Available: ${fmt(balance?.balance)}`}
          className="text-2xl font-mono"
          autoFocus
        />
        <Button
          fullWidth
          loading={loading}
          disabled={!amount || Number(amount) < 1}
          onClick={onSubmit}
        >
          Withdraw {amount ? fmt(amount) : ''}
        </Button>
      </div>
    </Modal>
  );
}
