import { useState, useEffect, useCallback } from 'react';
import { Receipt, Filter, Download, Search, ArrowUpRight, ArrowDownLeft, Flag } from 'lucide-react';
import { walletApi } from '../../core/api/services';
import { StatusBadge, LoadingPage, EmptyState } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';

function fmt(a) { return `₹${Number(a || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`; }
function fmtDate(d) { return d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }

const CREDIT_TYPES = ['TOPUP', 'CASHBACK'];
const TX_TYPES = ['TOPUP', 'TRANSFER', 'WITHDRAW', 'CASHBACK', 'REDEEM'];
const TX_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'];

export default function TransactionsPage() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await walletApi.transactions(page, 10);
      let data = res.data.content || [];
      if (typeFilter) data = data.filter((t) => t.type === typeFilter);
      if (statusFilter) data = data.filter((t) => t.status === statusFilter);
      if (search) data = data.filter((t) =>
        t.referenceId?.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      );
      setTxns(data);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  }, [page, typeFilter, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const downloadCsv = () => {
    const headers = ['ID', 'Type', 'Amount', 'Status', 'Description', 'Date'];
    const rows = txns.map((t) => [t.id, t.type, t.amount, t.status, t.description || '', t.createdAt || '']);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{totalElements} total records</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm" onClick={downloadCsv}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input className="input-field pl-9" placeholder="Search by ref ID or description…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <select className="input-field w-auto" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}>
          <option value="">All Types</option>
          {TX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">All Statuses</option>
          {TX_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(typeFilter || statusFilter || search) && (
          <button className="btn-ghost text-sm" onClick={() => { setTypeFilter(''); setStatusFilter(''); setSearch(''); setPage(0); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingPage />
        ) : txns.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions found" desc="Try adjusting your filters" />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="text-left p-4">Transaction</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-right p-4">Amount</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-center p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((tx) => (
                    <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            CREDIT_TYPES.includes(tx.type) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                          }`}>
                            {CREDIT_TYPES.includes(tx.type) ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-semibold">#{tx.id}</div>
                            <div className="text-xs text-[var(--text-muted)] truncate max-w-32">{tx.description || tx.referenceId || '—'}</div>
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
                        <button className="btn-ghost p-1.5 text-xs flex items-center gap-1 mx-auto text-[var(--text-muted)]"
                          onClick={() => toast.info(`Dispute filed for transaction #${tx.id}`)}>
                          <Flag className="w-3 h-3" /> Dispute
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {txns.map((tx) => (
                <div key={tx.id} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      CREDIT_TYPES.includes(tx.type) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                    }`}>
                      {CREDIT_TYPES.includes(tx.type) ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
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
              <div className="flex items-center justify-center gap-2 p-4 border-t border-[var(--border)]">
                <button className="btn-secondary px-3 py-1.5 text-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                <span className="text-sm text-[var(--text-muted)]">Page {page + 1} / {totalPages}</span>
                <button className="btn-secondary px-3 py-1.5 text-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
