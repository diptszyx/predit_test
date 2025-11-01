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
import { User as UserIcon } from 'lucide-react';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: UserProfileFormData;
  onChange: (updates: Partial<UserProfileFormData>) => void;
  onSkip?: () => void;
  onComplete: () => void;
  isNewUser?: boolean;
  emailLocked?: boolean;
  emailProvider?: string | null;
}

export function UserProfileDialog({
  open,
  onOpenChange,
  data,
  onChange,
  onSkip,
  onComplete,
  isNewUser = false,
  emailLocked = false,
  emailProvider = null,
}: UserProfileDialogProps) {
  const title = isNewUser ? 'Complete Your Profile' : 'Update Profile';
  const description = isNewUser
    ? 'Welcome aboard! Add a few details so we can personalize your experience.'
    : 'Keep your contact details up to date for account recovery and notifications.';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
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
          data={data}
          onChange={onChange}
          onSkip={isNewUser ? undefined : onSkip}
          onComplete={onComplete}
          emailLocked={emailLocked}
          emailProvider={emailProvider ?? undefined}
          completeLabel={isNewUser ? 'Save & Continue' : 'Save Changes'}
          skipLabel="I'll do this later"
        />
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileDialog;
