import { useCallback, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { User as UserIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  UserProfileForm,
  type UserProfileForm as UserProfileFormData,
} from './UserProfileForm';
import apiClient from '../lib/axios';
import type { User } from '../lib/types';

const buildFormData = (user: User | null): UserProfileFormData => ({
  avatar: user?.avatar ?? '',
  email: user?.email ?? '',
  phoneNumber: user?.phoneNumber ?? '',
});

const resolveProvider = (user: User | null): string | null => {
  if (!user) return null;
  const rawProvider =
    (user?.socialProvider as string | undefined) ??
    (user as unknown as { provider?: string | null | undefined })?.provider ??
    null;
  return rawProvider ? rawProvider.toLowerCase() : null;
};

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onProfileUpdated?: (updates?: Partial<User>) => void;
}

export function UserProfileDialog({
  open,
  onOpenChange,
  user,
  onProfileUpdated,
}: UserProfileDialogProps) {
  const [formData, setFormData] = useState<UserProfileFormData>(
    buildFormData(null)
  );
  const [initialFormData, setInitialFormData] = useState<UserProfileFormData>(
    buildFormData(null)
  );
  const [emailLocked, setEmailLocked] = useState(false);
  const [emailProvider, setEmailProvider] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const nextData = buildFormData(user);
    setFormData(nextData);
    setInitialFormData(nextData);

    const provider = resolveProvider(user);
    setEmailLocked(provider === 'google' || provider === 'email');
    setEmailProvider(provider);
  }, [open, user]);

  const emailProviderLabel = useMemo(() => {
    if (!emailProvider) return 'your login provider';
    if (emailProvider === 'google') return 'Google';
    if (emailProvider === 'email') return 'your email login';
    return emailProvider;
  }, [emailProvider]);

  const handleChange = useCallback((updates: Partial<UserProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSkip = () => {
    onOpenChange(false);
  };

  const handleComplete = useCallback(async () => {
    if (submitting) return;

    const { email, phoneNumber, avatar } = formData;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (phoneNumber && !/^\+?[\d\s-()]+$/.test(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const updates: Partial<User> = {};

    if (avatar && avatar !== initialFormData.avatar) {
      updates.avatar = avatar;
    }

    if (!emailLocked && email !== initialFormData.email) {
      updates.email = email;
    }

    if (phoneNumber !== initialFormData.phoneNumber) {
      updates.phoneNumber = phoneNumber;
    }

    setSubmitting(true);
    try {
      if (Object.keys(updates).length > 0) {
        await apiClient.patch('/auth/me', updates);
        toast.success('Profile updated successfully.');
        onProfileUpdated?.(updates);
      } else {
        toast.success('Profile saved.');
        onProfileUpdated?.({});
      }

      onOpenChange(false);
    } catch (error: unknown) {
      let message = 'Unable to update your profile. Please try again.';
      if (error instanceof AxiosError) {
        const apiMessage = (
          error.response?.data as { message?: string } | undefined
        )?.message;
        if (apiMessage) {
          message = apiMessage;
        } else if (error.message) {
          message = error.message;
        }
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    emailLocked,
    formData,
    initialFormData,
    onOpenChange,
    onProfileUpdated,
    submitting,
  ]);

  const title = 'Complete Your Profile';
  const description = 'Add your profile details (optional)';

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: any) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <UserProfileForm
          data={formData}
          onChange={handleChange}
          onSkip={handleSkip}
          onComplete={handleComplete}
          emailLocked={emailLocked}
          emailProvider={emailProviderLabel}
          isSubmitting={submitting}
          completeLabel={'Complete Setup'}
          skipLabel="Skip for Now"
        />
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileDialog;
