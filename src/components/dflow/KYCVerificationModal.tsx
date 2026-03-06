import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getPhantomProvider } from '../../hooks/usePhantomConnect';
import {
  buildDeepLink,
  buildProofMessage,
  buildRedirectUri,
  encodeSignature,
  verifyWallet,
} from '../../lib/proof';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const PROOF_PORTAL_URL =
  import.meta.env.VITE_PROOF_PORTAL_URL ?? 'https://dflow.net/proof';
const PROOF_VERIFY_URL =
  import.meta.env.VITE_PROOF_VERIFY_URL ?? 'https://proof.dflow.net/verify';
const APP_URL = import.meta.env.VITE_APP_URL ?? 'http://localhost:3000';

type KYCStep = 'checking' | 'unverified' | 'signing' | 'portal' | 'verified' | 'error';

interface KYCVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  onVerified: () => void;
}

const KYCVerificationModal = ({
  open,
  onOpenChange,
  walletAddress,
  onVerified,
}: KYCVerificationModalProps) => {
  const [step, setStep] = useState<KYCStep>('checking');
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (open && walletAddress) {
      checkVerification();
    }
  }, [open, walletAddress]);

  const checkVerification = async () => {
    setIsChecking(true);
    setStep('checking');
    setErrorMessage(null);
    try {
      const verified = await verifyWallet(walletAddress, PROOF_VERIFY_URL);
      if (verified) {
        setStep('verified');
        onVerified();
        onOpenChange(false);
      } else {
        setStep('unverified');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification check failed.';
      setErrorMessage(msg);
      setStep('error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSign = async () => {
    const provider = getPhantomProvider();
    if (!provider) {
      toast.error('Phantom wallet not found. Please connect your Phantom wallet.');
      return;
    }

    setStep('signing');
    setErrorMessage(null);

    try {
      const timestamp = Date.now();
      const message = buildProofMessage(timestamp);
      const messageBytes = new TextEncoder().encode(message);

      const { signature } = await provider.signMessage(messageBytes, 'utf8');
      const encodedSig = encodeSignature(signature);

      const redirectUri = buildRedirectUri(`${APP_URL}/kyc-callback`, walletAddress);
      const link = buildDeepLink({
        wallet: walletAddress,
        signature: encodedSig,
        timestamp,
        redirectUri,
        proofPortalUrl: PROOF_PORTAL_URL,
      });

      setDeepLink(link);
      setStep('portal');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signing failed.';
      setErrorMessage(msg);
      setStep('unverified');
    }
  };

  const openProofPortal = () => {
    if (!deepLink) return;
    window.open(deepLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>KYC Verification Required</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'checking' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Checking verification status...</p>
            </div>
          )}

          {(step === 'unverified' || step === 'error') && (
            <div className="space-y-4">
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-sm font-medium text-yellow-500">Verification Required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You must complete KYC verification before trading. This is a one-time process.
                </p>
              </div>

              {errorMessage && (
                <p className="text-xs text-destructive">{errorMessage}</p>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Step 1:</span> Sign the Proof verification message with your wallet
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Step 2:</span> Complete identity verification on the Proof portal
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Step 3:</span> Return here and confirm to start trading
                </p>
              </div>

              <Button onClick={handleSign} className="w-full">
                Begin KYC Verification
              </Button>
            </div>
          )}

          {step === 'signing' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Waiting for wallet signature...</p>
            </div>
          )}

          {step === 'portal' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <p className="text-sm font-medium text-blue-400">Signature Ready</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Open the Proof portal to complete your identity verification.
                </p>
              </div>

              <Button onClick={openProofPortal} className="w-full">
                Open Proof Portal
              </Button>

              <div className="border-t pt-4 space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  After completing verification in the Proof portal, click below to check your status.
                </p>
                <Button
                  variant="outline"
                  onClick={checkVerification}
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? 'Checking...' : "I've Completed Verification"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KYCVerificationModal;
