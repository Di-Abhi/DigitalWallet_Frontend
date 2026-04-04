import { Button } from '../../../shared/components/Button';
import { SearchInput, SelectField } from '../../../shared/components/Input';

const TYPE_OPTIONS   = ['TOPUP','TRANSFER','WITHDRAW','CASHBACK','REDEEM'].map((t) => ({ value: t, label: t }));
const STATUS_OPTIONS = ['PENDING','SUCCESS','FAILED','REVERSED'].map((s) => ({ value: s, label: s }));

interface Props {
  search:       string;
  typeFilter:   string;
  statusFilter: string;
  onSearch:     (v: string) => void;
  onType:       (v: string) => void;
  onStatus:     (v: string) => void;
  onClear:      () => void;
}

export function TransactionFilters({ search, typeFilter, statusFilter, onSearch, onType, onStatus, onClear }: Props) {
  const hasFilters = !!(typeFilter || statusFilter || search);
  return (
    <div className="card p-4 flex flex-wrap gap-3 items-center" role="search" aria-label="Transaction filters">
      <SearchInput
        containerClassName="flex-1 min-w-48"
        placeholder="Search by ref ID or description…"
        aria-label="Search transactions"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <SelectField options={TYPE_OPTIONS}   placeholder="All Types"    value={typeFilter}   onChange={(e) => onType(e.target.value)}   className="w-auto" />
      <SelectField options={STATUS_OPTIONS} placeholder="All Statuses" value={statusFilter} onChange={(e) => onStatus(e.target.value)} className="w-auto" />
      {hasFilters && <Button variant="ghost" size="sm" onClick={onClear} aria-label="Clear all filters">Clear filters</Button>}
    </div>
  );
}
