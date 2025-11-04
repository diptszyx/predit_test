import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Loader2, Wallet, CheckCircle2 } from 'lucide-react';
import apiClient from '../lib/axios';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import useAuthStore from '../store/auth.store';
import { User } from '../lib/types';
import { toast } from 'sonner';
import clsx from 'clsx';
import { ethers } from 'ethers';

export type WalletType = 'metamask' | 'phantom' | 'backpack';
export type SocialProvider = 'google' | 'x';

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

const hasMeta = typeof window !== 'undefined' && (window as any).ethereum;
const hasPhantom =
  typeof window !== 'undefined' && (window as any).phantom?.solana;

const wallets: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect with MetaMask wallet',
    icon: 'https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg',
    color: 'from-orange-600 to-yellow-600',
    supported: hasMeta,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Connect with Phantom wallet',
    icon: 'https://mintcdn.com/phantom-e50e2e68/fkWrmnMWhjoXSGZ9/resources/images/Phantom_SVG_Icon.svg?w=840&fit=max&auto=format&n=fkWrmnMWhjoXSGZ9&q=85&s=7311f84864aeebc085a674acff85ff99',
    color: 'from-blue-600 to-cyan-600',
    supported: hasPhantom,
  },
  {
    id: 'backpack',
    name: 'Backpack',
    description: 'Connect with Backpack wallet',
    icon: '/backpack.png',
    color: 'from-green-600 to-red-600',
    supported: false,
  },
];

const socialOptions: SocialOption[] = [
  {
    id: 'google',
    name: 'Continue with Google',
    icon: '/google.png',
    color: 'hover:bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'x',
    name: 'Continue with X',
    icon: '/X.png',
    color: 'hover:bg-gray-500/10 border-gray-500/30',
  },
];

