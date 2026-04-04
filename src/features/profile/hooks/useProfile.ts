import { useState, useEffect } from 'react';
import { userApi } from '../../../core/api/userApi';
import { toast } from '../../../shared/components/Toast';
import { useNotifications } from '../../../store/NotificationContext';
import type { Profile, KycData } from '../types';

export function useProfile() {
  const { addNotification } = useNotifications();
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [kyc, setKyc]             = useState<KycData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [kycLoading, setKycLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, kRes] = await Promise.allSettled([userApi.profile(), userApi.kycStatus()]);
        if (pRes.status === 'fulfilled') setProfile(pRes.value.data.data);
        if (kRes.status === 'fulfilled') setKyc(kRes.value.data.data);
      } catch { }
      finally { setLoading(false); }
    })();
  }, []);

  const saveProfile = async (form: { name: string; phone: string }) => {
    setSaveLoading(true);
    try {
      const res = await userApi.updateProfile(form);
      setProfile(res.data.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
      return false;
    } finally { setSaveLoading(false); }
  };

  const submitKyc = async (form: { docType: string; docNumber: string }, file: File) => {
    setKycLoading(true);
    try {
      const fd = new FormData();
      fd.append('docFile', file);
      fd.append('docType', form.docType);
      fd.append('docNumber', form.docNumber);
      const res = await userApi.kycSubmit(fd);
      setKyc(res.data.data);
      addNotification({ title: 'KYC Submitted', message: 'Your KYC documents are under review', type: 'info' });
      toast.success('KYC submitted for review!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'KYC submission failed');
      return false;
    } finally { setKycLoading(false); }
  };

  return { profile, kyc, loading, saveLoading, kycLoading, saveProfile, submitKyc };
}
