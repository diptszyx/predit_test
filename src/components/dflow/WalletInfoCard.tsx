import { useWallet } from "@solana/wallet-adapter-react";
import { ChevronDown, Copy, DollarSign, LogOut, ShieldCheck, ShieldX, Wallet as WalletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "../../lib/clipboardUtils";
import { verifyWallet } from "../../lib/proof";
import { useUSDCBalance } from "../../utils/getBalanceWallet";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { cn } from "../ui/utils";
import { shortenAddress } from "../../lib/address";

const PROOF_VERIFY_URL =
  import.meta.env.VITE_PROOF_VERIFY_URL ?? "https://proof.dflow.net/verify";

type KYCStatus = "loading" | "verified" | "unverified" | "unknown";

export function WalletInfoCard() {
  const { publicKey, connected, disconnect } = useWallet();
  const { balance, loading } = useUSDCBalance();
  const [kycStatus, setKycStatus] = useState<KYCStatus>("loading");

  useEffect(() => {
    if (!publicKey) return;
    const address = publicKey.toBase58();
    setKycStatus("loading");
    verifyWallet(address, PROOF_VERIFY_URL)
      .then((verified) => setKycStatus(verified ? "verified" : "unverified"))
      .catch(() => setKycStatus("unknown"));
  }, [publicKey]);

  if (!connected || !publicKey) return null;

  const address = publicKey.toBase58();

  const handleCopyToClipboard = async (text?: string) => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Wallet address copied to clipboard!');
    } else {
      toast.error('Unable to copy automatically', {
        description: 'Please copy the address manually',
      });
    }
  };

  const kycLabel = kycStatus === "loading" ? "Checking..." : kycStatus === "verified" ? "Verified" : "Not Verified";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm",
            "hover:bg-accent/40 transition-colors"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10">
              <WalletIcon className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">
                {loading ? "Loading..." : `${balance.toFixed(2)} USDC`}
              </span>
            </div>
          </div>

          {kycStatus === "verified" && (
            <ShieldCheck className="h-4 w-4 text-green-500" title="KYC Verified" />
          )}
          {kycStatus === "unverified" && (
            <ShieldX className="h-4 w-4 text-yellow-500" title="KYC Not Verified" />
          )}

          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          sideOffset={8}
          align="end"
          className={cn(
            "z-50 min-w-[200px] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md bg-background"
          )}
        >
          <div className="px-2 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Connected wallet</div>
                <div className="truncate text-sm font-medium">{shortenAddress(address)}</div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleCopyToClipboard(address)}
                className="shrink-0"
                title="Copy address"
              > <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1 h-px bg-border" />

          <div className="px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs text-muted-foreground">USDC Balance</span>
                <span className="text-sm font-semibold">
                  {loading ? "Loading..." : `$${balance.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1 h-px bg-border" />

          <div className="px-2 py-2">
            <div className="flex items-center gap-2">
              {kycStatus === "verified" ? (
                <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <ShieldX className="h-4 w-4 text-yellow-500 shrink-0" />
              )}
              <div className="flex flex-col leading-tight">
                <span className="text-xs text-muted-foreground">KYC Status</span>
                <span className={cn(
                  "text-sm font-semibold",
                  kycStatus === "verified" ? "text-green-500" : "text-yellow-500"
                )}>
                  {kycLabel}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1 h-px bg-border" />

          <DropdownMenuItem
            onSelect={async (e: Event) => {
              e.preventDefault();
              try {
                await disconnect();
              } catch (err) {
                console.error("Disconnect failed", err);
              }
            }}
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none",
              "hover:bg-accent focus:bg-accent",
            )}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
