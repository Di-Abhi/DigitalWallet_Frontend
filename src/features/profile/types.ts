export interface Profile {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
}

export interface KycData {
  status: string;
  docType?: string;
  docNumber?: string;
  submittedAt?: string;
  rejectionReason?: string;
}

export const DOC_OPTIONS = ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE']
  .map((d) => ({ value: d, label: d }));
