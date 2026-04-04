import { Plus } from 'lucide-react';
import { Modal } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField } from '../../../shared/components/Input';
import { CATALOG_TYPES, EMPTY_CATALOG, type CatalogForm } from '../types';

interface Props {
  open:       boolean;
  form:       CatalogForm;
  onOpen:     () => void;
  onClose:    () => void;
  onChange:   (key: keyof CatalogForm, value: string) => void;
  onSubmit:   () => void;
}

export function CatalogTab({ open, form, onOpen, onClose, onChange, onSubmit }: Props) {
  return (
    <div className="space-y-4">
      <Button icon={<Plus className="w-4 h-4" />} onClick={onOpen}>
        Add Catalog Item
      </Button>
      <div className="card p-6">
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          Use "Add Catalog Item" to create new rewards for users.<br />
          <span className="text-xs">Items added here will appear in the Rewards Catalog.</span>
        </p>
      </div>

      <Modal open={open} onClose={onClose} title="Add Reward Item" size="lg">
        <div className="grid grid-cols-2 gap-4">
          {([
            { label: 'Name',                key: 'name'           as keyof CatalogForm, type: 'text',   placeholder: 'e.g. 10% Cashback' },
            { label: 'Points Required',     key: 'pointsRequired' as keyof CatalogForm, type: 'number', placeholder: '100' },
            { label: 'Stock',               key: 'stock'          as keyof CatalogForm, type: 'number', placeholder: '50' },
            { label: 'Cashback Amount (₹)', key: 'cashbackAmount' as keyof CatalogForm, type: 'number', placeholder: '0' },
          ] as const).map(({ label, key, type, placeholder }) => (
            <InputField key={key} label={label} type={type} placeholder={placeholder}
              value={form[key]}
              onChange={(e) => onChange(key, e.target.value)}
            />
          ))}
          <SelectField label="Type" options={CATALOG_TYPES} value={form.type}
            onChange={(e) => onChange('type', e.target.value)} />
          <div className="col-span-2">
            <InputField label="Description" placeholder="Short description" value={form.description}
              onChange={(e) => onChange('description', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth onClick={onSubmit}>Add Item</Button>
        </div>
      </Modal>
    </div>
  );
}
