import { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, Download, Search, ArrowUpRight, ArrowDownLeft, Flag } from 'lucide-react';
import { walletApi } from '../../core/api/services';
import { StatusBadge, LoadingPage, EmptyState } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useDebounce } from '../../store/hooks';
import { getApiErrorMessage } from '../../core/api/types';

function fmt(a: number): string {
  return `₹${Number(a || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}
function fmtDate(d?: string | null): string {
  return d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';
}

const CREDIT_TYPES = ['TOPUP', 'CASHBACK'];
const TX_TYPES = ['TOPUP', 'TRANSFER', 'WITHDRAW', 'CASHBACK', 'REDEEM'];
const TX_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'];

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  description?: string;
  referenceId?: string;
  createdAt?: string;
}

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // ── Debounce search so we don't re-fetch on every keystroke ─────────────
  const debouncedSearch = useDebounce(search, 400);

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

  // ── Client-side filtering with useMemo (avoids extra API call for search) ─
  const filteredTxns = useMemo(() => {
    let data = [...txns];
    if (typeFilter) data = data.filter((t) => t.type === typeFilter);
    if (statusFilter) data = data.filter((t) => t.status === statusFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter((t) =>
        t.referenceId?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [txns, typeFilter, statusFilter, debouncedSearch]);

  const downloadCsv = () => {
    const headers = ['ID', 'Type', 'Amount', 'Status', 'Description', 'Date'];
    const rows = filteredTxns.map((t) => [t.id, t.type, t.amount, t.status, t.description || '', t.createdAt || '']);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters = !!(typeFilter || statusFilter || search);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5" aria-live="polite">
            {hasFilters ? `${filteredTxns.length} of ${totalElements} records` : `${totalElements} total records`}
          </p>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm" onClick={downloadCsv} aria-label="Export transactions as CSV">
          <Download className="w-4 h-4" aria-hidden="true" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center" role="search" aria-label="Transaction filters">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
          <input
            className="input-field pl-9"
            placeholder="Search by ref ID or description…"
            aria-label="Search transactions"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select
          className="input-field w-auto"
          aria-label="Filter by type"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}>
          <option value="">All Types</option>
          {TX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="input-field w-auto"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">All Statuses</option>
          {TX_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button className="btn-ghost text-sm"
            onClick={() => { setTypeFilter(''); setStatusFilter(''); setSearch(''); setPage(0); }}
            aria-label="Clear all filters">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingPage />
        ) : filteredTxns.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions found" desc="Try adjusting your filters" />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm" role="grid" aria-label="Transaction list">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    <th scope="col" className="text-left p-4">Transaction</th>
                    <th scope="col" className="text-left p-4">Type</th>
                    <th scope="col" className="text-right p-4">Amount</th>
                    <th scope="col" className="text-center p-4">Status</th>
                    <th scope="col" className="text-left p-4">Date</th>
                    <th scope="col" className="text-center p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTxns.map((tx) => (
                    <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            CREDIT_TYPES.includes(tx.type)
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                          }`} aria-hidden="true">
                            {CREDIT_TYPES.includes(tx.type)
                              ? <ArrowDownLeft className="w-4 h-4" />
                              : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-semibold">#{tx.id}</div>
                            <div className="text-xs text-[var(--text-muted)] truncate max-w-32">
                              {tx.description || tx.referenceId || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><StatusBadge status={tx.type} /></td>
                      <td className="p-4 text-right">
                        <span className={`amount font-bold ${CREDIT_TYPES.includes(tx.type) ? 'text-emerald-600' : 'text-red-500'}`}>
                          {CREDIT_TYPES.includes(tx.type) ? '+' : '−'}{fmt(tx.amount)}
                        </span>
                      </td>
                      <td className="p-4 text-center"><StatusBadge status={tx.status} /></td>
                      <td className="p-4 text-xs text-[var(--text-muted)]">{fmtDate(tx.createdAt)}</td>
                      <td className="p-4 text-center">
                        <button
                          className="btn-ghost p-1.5 text-xs flex items-center gap-1 mx-auto text-[var(--text-muted)]"
                          aria-label={`Dispute transaction #${tx.id}`}
                          onClick={() => toast.info(`Dispute filed for transaction #${tx.id}`)}>
                          <Flag className="w-3 h-3" aria-hidden="true" /> Dispute
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {filteredTxns.map((tx) => (
                <div key={tx.id} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      CREDIT_TYPES.includes(tx.type)
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                    }`} aria-hidden="true">
                      {CREDIT_TYPES.includes(tx.type)
                        ? <ArrowDownLeft className="w-4 h-4" />
                        : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">#{tx.id} • {tx.type}</div>
                      <div className="text-xs text-[var(--text-muted)]">{fmtDate(tx.createdAt)}</div>
                    </div>
                    <div className={`amount font-bold ${CREDIT_TYPES.includes(tx.type) ? 'text-emerald-600' : 'text-red-500'}`}>
                      {CREDIT_TYPES.includes(tx.type) ? '+' : '−'}{fmt(tx.amount)}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <StatusBadge status={tx.status} />
                    {tx.description && <span className="text-xs text-[var(--text-muted)] truncate">{tx.description}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-[var(--border)]" role="navigation" aria-label="Pagination">
                <button className="btn-secondary px-3 py-1.5 text-sm" disabled={page === 0}
                  aria-label="Previous page" onClick={() => setPage((p) => p - 1)}>← Prev</button>
                <span className="text-sm text-[var(--text-muted)]" aria-live="polite">Page {page + 1} / {totalPages}</span>
                <button className="btn-secondary px-3 py-1.5 text-sm" disabled={page >= totalPages - 1}
                  aria-label="Next page" onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
