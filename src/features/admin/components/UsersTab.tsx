import { ChangeEvent, useMemo } from 'react';
import { Users } from 'lucide-react';
import { StatusBadge, LoadingPage, EmptyState } from '../../../shared/components/UI';
import { Button, Pagination } from '../../../shared/components/Button';
import { SearchInput, SelectField } from '../../../shared/components/Input';
import { ROLE_OPTIONS, type AdminUser } from '../types';

interface Props {
  users:        AdminUser[];
  loading:      boolean;
  page:         number;
  totalPages:   number;
  search:       string;
  onSearch:     (v: string) => void;
  onPageChange: (p: number) => void;
  onBlock:      (id: number, isBlocked: boolean) => void;
  onRoleChange: (id: number, role: string) => void;
}

export function UsersTab({ users, loading, page, totalPages, search, onSearch, onPageChange, onBlock, onRoleChange }: Props) {
  const countLabel = useMemo(() =>
    search ? `${users.length} result(s) for "${search}"` : `${users.length} users`,
    [users.length, search]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <SearchInput
          containerClassName="flex-1"
          placeholder="Search name, email, phone…"
          aria-label="Search users"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{countLabel}</span>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingPage /> : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm" role="grid" aria-label="Users list">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    {['User', 'Role', 'KYC', 'Status', 'Actions'].map((h) => (
                      <th key={h} scope="col" className={`p-4 ${['KYC','Status','Actions'].includes(h) ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white font-bold text-xs flex items-center justify-center" aria-hidden="true">
                            {(u.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{u.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <SelectField
                          options={ROLE_OPTIONS}
                          value={u.role || 'USER'}
                          aria-label={`Role for ${u.name}`}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => onRoleChange(u.id, e.target.value)}
                          className="py-1 text-xs w-28"
                        />
                      </td>
                      <td className="p-4 text-center"><StatusBadge status={u.kycStatus || 'NOT_SUBMITTED'} /></td>
                      <td className="p-4 text-center"><StatusBadge status={u.status || 'ACTIVE'} /></td>
                      <td className="p-4 text-center">
                        <Button
                          variant={u.status === 'BLOCKED' ? 'secondary' : 'danger'}
                          size="xs"
                          aria-label={`${u.status === 'BLOCKED' ? 'Unblock' : 'Block'} ${u.name}`}
                          onClick={() => onBlock(u.id, u.status === 'BLOCKED')}
                        >
                          {u.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {users.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white font-bold flex items-center justify-center" aria-hidden="true">
                      {(u.name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <StatusBadge status={u.status || 'ACTIVE'} />
                    <StatusBadge status={u.kycStatus || 'NOT_SUBMITTED'} />
                    <Button
                      variant={u.status === 'BLOCKED' ? 'secondary' : 'danger'}
                      size="xs"
                      onClick={() => onBlock(u.id, u.status === 'BLOCKED')}
                    >
                      {u.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} className="p-4 border-t border-[var(--border)]" />
          </>
        )}
      </div>
    </div>
  );
}