const getMetaMaskProvider = (): any => {
  const eth = window.ethereum as any;

  if (eth?.providers?.length) {
    return eth.providers.find((p: any) => p.isMetaMask);
  }

  if (eth?.isMetaMask) {
    return eth;
  }

  return null;
};

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

  const handleSocialConnect = async (provider: SocialProvider) => {
    setConnectingSocial(provider);

    switch (provider) {
      case 'google':
        const signInGoogleLink = `${
          import.meta.env.VITE_API_BASE_URL
        }/auth/${provider}/authorize?redirectUri=${
          import.meta.env.VITE_API_BASE_URL
        }/auth/google/callback`;
        window.location.href = signInGoogleLink;
        break;
      case 'x':
        const signInXLink = `${
          import.meta.env.VITE_API_BASE_URL
        }/auth/${provider}/authorize`;
        window.location.href = signInXLink;
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
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        style={{ zIndex: '99999' }}
      >
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
                    <img
                      className="w-5 h-5"
                      src={social.icon}
                    />
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
                <WalletConnectButton
                  key={wallet.id}
                  loading={isConnecting}
                  wallet={wallet}
                  setConnectingWallet={setConnectingWallet}
                  onConnect={onConnect}
                />
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

const WalletConnectButton = ({
  loading,
  wallet,
  setConnectingWallet,
  onConnect,
}: {
  wallet: WalletOption;
  loading: boolean;
  onConnect: (wallet: WalletType, user: User) => void;
  setConnectingWallet: (walletType: WalletType | null) => void;
}) => {
  const {
    select,
    connect,
    wallets,
    wallet: currentWallet,
    publicKey,
    signMessage,
    disconnect,
  } = useWallet();

  const [pendingWalletType, setPendingWalletType] = useState<WalletType | null>(
    null
  );

  const authenticateWithToken = useAuthStore(
    (state) => state.authenticateWithToken
  );

  useEffect(() => {
    const connectAndSign = async () => {
      if (!pendingWalletType || !currentWallet?.adapter?.name) return;

      const expectedAdapter =
        pendingWalletType === 'phantom'
          ? 'Phantom'
          : pendingWalletType === 'backpack'
          ? 'Backpack'
          : null;

      if (currentWallet.adapter.name !== expectedAdapter) return;

      try {
        await connect();

        const pubkey = currentWallet?.adapter?.publicKey?.toBase58();
        if (!pubkey) throw new Error('Public key not available after connect');

        const { data: nonceResp } = await apiClient.post('/auth/nonce', {
          publicKey: pubkey,
          walletType: pendingWalletType,
        });

        const nonce = nonceResp.nonce;
        const message = `Login to Deor\nNonce=${nonce}`;
        let retries = 0;
        while (!signMessage && retries < 10) {
          await new Promise((r) => setTimeout(r, 200));
          retries++;
        }

        if (!signMessage) throw new Error('signMessage not available');

        const signatureBytes = await signMessage(
          new TextEncoder().encode(message)
        );

        const signature = bs58.encode(signatureBytes);

        const { data: verifyResp } = await apiClient.post('/auth/verify', {
          message,
          signature,
          publicKey: pubkey,
        });

        await authenticateWithToken(verifyResp.token);

        onConnect(pendingWalletType, verifyResp.user);
      } catch (err) {
        console.error('Wallet connect error:', err);
      } finally {
        setConnectingWallet(null);
        setPendingWalletType(null);
      }
    };

    connectAndSign();
  }, [currentWallet?.adapter?.name, pendingWalletType, signMessage]);

  const handleConnect = async (walletType: WalletType) => {
    setConnectingWallet(walletType);
    setPendingWalletType(walletType);

    switch (walletType) {
      case 'phantom':
        if (!wallets.find((w) => w.adapter.name === 'Phantom')) {
          toast.error('Phantom not installed');
          setConnectingWallet(null);
          setPendingWalletType(null);
          return;
        }

        await select('Phantom');
        break;
      case 'backpack':
        if (
          wallets.find((w) => w.adapter.name.toLowerCase().includes(walletType))
        ) {
          toast.error('Backpack not installed');

          setConnectingWallet(null);
          setPendingWalletType(null);
          return;
        }
        await select('Backpack');
        break;
      case 'metamask':
        try {
          const metaMaskProvider = getMetaMaskProvider();

          if (!metaMaskProvider) {
            return alert('MetaMask not found');
          }

          // Request access
          await metaMaskProvider.request({ method: 'eth_requestAccounts' });

          const provider = new ethers.BrowserProvider(metaMaskProvider);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          const { data: nonceResp } = await apiClient.post('/auth/nonce', {
            publicKey: address,
            walletType: 'metamask',
          });

          const nonce = nonceResp.nonce;
          const message = `Login to Deor\nNonce=${nonce}`;

          const signature = await signer.signMessage(message);

          const { data: verifyResp } = await apiClient.post('/auth/verify', {
            message,
            signature,
            publicKey: address,
          });

          await authenticateWithToken(verifyResp.token);

          onConnect(walletType, verifyResp.user);
        } catch (e: any) {
          toast.error(e.message);
        } finally {
          setConnectingWallet(null);
        }

        break;
    }
  };

  return (
    <button
      key={wallet.id}
      onClick={() => handleConnect(wallet.id)}
      disabled={!wallet.supported || loading}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
        wallet.supported
          ? 'border-border hover:border-blue-500 hover:bg-accent cursor-pointer'
          : 'border-border opacity-50 cursor-not-allowed'
      } ${loading ? 'border-blue-500 bg-accent' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br overflow-hidden ${wallet.color} flex items-center justify-center text-2xl flex-shrink-0`}
        >
          <img
            src={wallet.icon}
            className={clsx({
              'w-5 h-5': wallet.id === 'metamask',
              'w-5 h-7 object-center object-cover': wallet.id === 'backpack',
            })}
          />
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
          <p className="text-xs text-muted-foreground">{wallet.description}</p>
        </div>

        {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
      </div>
    </button>
  );
};

export default WalletConnectDialog;
