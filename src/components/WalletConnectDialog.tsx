import clsx from 'clsx';
import { ethers } from 'ethers';
import { CheckCircle2, Loader2, Wallet } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getPhantomProvider,
  usePhantomDirectConnect,
} from '../hooks/usePhantomConnect';
import apiClient from '../lib/axios';
import { User } from '../lib/types';
import useAuthStore from '../store/auth.store';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Separator } from './ui/separator';
import { useWallet } from '@solana/wallet-adapter-react';

import bs58 from 'bs58';
import { useIsMobile } from '../hooks/useIsMobile';

export type WalletType = 'metamask' | 'phantom' | 'backpack';
export type SocialProvider = 'google' | 'x';

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (wallet: WalletType, user: User) => void;
  onSocialConnect: (provider: SocialProvider) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

interface SocialOption {
  id: SocialProvider;
  name: string;
  icon: string;
  color: string;
}

interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  icon: string;
  color: string;
  supported: boolean;
}

const hasMeta = typeof window !== 'undefined' && (window as any).ethereum;

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
    supported: getPhantomProvider(),
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
  const eth = (window as any).ethereum;

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
  const navigate = useNavigate();
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(
    null
  );
  const [connectingSocial, setConnectingSocial] =
    useState<SocialProvider | null>(null);

  const resetState = () => {
    setConnectingWallet(null);
    setConnectingSocial(null);
    setPendingMwaLogin(false);
  };

  const isMobile = useIsMobile(1024);
  const displayWallets = (
    isMobile ? wallets.filter((w) => w.id === 'phantom') : wallets
  ).map((w) => {
    if (w.id === 'phantom') {
      return isMobile
        ? {
            ...w,
            supported: true,
            name: 'Solana Mobile Wallet',
            description: 'Phantom, Backpack, Solflare...',
          }
        : w;
    }
    return w;
  });

  const { publicKey, connected, signMessage, connect, wallets: adapterWallets } = useWallet();
  const walletDebugToastShown = useRef(false);
  const authenticateWithToken = useAuthStore(
    (state) => state.authenticateWithToken
  );
  const currentUser = useAuthStore((state) => state.user);
  const [isAuthenticatingSolana, setIsAuthenticatingSolana] = useState(false);
  // Only true after user explicitly clicks the MWA/wallet button
  const [pendingMwaLogin, setPendingMwaLogin] = useState(false);

  const handleSolanaLogin = async () => {
    if (!publicKey || !signMessage || isAuthenticatingSolana) return;

    setIsAuthenticatingSolana(true);
    try {
      const { data: nonceResp } = await apiClient.post('/auth/nonce', {
        publicKey: publicKey.toBase58(),
        walletType: 'phantom',
      });

      if (!nonceResp?.nonce) {
        throw new Error('Failed to get authentication nonce');
      }

      const message = `Login to Deor\nNonce=${nonceResp.nonce}`;
      const messageBytes = new TextEncoder().encode(message);

      const signature = await signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);

      const { data: verifyResp } = await apiClient.post('/auth/verify', {
        message,
        signature: signatureBase58,
        publicKey: publicKey.toBase58(),
      });

      if (!verifyResp?.token || !verifyResp?.user) {
        throw new Error('Authentication failed');
      }

      await authenticateWithToken(verifyResp.token);
      toast.success('Successfully logged in with Solana!');
      onConnect('phantom', verifyResp.user);
    } catch (err: any) {
      console.error('Solana login error:', err);
      toast.error(err.message || 'Failed to login with Solana');
    } finally {
      setIsAuthenticatingSolana(false);
    }
  };

  // Only trigger login if user explicitly initiated an MWA connect
  useEffect(() => {
    if (
      pendingMwaLogin &&
      connected &&
      publicKey &&
      !currentUser &&
      !isAuthenticatingSolana
    ) {
      setPendingMwaLogin(false);
      handleSolanaLogin();
    }
  }, [connected, publicKey, pendingMwaLogin, currentUser]);

  useEffect(() => {
    if (!open) {
      walletDebugToastShown.current = false;
      return;
    }
    if (walletDebugToastShown.current) return;
    const names = adapterWallets.map((w) => w.adapter.name).join(', ');
    toast.info(`Wallets: ${names || 'none'}`);
    walletDebugToastShown.current = true;
  }, [open, adapterWallets]);

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
            Connect to Predit Market of Predictions
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
                    {social.id === 'x' ? (
                      <span className="text-2xl">𝕏</span>
                    ) : (
                      <img className="w-5 h-5" src={social.icon} />
                    )}
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
            {displayWallets.map((wallet) => {
              const isConnecting =
                connectingWallet === wallet.id ||
                (isAuthenticatingSolana && wallet.id === 'phantom');

              return (
                <WalletConnectButton
                  key={wallet.id}
                  loading={isConnecting}
                  wallet={wallet}
                  setConnectingWallet={setConnectingWallet}
                  onConnect={onConnect}
                  isMobile={isMobile}
                  onConnectMwa={async () => {
                    setPendingMwaLogin(true);

                    // Avoid reconnect race/errors when adapter is already connected.
                    if (connected && publicKey) {
                      return;
                    }

                    try {
                      await connect();
                    } catch (error) {
                      setPendingMwaLogin(false);
                      throw error;
                    }
                  }}
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
                onClick={() => {
                  navigate('/privacy-policy');
                  onOpenChange(false);
                }}
                className="text-blue-500 hover:underline cursor-pointer text-xs"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                onClick={() => {
                  navigate('/terms-of-service');
                  onOpenChange(false);
                }}
                className="text-blue-500 hover:underline cursor-pointer text-xs"
              >
                Terms of Service
              </button>
              .
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
  isMobile,
  onConnectMwa,
}: {
  wallet: {
    id: WalletType;
    name: string;
    description: string;
    icon: string;
    color: string;
    supported: boolean;
  };
  loading: boolean;
  onConnect: (wallet: WalletType, user: User) => void;
  setConnectingWallet: (walletType: WalletType | null) => void;
  isMobile: boolean;
  onConnectMwa: () => Promise<void>;
}) => {
  const [pendingWalletType, setPendingWalletType] = useState<WalletType | null>(
    null
  );

  const authenticateWithToken = useAuthStore(
    (state) => state.authenticateWithToken
  );

  const { handlePhantomDirectConnect } = usePhantomDirectConnect({
    onConnect,
    setConnectingWallet,
  });

  const handleConnect = async (walletType: WalletType) => {
    setConnectingWallet(walletType);
    setPendingWalletType(walletType);

    switch (walletType) {
      case 'phantom':
        if (isMobile) {
          // Directly trigger MWA without any intermediate modal
          try {
            await onConnectMwa();
          } catch (e: any) {
            let detail = null;
            try {
              detail = JSON.stringify(e);
            } catch {}
            toast.error(
              e?.message ||
                e?.error?.message ||
                e?.cause?.message ||
                detail ||
                'Failed to connect wallet'
            );
            setConnectingWallet(null);
            setPendingWalletType(null);
          }
        } else {
          if (!getPhantomProvider()) {
            toast.error('Phantom not installed');
            setConnectingWallet(null);
            setPendingWalletType(null);
            return;
          } else {
            handlePhantomDirectConnect();
          }
        }
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
      default:
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
          className={`w-12 h-12 rounded-xl bg-gradient-to-br overflow-hidden ${wallet.color} flex items-center justify-center text-2xl shrink-0`}
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
              <Badge variant="outline" className="text-xs">
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
