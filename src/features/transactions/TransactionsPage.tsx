import { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, Download, ArrowUpRight, ArrowDownLeft, Flag } from 'lucide-react';
import { walletApi } from '../../core/api/walletApi';
import { StatusBadge, LoadingPage, EmptyState } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useDebounce } from '../../store/hooks';
import { getApiErrorMessage } from '../../core/api/types';
import { formatCurrency as fmt, formatDateTime as fmtDate, downloadCsv } from '../../shared/utils';
import { Button, IconButton, Pagination } from '../../shared/components/Button';
import { SearchInput, SelectField } from '../../shared/components/Input';

const CREDIT_TYPES  = ['TOPUP', 'CASHBACK'];
const TX_TYPES      = ['TOPUP', 'TRANSFER', 'WITHDRAW', 'CASHBACK', 'REDEEM'];
const TX_STATUSES   = ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'];
const TYPE_OPTIONS  = TX_TYPES.map((t) => ({ value: t, label: t }));
const STATUS_OPTIONS = TX_STATUSES.map((s) => ({ value: s, label: s }));

interface Transaction {
  id: number; type: string; amount: number; status: string;
  description?: string; referenceId?: string; createdAt?: string;
}

export default function TransactionsPage() {
  const [txns, setTxns]               = useState<Transaction[]>([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [typeFilter, setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]           = useState('');
  const debouncedSearch               = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await walletApi.transactions(page, 10);
      setTxns(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load transactions')); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filteredTxns = useMemo(() => {
    let data = [...txns];
    if (typeFilter)        data = data.filter((t) => t.type === typeFilter);
    if (statusFilter)      data = data.filter((t) => t.status === statusFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter((t) => t.referenceId?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
    return data;
  }, [txns, typeFilter, statusFilter, debouncedSearch]);

  const handleExport = () => {
    downloadCsv(
      ['ID', 'Type', 'Amount', 'Status', 'Description', 'Date'],
      filteredTxns.map((t) => [t.id, t.type, t.amount, t.status, t.description || '', t.createdAt || '']),
      'transactions.csv',
    );
  };

  const clearFilters = () => { setTypeFilter(''); setStatusFilter(''); setSearch(''); setPage(0); };
  const hasFilters   = !!(typeFilter || statusFilter || search);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5" aria-live="polite">
            {hasFilters ? `${filteredTxns.length} of ${totalElements} records` : `${totalElements} total records`}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} icon={<Download className="w-4 h-4" />}
          aria-label="Export transactions as CSV">
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center" role="search" aria-label="Transaction filters">
        <SearchInput
          containerClassName="flex-1 min-w-48"
          placeholder="Search by ref ID or description…"
          aria-label="Search transactions"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        <SelectField
          options={TYPE_OPTIONS}
          placeholder="All Types"
          aria-label="Filter by type"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          className="w-auto"
        />
        <SelectField
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="w-auto"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} aria-label="Clear all filters">
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <LoadingPage /> : filteredTxns.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions found" desc="Try adjusting your filters" />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm" role="grid" aria-label="Transaction list">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    {['Transaction', 'Type', 'Amount', 'Status', 'Date', 'Action'].map((h) => (
                      <th key={h} scope="col" className={`p-4 ${h === 'Amount' ? 'text-right' : h === 'Status' || h === 'Action' ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTxns.map((tx) => {
                    const isCredit = CREDIT_TYPES.includes(tx.type);
                    return (
                      <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`} aria-hidden="true">
                              {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-semibold">#{tx.id}</div>
                              <div className="text-xs text-[var(--text-muted)] truncate max-w-32">{tx.description || tx.referenceId || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4"><StatusBadge status={tx.type} /></td>
                        <td className="p-4 text-right">
                          <span className={`amount font-bold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                            {isCredit ? '+' : '−'}{fmt(tx.amount)}
                          </span>
                        </td>
                        <td className="p-4 text-center"><StatusBadge status={tx.status} /></td>
                        <td className="p-4 text-xs text-[var(--text-muted)]">{fmtDate(tx.createdAt)}</td>
                        <td className="p-4 text-center">
                          <IconButton icon={<Flag className="w-3 h-3" />} label={`Dispute transaction #${tx.id}`} size="sm"
                            onClick={() => toast.info(`Dispute filed for transaction #${tx.id}`)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {filteredTxns.map((tx) => {
                const isCredit = CREDIT_TYPES.includes(tx.type);
                return (
                  <div key={tx.id} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`} aria-hidden="true">
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">#{tx.id} • {tx.type}</div>
                        <div className="text-xs text-[var(--text-muted)]">{fmtDate(tx.createdAt)}</div>
                      </div>
                      <div className={`amount font-bold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isCredit ? '+' : '−'}{fmt(tx.amount)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <StatusBadge status={tx.status} />
                      {tx.description && <span className="text-xs text-[var(--text-muted)] truncate">{tx.description}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="p-4 border-t border-[var(--border)]" />
          </>
        )}
      </div>
    </div>
  );
}
