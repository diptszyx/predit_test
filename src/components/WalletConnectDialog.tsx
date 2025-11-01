import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Loader2, Wallet, CheckCircle2 } from 'lucide-react';

export type WalletType = 'metamask' | 'phantom' | 'backpack';
export type SocialProvider = 'google' | 'apple';

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (wallet: WalletType) => void;
  onSocialConnect: (provider: SocialProvider) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  icon: string;
  color: string;
  supported: boolean;
}

interface SocialOption {
  id: SocialProvider;
  name: string;
  icon: string;
  color: string;
}

const wallets: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect with MetaMask wallet',
    icon: '🦊',
    color: 'from-orange-600 to-yellow-600',
    supported: true,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Connect with Phantom wallet',
    icon: '👻',
    color: 'from-blue-600 to-cyan-600',
    supported: true,
  },
  {
    id: 'backpack',
    name: 'Backpack',
    description: 'Connect with Backpack wallet',
    icon: '🎒',
    color: 'from-blue-600 to-cyan-600',
    supported: true,
  },
];

const socialOptions: SocialOption[] = [
  {
    id: 'google',
    name: 'Continue with Google',
    icon: '🔍',
    color: 'hover:bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'apple',
    name: 'Continue with Apple',
    icon: '🍎',
    color: 'hover:bg-gray-500/10 border-gray-500/30',
  },
];

export function WalletConnectDialog({
  open,
  onOpenChange,
  onConnect,
  onSocialConnect,
  onOpenPrivacy,
  onOpenTerms,
}: WalletConnectDialogProps) {
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(
    null
  );
  const [connectingSocial, setConnectingSocial] =
    useState<SocialProvider | null>(null);

  const resetState = () => {
    setConnectingWallet(null);
    setConnectingSocial(null);
  };

  const handleConnect = async (walletType: WalletType) => {
    setConnectingWallet(walletType);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setConnectingWallet(null);
    onConnect(walletType);
  };

  const handleSocialConnect = async (provider: SocialProvider) => {
    setConnectingSocial(provider);

    switch (provider) {
      case 'google':
        const signInLink = `${
          import.meta.env.VITE_API_BASE_URL
        }/auth/${provider}/authorize?redirectUri=${
          import.meta.env.VITE_API_BASE_URL
        }/auth/google/callback`;
        window.location.href = signInLink;
        break;
      case 'apple':
        break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setConnectingSocial(null);
    onSocialConnect(provider);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: any) => {
        if (!isOpen) {
          resetState();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect to Dehouse of Predictions
          </DialogTitle>
          <DialogDescription>
            Sign in with your wallet or social account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {socialOptions.map((social) => {
              const isConnecting = connectingSocial === social.id;

              return (
                <button
                  key={social.id}
                  onClick={() => handleSocialConnect(social.id)}
                  disabled={isConnecting}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    social.color
                  } ${
                    isConnecting ? 'border-blue-500 bg-accent' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">{social.icon}</span>
                    <span className="text-sm flex-1">{social.name}</span>
                    {isConnecting && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              Or connect with wallet
            </span>
          </div>

          <div className="space-y-3">
            {wallets.map((wallet) => {
              const isConnecting = connectingWallet === wallet.id;

              return (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={!wallet.supported || isConnecting}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    wallet.supported
                      ? 'border-border hover:border-blue-500 hover:bg-accent cursor-pointer'
                      : 'border-border opacity-50 cursor-not-allowed'
                  } ${isConnecting ? 'border-blue-500 bg-accent' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl flex-shrink-0`}
                    >
                      {wallet.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm">{wallet.name}</h3>
                        {wallet.supported ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-500/10 border-green-500/30 text-green-500"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {wallet.description}
                      </p>
                    </div>

                    {isConnecting && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400">
              🔒 <strong>Secure Connection:</strong> We never store your private
              keys. Your wallet stays in your control.
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <button
                onClick={onOpenPrivacy}
                className="text-blue-500 hover:underline"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                onClick={onOpenTerms}
                className="text-blue-500 hover:underline"
              >
                Terms of Use
              </button>
              .
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              New to crypto wallets?{' '}
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Learn how to get started
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WalletConnectDialog;
