import { Download } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { InputField } from '../../../shared/components/Input';

interface Props {
  from:     string;
  to:       string;
  onFrom:   (v: string) => void;
  onTo:     (v: string) => void;
  onDownload: () => void;
}

export function StatementDownload({ from, to, onFrom, onTo, onDownload }: Props) {
  return (
    <div className="card p-5">
      <h2 className="font-bold mb-4 text-sm">Download Statement</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <InputField label="From" type="date" value={from} onChange={(e) => onFrom(e.target.value)} className="w-auto" />
        <InputField label="To"   type="date" value={to}   onChange={(e) => onTo(e.target.value)}   className="w-auto" />
        <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={onDownload}>
          Download CSV
        </Button>
      </div>
    </div>
  );
}
