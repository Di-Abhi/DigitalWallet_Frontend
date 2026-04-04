import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import { walletApi } from '../../core/api/walletApi';
import { LoadingPage } from '../../shared/components/UI';
import { Button } from '../../shared/components/Button';
import { toast } from '../../shared/components/Toast';
import { useDebounce } from '../../store/hooks';
import { getApiErrorMessage } from '../../core/api/types';
import { downloadCsv } from '../../shared/utils';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionList }    from './components/TransactionList';

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
    if (typeFilter)       data = data.filter((t) => t.type === typeFilter);
    if (statusFilter)     data = data.filter((t) => t.status === statusFilter);
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
        <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      <TransactionFilters
        search={search} typeFilter={typeFilter} statusFilter={statusFilter}
        onSearch={(v) => { setSearch(v); setPage(0); }}
        onType={(v) => { setTypeFilter(v); setPage(0); }}
        onStatus={(v) => { setStatusFilter(v); setPage(0); }}
        onClear={clearFilters}
      />

      <div className="card overflow-hidden">
        {loading
          ? <LoadingPage />
          : <TransactionList
              transactions={filteredTxns}
              page={page} totalPages={totalPages} onPageChange={setPage}
            />
        }
      </div>
    </div>
  );
}
