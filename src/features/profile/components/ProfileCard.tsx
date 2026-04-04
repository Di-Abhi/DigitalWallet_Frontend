import { StatusBadge } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import { InputField } from '../../../shared/components/Input';
import type { Profile } from '../types';

interface Props {
  profile:     Profile | null;
  userRole?:   string;
  userFullName?: string;
  userEmail?:  string;
  editing:     boolean;
  form:        { name: string; phone: string };
  saveLoading: boolean;
  onEdit:      () => void;
  onFormChange:(key: 'name' | 'phone', val: string) => void;
  onSave:      () => void;
}

export function ProfileCard({
  profile, userRole, userFullName, userEmail,
  editing, form, saveLoading, onEdit, onFormChange, onSave,
}: Props) {
  const displayName  = profile?.name || userFullName || 'U';
  const displayEmail = profile?.email || userEmail;
  const kycStatus    = profile?.status || 'ACTIVE';

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
          {displayName[0].toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg">{displayName}</div>
          <div className="text-sm text-[var(--text-muted)]">{displayEmail}</div>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={kycStatus} />
            {userRole && <span className="badge-blue">{userRole}</span>}
          </div>
        </div>
        <Button variant="secondary" size="sm" className="ml-auto" onClick={onEdit}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {/* Body */}
      {editing ? (
        <div className="space-y-4">
          <InputField label="Full Name" value={form.name} onChange={(e) => onFormChange('name', e.target.value)} />
          <InputField label="Phone"     value={form.phone} onChange={(e) => onFormChange('phone', e.target.value)} />
          <Button loading={saveLoading} onClick={onSave}>Save Changes</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Email',        val: profile?.email },
            { label: 'Phone',        val: profile?.phone },
            { label: 'KYC Status',   val: <StatusBadge status={profile?.status || 'ACTIVE'} /> },
            { label: 'Member Since', val: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : '—' },
          ].map(({ label, val }) => (
            <div key={label}>
              <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">{label}</div>
              <div className="font-semibold text-sm">{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
