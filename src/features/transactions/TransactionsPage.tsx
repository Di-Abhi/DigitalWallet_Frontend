import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import { walletApi } from '../../core/api/walletApi';
import { LoadingPage } from '../../shared/components/UI';
import { Button } from '../../shared/components/Button';
import { toast } from '../../shared/components/Toast';
import { useAuth } from '../../store/AuthContext';
import { useDebounce } from '../../store/hooks';
import { getApiErrorMessage } from '../../core/api/types';
import { downloadCsv } from '../../shared/utils';
import { TransactionSummary } from './components/TransactionSummary';
import { TransactionFilters }  from './components/TransactionFilters';
import { TransactionList }     from './components/TransactionList';
import { getDirection, type Transaction, type DirectionTab } from './types';

export default function TransactionsPage() {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  const [txns, setTxns]             = useState<Transaction[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [directionTab, setDirectionTab] = useState<DirectionTab>('all');
  const [typeFilter, setTypeFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');
  const debouncedSearch                 = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await walletApi.transactions(page, 10);
      setTxns(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load transactions'));
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Switching direction tab resets any type filter (they'd conflict)
  const handleDirectionChange = (tab: DirectionTab) => {
    setDirectionTab(tab);
    setTypeFilter('');
    setPage(0);
  };

  const filteredTxns = useMemo(() => {
    let data = [...txns];

    // 1. Direction filter — uses current user ID to resolve TRANSFER direction
    if (directionTab !== 'all') {
      data = data.filter(
        (t) => getDirection(t.type, currentUserId, t.senderId) === directionTab,
      );
    }

    // 2. Type filter
    if (typeFilter)    data = data.filter((t) => t.type === typeFilter);

    // 3. Status filter
    if (statusFilter)  data = data.filter((t) => t.status === statusFilter);

    // 4. Full-text search on description / referenceId
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(
        (t) => t.referenceId?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
      );
    }

    return data;
  }, [txns, directionTab, typeFilter, statusFilter, debouncedSearch, currentUserId]);

  const clearFilters = () => {
    setDirectionTab('all');
    setTypeFilter('');
    setStatusFilter('');
    setSearch('');
    setPage(0);
  };

  const hasFilters = !!(typeFilter || statusFilter || search || directionTab !== 'all');

  const handleExport = () => {
    downloadCsv(
      ['ID', 'Direction', 'Type', 'Amount', 'Status', 'Description', 'Date'],
      filteredTxns.map((t) => [
        t.id,
        getDirection(t.type, currentUserId, t.senderId).toUpperCase(),
        t.type,
        t.amount,
        t.status,
        t.description || '',
        t.createdAt   || '',
      ]),
      `transactions_${directionTab}.csv`,
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5" aria-live="polite">
            {hasFilters
              ? `${filteredTxns.length} of ${totalElements} records`
              : `${totalElements} total records`}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      {/* All / Received / Sent summary tabs */}
      <TransactionSummary
        transactions={txns}
        currentUserId={currentUserId}
        activeTab={directionTab}
        onTabChange={handleDirectionChange}
      />

      {/* Search + type/status filters */}
      <TransactionFilters
        search={search}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onSearch={(v) => { setSearch(v); setPage(0); }}
        onType={(v)   => { setTypeFilter(v); setPage(0); }}
        onStatus={(v) => { setStatusFilter(v); setPage(0); }}
        onClear={clearFilters}
      />

      {/* List */}
      <div className="card overflow-hidden">
        {loading
          ? <LoadingPage />
          : <TransactionList
              transactions={filteredTxns}
              currentUserId={currentUserId}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
        }
      </div>
    </div>
  );
}