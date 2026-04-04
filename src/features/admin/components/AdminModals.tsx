import { Modal } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import { TextareaField } from '../../../shared/components/Input';

// ─── Document Preview Modal ───────────────────────────────────────────────────
interface PreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export function DocPreviewModal({ url, onClose }: PreviewModalProps) {
  return (
    <Modal open={!!url} onClose={onClose} title="KYC Document" size="lg">
      <div className="w-full h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
        {url?.endsWith('.pdf')
          ? <iframe src={url} className="w-full h-full" title="KYC document PDF" />
          : <img src={url ?? ''} alt="KYC document" className="max-h-full object-contain" />}
      </div>
      <div className="flex gap-3 mt-4">
        <Button variant="secondary" fullWidth onClick={onClose}>Close</Button>
        <a href={url || ''} target="_blank" rel="noopener noreferrer"
          className="btn-primary flex-1 text-center flex items-center justify-center">
          Open Full
        </a>
      </div>
    </Modal>
  );
}

// ─── Reject KYC Modal ─────────────────────────────────────────────────────────
interface RejectModalProps {
  kycId:    number | null;
  reason:   string;
  onReason: (v: string) => void;
  onClose:  () => void;
  onSubmit: (kycId: number, reason: string) => void;
}

export function RejectKycModal({ kycId, reason, onReason, onClose, onSubmit }: RejectModalProps) {
  return (
    <Modal open={!!kycId} onClose={onClose} title="Reject KYC" size="sm">
      <div className="space-y-4">
        <TextareaField
          label="Rejection Reason"
          rows={3}
          placeholder="State the reason…"
          value={reason}
          onChange={(e) => onReason(e.target.value)}
          aria-required="true"
        />
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="danger" fullWidth disabled={!reason}
            onClick={() => kycId && onSubmit(kycId, reason)}>
            Reject KYC
          </Button>
        </div>
      </div>
    </Modal>
  );
}
