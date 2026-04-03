import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { FileText, CheckCircle, Clock, XCircle, Upload } from 'lucide-react';
import { userApi } from '../../core/api/userApi';
import { StatusBadge, LoadingPage } from '../../shared/components/UI';
import { toast } from '../../shared/components/Toast';
import { useAuth } from '../../store/AuthContext';
import { useNotifications } from '../../store/NotificationContext';
import { Button } from '../../shared/components/Button';
import { InputField, SelectField } from '../../shared/components/Input';

const DOC_TYPES = ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE'];
const DOC_OPTIONS = DOC_TYPES.map((d) => ({ value: d, label: d }));

interface Profile { name?: string; email?: string; phone?: string; status?: string; createdAt?: string; }
interface KycData  { status: string; docType?: string; docNumber?: string; submittedAt?: string; rejectionReason?: string; }

export default function ProfilePage() {
  const { user }              = useAuth();
  const { addNotification }   = useNotifications();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kyc, setKyc]         = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: '', phone: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [kycForm, setKycForm] = useState({ docType: 'AADHAAR', docNumber: '' });
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, kRes] = await Promise.allSettled([userApi.profile(), userApi.kycStatus()]);
        if (pRes.status === 'fulfilled') {
          setProfile(pRes.value.data.data);
          setForm({ name: pRes.value.data.data.name || '', phone: pRes.value.data.data.phone || '' });
        }
        if (kRes.status === 'fulfilled') setKyc(kRes.value.data.data);
      } catch { }
      finally { setLoading(false); }
    })();
  }, []);

  const saveProfile = async () => {
    setSaveLoading(true);
    try {
      const res = await userApi.updateProfile(form);
      setProfile(res.data.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaveLoading(false); }
  };

  const submitKyc = async () => {
    if (!kycForm.docNumber || !kycFile) return toast.error('Fill all KYC fields and upload document');
    setKycLoading(true);
    try {
      const fd = new FormData();
      fd.append('docFile', kycFile);
      fd.append('docType', kycForm.docType);
      fd.append('docNumber', kycForm.docNumber);
      const res = await userApi.kycSubmit(fd);
      setKyc(res.data.data);
      addNotification({ title: 'KYC Submitted', message: 'Your KYC documents are under review', type: 'info' });
      toast.success('KYC submitted for review!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'KYC submission failed');
    } finally { setKycLoading(false); }
  };

  if (loading) return <LoadingPage />;

  const kycStatusIcons: Record<string, React.ReactNode> = {
    APPROVED:      <CheckCircle className="w-5 h-5 text-emerald-500" />,
    PENDING:       <Clock       className="w-5 h-5 text-yellow-500" />,
    REJECTED:      <XCircle     className="w-5 h-5 text-red-500" />,
    NOT_SUBMITTED: <FileText    className="w-5 h-5 text-slate-400" />,
  };
  const kycStatus = kyc?.status || 'NOT_SUBMITTED';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Profile & KYC</h1>

      {/* ── Profile card ─────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
            {(profile?.name || user?.fullName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-lg">{profile?.name || user?.fullName}</div>
            <div className="text-sm text-[var(--text-muted)]">{profile?.email || user?.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={profile?.status || 'ACTIVE'} />
              <span className="badge-blue">{user?.role}</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="ml-auto" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <InputField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <InputField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Button loading={saveLoading} onClick={saveProfile}>Save Changes</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Email',        val: profile?.email },
              { label: 'Phone',        val: profile?.phone },
              { label: 'KYC Status',   val: <StatusBadge status={kycStatus} /> },
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

      {/* ── KYC card ─────────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          {kycStatusIcons[kycStatus] ?? kycStatusIcons.NOT_SUBMITTED}
          <div>
            <h2 className="font-bold">KYC Verification</h2>
            <p className="text-xs text-[var(--text-muted)]">Complete KYC to unlock all wallet features</p>
          </div>
        </div>

        {kyc && kycStatus !== 'NOT_SUBMITTED' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-5 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[var(--text-muted)]">Doc Type: </span><span className="font-semibold">{kyc.docType}</span></div>
            <div><span className="text-[var(--text-muted)]">Doc #: </span><span className="font-semibold">{kyc.docNumber}</span></div>
            <div><span className="text-[var(--text-muted)]">Status: </span><StatusBadge status={kyc.status} /></div>
            <div><span className="text-[var(--text-muted)]">Submitted: </span>
              <span className="font-semibold">{kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : '—'}</span>
            </div>
            {kyc.rejectionReason && <div className="col-span-2 text-red-500 text-xs">Reason: {kyc.rejectionReason}</div>}
          </div>
        )}

        {(kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED') && (
          <div className="space-y-4">
            <SelectField
              label="Document Type"
              value={kycForm.docType}
              options={DOC_OPTIONS}
              onChange={(e) => setKycForm({ ...kycForm, docType: e.target.value })}
            />
            <InputField
              label="Document Number"
              placeholder="Enter document number"
              value={kycForm.docNumber}
              onChange={(e) => setKycForm({ ...kycForm, docNumber: e.target.value })}
            />

            {/* File upload */}
            <div>
              <label className="label">Upload Document</label>
              <div
                className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-cyan-500 transition-colors"
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                aria-label="Upload KYC document"
              >
                {kycFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-500">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">{kycFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-muted)]">Click to upload or drag & drop</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">PDF, JPG, PNG (max 5MB)</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setKycFile(e.target.files?.[0] ?? null)} />
            </div>

            <Button fullWidth loading={kycLoading} onClick={submitKyc}>
              Submit KYC Documents
            </Button>
          </div>
        )}

        {kycStatus === 'PENDING' && (
          <div className="text-center py-4">
            <Clock className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
            <p className="font-semibold">Under Review</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Usually takes 24–48 hours</p>
          </div>
        )}

        {kycStatus === 'APPROVED' && (
          <div className="text-center py-4">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <p className="font-semibold text-emerald-600">KYC Verified</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">All features unlocked</p>
          </div>
        )}
      </div>
    </div>
  );
}
