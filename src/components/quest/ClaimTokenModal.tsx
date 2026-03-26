import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet as WalletIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { claimToken } from "../../services/claim-token.service";
import useAuthStore from "../../store/auth.store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type ClaimTokenModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimSuccess?: () => void;
};

const ClaimTokenModal = ({
  open,
  onOpenChange,
  onClaimSuccess,
}: ClaimTokenModalProps) => {
  const claimNetwork = import.meta.env.VITE_CLAIM_TOKEN_NETWORK;
  const { publicKey, wallet, wallets, connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const hasWallets = wallets.length > 0;

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const totalXp = user?.xp;

  const [claimAmount, setClaimAmount] = useState("");
  const [error, setError] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangeAmount = (value: string) => {
    if (!totalXp) return;
    setError("");

    if (value !== "") {
      const num = Number(value);
      if (!Number.isInteger(num) || num < 0) return;
      if (num > totalXp) {
        setError("Insufficient XP amount");
      }
    }

    setClaimAmount(value);
  };

  const handleConnect = () => {
    setVisible(true);
  };

  const handleConfirmClaim = () => {
    setShowConfirm(true);
  };

  const handleClaimToken = async () => {
    if (!publicKey || !claimAmount) return;

    const address = publicKey.toBase58();
    setIsClaiming(true);
    setShowConfirm(false);
    try {
      const data = await claimToken({
        amount: Number(claimAmount),
        solanaWalletAddress: address,
      });

      if (data.success) {
        if (data.remainingXp !== undefined) {
          updateUser({ xp: data.remainingXp });
        }

        let txToast: string | number | undefined;
        if (data.txSignature) {
          const isDevnetNetwork = claimNetwork === "devnet";
          const viewSolscanLink = `https://solscan.io/tx/${data.txSignature}${isDevnetNetwork ? "?cluster=devnet" : ""}`;
          txToast = toast.success(
            <div className="flex gap-1">
              <span>{data.message || "Claim Predit token successfully!"}.</span>
              <a
                href={viewSolscanLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-[#3b82f6]"
              >
                View on solscan
              </a>
            </div>,
            { duration: 15000 },
          );
        } else {
          txToast = toast.success(
            data.message || "Claim Predit token successfully!",
            { duration: 15000 },
          );
        }

        const previousXp = totalXp;
        setClaimAmount("");
        setError("");

        for (let i = 0; i < 5; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          await onClaimSuccess?.();
          const currentXp = useAuthStore.getState().user?.xp;
          if (currentXp !== previousXp) break;
        }

        handleClose();
      }
    } catch (error: any) {
      console.error("Failed to claim token", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to claim token. Please try again!",
      );
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    setError("");
    setClaimAmount("");
    setShowConfirm(false);
    onOpenChange(false);
  };

  const renderContent = () => {
    if (!hasWallets) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <WalletIcon className="h-7 w-7 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-lg font-semibold">No wallet detected</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            You need a Solana wallet to claim tokens. Please install or enable a
            supported wallet such as Phantom, Backpack, or Solflare, then reopen
            this modal.
          </p>
        </div>
      );
    }

    if (!connected) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border p-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FCD05A]/15">
            <WalletIcon className="h-7 w-7 text-[#FCD05A]" />
          </div>

          <h3 className="mt-2 text-lg font-semibold">Connect your wallet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Connect your Solana wallet to verify your account and continue the
            token claim process securely.
          </p>

          <Button
            onClick={handleConnect}
            disabled={connecting}
            className="mt-5 rounded-2xl bg-[#FCD05A] px-5 font-semibold text-black hover:bg-[#f7c93f]"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      );
    }

    if (isClaiming && !claimAmount) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl p-6 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FCD05A] border-t-transparent" />
          <h3 className="mt-4 text-lg font-semibold">
            Processing your claim...
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Please wait while we update your XP balance. This may take a few
            seconds.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col rounded-2xl mt-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="claim-token-amount" className="text-sm font-medium">
              Claim amount
            </Label>
            <span className="text-sm text-muted-foreground">
              Total XP:{" "}
              <span className="font-semibold text-[#FCD05A]">{totalXp}</span>
            </span>
          </div>
          <Input
            id="claim-token-amount"
            type="number"
            min={0}
            max={totalXp}
            step={1}
            inputMode="numeric"
            placeholder={`Enter amount xp`}
            value={claimAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChangeAmount(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
              const paste = e.clipboardData.getData("text");
              if (!/^\d+$/.test(paste)) e.preventDefault();
            }}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            disabled={
              isClaiming || !!error || !claimAmount || Number(claimAmount) <= 0
            }
            onClick={handleConfirmClaim}
            className="rounded-xl bg-[#FCD05A] px-5 font-semibold text-black hover:bg-[#f7c93f]"
          >
            {isClaiming ? "Claiming..." : "Claim Predit Token"}
          </Button>
        </div>
      </div>
    );
  };

  const isProcessing = isClaiming && !claimAmount;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val: boolean) => {
          if (isProcessing) return;
          if (!val) {
            setError("");
            setClaimAmount("");
            setShowConfirm(false);
          }
          onOpenChange(val);
        }}
      >
        <DialogContent
          className={`max-w-2xl max-h-[80vh] ${isProcessing ? "[&>button:last-child]:hidden" : ""}`}
          onInteractOutside={(e: Event) => {
            if (isProcessing) e.preventDefault();
          }}
          onEscapeKeyDown={(e: KeyboardEvent) => {
            if (isProcessing) e.preventDefault();
          }}
        >
          {!isProcessing && (
            <DialogHeader>
              <DialogTitle>Claim token</DialogTitle>
              <DialogDescription>
                {!hasWallets
                  ? "Install a Solana wallet to get started."
                  : !connected
                    ? "Connect your wallet to continue the claim process."
                    : "Enter the amount of XP you want to convert into tokens."}
              </DialogDescription>
            </DialogHeader>
          )}

          <div className="h-full">{renderContent()}</div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm token claim</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to convert <strong>{claimAmount} XP</strong> into
              Predit tokens. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClaimToken}
              className="bg-[#FCD05A] text-black hover:bg-[#f7c93f]"
            >
              Confirm Claim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClaimTokenModal;
