import { useState, useEffect } from 'react';
import { LoadingPage } from '../../shared/components/UI';
import { useAuth } from '../../store/AuthContext';
import { useProfile } from './hooks/useProfile';
import { ProfileCard } from './components/ProfileCard';
import { KycCard }     from './components/KycCard';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, kyc, loading, saveLoading, kycLoading, saveProfile, submitKyc } = useProfile();

  const [editing, setEditing] = useState(false);
  // Initialize form empty; sync from profile once it loads via useEffect
  const [form, setForm]       = useState({ name: '', phone: '' });
  const [kycForm, setKycForm] = useState({ docType: 'AADHAAR', docNumber: '' });
  const [kycFile, setKycFile] = useState<File | null>(null);

  // Sync form state when profile data arrives — safe inside useEffect, not during render
  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  if (loading) return <LoadingPage />;

  const handleSave = async () => {
    const ok = await saveProfile(form);
    if (ok) setEditing(false);
  };

  const handleKycSubmit = async () => {
    if (!kycFile) return;
    const ok = await submitKyc(kycForm, kycFile);
    if (ok) setKycFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Profile & KYC</h1>

      <ProfileCard
        profile={profile}
        userRole={user?.role}
        userFullName={user?.fullName}
        userEmail={user?.email}
        editing={editing}
        form={form}
        saveLoading={saveLoading}
        onEdit={() => setEditing((v) => !v)}
        onFormChange={(key, val) => setForm((f) => ({ ...f, [key]: val }))}
        onSave={handleSave}
      />

      <KycCard
        kyc={kyc}
        kycForm={kycForm}
        kycFile={kycFile}
        kycLoading={kycLoading}
        onFormChange={(key, val) => setKycForm((f) => ({ ...f, [key]: val }))}
        onFile={setKycFile}
        onSubmit={handleKycSubmit}
      />
    </div>
  );
}