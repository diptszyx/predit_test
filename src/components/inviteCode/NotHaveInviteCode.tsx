import { User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { inviteCodeService } from '../../services/invite-code.service';
import useAuthStore from '../../store/auth.store';
import { checkIsAdmin } from '../../utils/isAdmin';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Props {
  onOpenWalletDialog: () => void;
}

const SOCIAL_LINKS = [
  {
    href: 'https://x.com/preditmarket',
    icon: '/Twitter-X.svg',
    label: 'X (Twitter)',
  },
  {
    href: 'https://discord.com/invite/pVkpN2Au6P',
    icon: '/discord-outline.svg',
    label: 'Discord',
  },
  {
    href: 'https://t.me/+7UaHn3GlQqxjYmRl',
    icon: '/telegram.svg',
    label: 'Telegram',
  },
];

export default function NotHaveInviteCode({ onOpenWalletDialog }: Props) {
  const user = useAuthStore((state) => state.user);
  const refetchUser = useAuthStore((state) => state.fetchCurrentUser);
  const isAdmin = checkIsAdmin(user)

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
      <div className="relative">
        <div className="absolute -inset-1 bg-white/5 rounded-2xl -z-1 blur-xs!" />
        <div className="bg-sidebar p-6 rounded-2xl w-full max-w-sm text-center space-y-4">
          {!user && (
            <>
              <h2 className="text-xl font-semibold">Welcome</h2>
              <p className="text-muted-foreground text-sm">
                Please sign in to continue.
              </p>
              <Button className="w-full" onClick={onOpenWalletDialog}>
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
              <p className="text-muted-foreground text-xs">
                If you don't have a code, request one on our social channels:
              </p>

              {/* Social Links */}
              <div className="flex items-center justify-center gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <ImageWithFallback
                      src={social.icon}
                      alt={social.label}
                      className="w-5 h-5"
                    />
                  </a>
                ))}
              </div>

              <Input
                variant="outline"
                className="border-"
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
    </div>
  );
}
