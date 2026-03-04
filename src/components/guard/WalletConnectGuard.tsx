import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet } from "lucide-react";
import { Button } from "../ui/button";

type RequireWalletProps = {
  children: React.ReactNode;
};

export function RequirePhantomConnected({ children }: RequireWalletProps) {
  const { wallets, wallet, select, connect, connected, connecting } = useWallet();

  const availableWallet = wallets[0];

  const handleConnect = async () => {
    if (!wallet) {
      if (!availableWallet) throw new Error("No Solana wallet available");
      select(availableWallet.adapter.name);
      await new Promise((r) => setTimeout(r, 0));
    }
    await connect();
  };

  if (!availableWallet) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
        <div className="relative w-full max-w-md">
          <div className="relative rounded-2xl bg-sidebar border border-border p-8 text-center space-y-5 shadow-xl">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                <Wallet className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Solana Wallet Not Detected
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Please install a supported Solana wallet to continue, then refresh this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-1 bg-white/5 rounded-2xl -z-1 blur-sm" />
          <div className="relative rounded-2xl bg-sidebar border border-border p-8 text-center space-y-6 shadow-xl">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                <Wallet className="h-6 w-6 text-indigo-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Wallet Connection Required
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your Solana wallet to access this market and join the discussion.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={async () => {
                try {
                  await handleConnect();
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
