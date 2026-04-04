import { useRef, ChangeEvent } from 'react';
import { FileText, CheckCircle, Clock, XCircle, Upload } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField } from '../../../shared/components/Input';
import { DOC_OPTIONS, type KycData } from '../types';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  APPROVED:      <CheckCircle className="w-5 h-5 text-emerald-500" />,
  PENDING:       <Clock       className="w-5 h-5 text-yellow-500" />,
  REJECTED:      <XCircle     className="w-5 h-5 text-red-500" />,
  NOT_SUBMITTED: <FileText    className="w-5 h-5 text-slate-400" />,
};

interface Props {
  kyc:        KycData | null;
  kycForm:    { docType: string; docNumber: string };
  kycFile:    File | null;
  kycLoading: boolean;
  onFormChange:(key: 'docType' | 'docNumber', val: string) => void;
  onFile:     (file: File | null) => void;
  onSubmit:   () => void;
}

export function KycCard({ kyc, kycForm, kycFile, kycLoading, onFormChange, onFile, onSubmit }: Props) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const status   = kyc?.status || 'NOT_SUBMITTED';
  const icon     = STATUS_ICONS[status] ?? STATUS_ICONS.NOT_SUBMITTED;
  const canSubmit = status === 'NOT_SUBMITTED' || status === 'REJECTED';

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {icon}
        <div>
          <h2 className="font-bold">KYC Verification</h2>
          <p className="text-xs text-[var(--text-muted)]">Complete KYC to unlock all wallet features</p>
        </div>
      </div>

      {/* Existing KYC summary */}
      {kyc && status !== 'NOT_SUBMITTED' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-5 grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-[var(--text-muted)]">Doc Type: </span><span className="font-semibold">{kyc.docType}</span></div>
          <div><span className="text-[var(--text-muted)]">Doc #: </span><span className="font-semibold">{kyc.docNumber}</span></div>
          <div><span className="text-[var(--text-muted)]">Status: </span><StatusBadge status={kyc.status} /></div>
          <div>
            <span className="text-[var(--text-muted)]">Submitted: </span>
            <span className="font-semibold">{kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : '—'}</span>
          </div>
          {kyc.rejectionReason && (
            <div className="col-span-2 text-red-500 text-xs">Reason: {kyc.rejectionReason}</div>
          )}
        </div>
      )}

      {/* Submission form */}
      {canSubmit && (
        <div className="space-y-4">
          <SelectField
            label="Document Type"
            value={kycForm.docType}
            options={DOC_OPTIONS}
            onChange={(e) => onFormChange('docType', e.target.value)}
          />
          <InputField
            label="Document Number"
            placeholder="Enter document number"
            value={kycForm.docNumber}
            onChange={(e) => onFormChange('docNumber', e.target.value)}
          />

          {/* Drop zone */}
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
            <input
              ref={fileRef} type="file" className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e: ChangeEvent<HTMLInputElement>) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button fullWidth loading={kycLoading} onClick={onSubmit}>
            Submit KYC Documents
          </Button>
        </div>
      )}

      {/* Status displays */}
      {status === 'PENDING' && (
        <div className="text-center py-4">
          <Clock className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
          <p className="font-semibold">Under Review</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Usually takes 24–48 hours</p>
        </div>
      )}
      {status === 'APPROVED' && (
        <div className="text-center py-4">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
          <p className="font-semibold text-emerald-600">KYC Verified</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">All features unlocked</p>
        </div>
      )}
    </div>
  );
}
