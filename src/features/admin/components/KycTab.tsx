import { Check, X } from 'lucide-react';
import { Shield } from 'lucide-react';
import { LoadingPage, EmptyState } from '../../../shared/components/UI';
import { Button } from '../../../shared/components/Button';
import type { KycItem } from '../types';

interface Props {
  queue:      KycItem[];
  loading:    boolean;
  onApprove:  (kycId: number) => void;
  onReject:   (kycId: number) => void;
  onPreview:  (url: string) => void;
}

export function KycTab({ queue, loading, onApprove, onReject, onPreview }: Props) {
  if (loading) return <LoadingPage />;
  if (queue.length === 0) return <EmptyState icon={Shield} title="No pending KYC submissions" desc="All caught up!" />;

  return (
    <div className="space-y-3" role="list" aria-label="KYC queue">
      {queue.map((k) => {
        const kycId = k.kycId ?? k.id ?? 0;
        return (
          <div key={kycId} role="listitem" className="card p-5 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-48">
              <div className="font-bold">{k.userName || `User #${k.userId}`}</div>
              <div className="text-sm text-[var(--text-muted)]">{k.userEmail}</div>
              <div className="mt-2 flex gap-3 text-xs text-[var(--text-muted)]">
                <span>Doc: <span className="font-semibold text-[var(--text)]">{k.docType}</span></span>
                <span>#{k.docNumber}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {k.docFilePath && (
                <Button variant="secondary" size="sm" onClick={() => onPreview(k.docFilePath!)}
                  aria-label={`View document for ${k.userName}`}>
                  View
                </Button>
              )}
              <Button size="sm" icon={<Check className="w-4 h-4" />}
                onClick={() => onApprove(kycId)} aria-label={`Approve KYC for ${k.userName}`}
                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 hover:bg-emerald-200 border-0">
                Approve
              </Button>
              <Button variant="danger" size="sm" icon={<X className="w-4 h-4" />}
                onClick={() => onReject(kycId)} aria-label={`Reject KYC for ${k.userName}`}>
                Reject
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
