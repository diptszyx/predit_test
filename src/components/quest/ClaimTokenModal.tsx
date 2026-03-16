import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { shortenAddress } from "../../lib/address";
import { claimToken } from "../../services/claim-token.service";
import useAuthStore from "../../store/auth.store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type ClaimTokenModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void
}

const ClaimTokenModal = ({ open, onOpenChange }: ClaimTokenModalProps) => {
  const { publicKey, wallets, wallet, select, connect, connected, connecting } = useWallet();
  const availableWallet = wallets[0];

  const user = useAuthStore(state => state.user)
  const updateUser = useAuthStore(state => state.updateUser)
  const totalXp = user?.xp

  const [claimAmount, setClaimAmount] = useState('')
  const [error, setError] = useState('')
  const [isClaiming, setIsClaiming] = useState(false)

  const handleChangeAmount = (value: string) => {
    if (!totalXp) return
    setError('')

    if (Number(value) > totalXp) {
      setError(`Insufficient XP amount`)
    }

    setClaimAmount(value)
  }

  const handleConnect = async () => {
    if (!wallet) {
      if (!availableWallet) throw new Error("No Solana wallet available");
      select(availableWallet.adapter.name);
      await new Promise((r) => setTimeout(r, 0));
    }
    await connect();
  };

  const handleClaimToken = async () => {
    if (!publicKey || !claimAmount) return

    const address = publicKey.toBase58()
    setIsClaiming(true)
    try {
      const data = await claimToken({
        amount: Number(claimAmount),
        solanaWalletAddress: address
      })

      if (data.success) {
        updateUser({
          xp: data.remainingXp
        })
        handleClose()
        toast.success(data.message || 'Claim Predit token successfully!')
      }
    } catch (error) {
      console.log('Failed to claim token', error)
      toast.error('Failed to claim token. Pleas try again!')
    } finally {
      setIsClaiming(false)
    }
  }

  const handleClose = () => {
    setError('')
    setClaimAmount('')
    onOpenChange(false)
  }

  const renderContent = () => {
    if (!availableWallet) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Wallet className="h-7 w-7 text-muted-foreground" />
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
            <Wallet className="h-7 w-7 text-[#FCD05A]" />
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

    return (
      <div className="flex h-full flex-col rounded-2xl mt-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="claim-token-amount" className="text-sm font-medium">
              Claim amount
            </Label>
            <span className="text-sm text-muted-foreground">
              Total XP: <span className="font-semibold text-[#FCD05A]">{totalXp}</span>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeAmount(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            disabled={isClaiming || error || !claimAmount}
            onClick={handleClaimToken}
            className="rounded-xl bg-[#FCD05A] px-5 font-semibold text-black hover:bg-[#f7c93f]"
          >
            {isClaiming ? 'Claiming' : 'Claim Predit Token'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Claim token</DialogTitle>
          <DialogDescription>
            Connect your wallet and claim your token.
          </DialogDescription>
        </DialogHeader>

        <div className="h-full">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  )
}

export default ClaimTokenModal
