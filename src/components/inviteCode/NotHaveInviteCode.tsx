import React, { useState } from 'react';
import useAuthStore from '../../store/auth.store';
import { Button } from '../ui/button';
import { User } from 'lucide-react';
import { Input } from '../ui/input';
import { inviteCodeService } from '../../services/invite-code.service';
import { toast } from 'sonner';
import { ADMIN_EMAILS } from '../../constants/admin';

interface Props {
  onOpenWalletDialog: () => void;
}

export default function NotHaveInviteCode({ onOpenWalletDialog }: Props) {
  const user = useAuthStore((state) => state.user);
  const refetchUser = useAuthStore((state) => state.fetchCurrentUser);
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyCode = async (code: string) => {
    try {
      await inviteCodeService.applyCode(code);
      await refetchUser();

      toast.success('🎉 Bonus applied! +300 XP', {
        description: 'Welcome to Predict Market of Predictions!',
      });
    } catch (err) {
      console.error(err);
      toast.error('Invalid or expired invite code.');
    }
  };

  const handleSubmit = async () => {
    if (!inviteCode.trim()) return;

    setLoading(true);
    const code = inviteCode.trim();

    try {
      await handleApplyCode(code);
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply invite code.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.appliedInviteCode || isAdmin) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/10 backdrop-blur-xs! flex items-center justify-center p-6">
      <div className="bg-secondary shadow-2xl! p-6 rounded-2xl w-full max-w-sm text-center space-y-4">
        {!user && (
          <>
            <h2 className="text-xl font-semibold">Welcome</h2>
            <p className="text-muted-foreground text-sm">
              Please sign in to continue.
            </p>
            <Button
              className="w-full"
              onClick={onOpenWalletDialog}
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </>
        )}

        {user && !user.appliedInviteCode && (
          <>
            <h2 className="text-xl font-semibold">Enter Invite Code</h2>
            <p className="text-muted-foreground text-sm">
              You need an invite code to access this app.
            </p>

            <Input
              variant="outline"
              placeholder="Invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />

            <Button
              className="w-full"
              disabled={!inviteCode.trim() || loading}
              onClick={handleSubmit}
            >
              {loading ? 'Checking…' : 'Confirm'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
