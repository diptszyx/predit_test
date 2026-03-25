import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { toast } from "sonner";
import apiClient from "../lib/axios";
import useAuthStore from "../store/auth.store";
import { User } from "../lib/types";

export type WalletType = "metamask" | "phantom" | "backpack";

export function getPhantomProvider() {
  if (typeof window === "undefined") return null;

  const anyWin = window as any;
  const provider = anyWin.phantom?.solana;

  if (provider?.isPhantom) return provider;
  return null;
}

interface PhantomConnectProps {
  onConnect: (wallet: WalletType, user: User) => void;
  setConnectingWallet: (walletType: WalletType | null) => void;
}

export const usePhantomDirectConnect = ({
  onConnect,
  setConnectingWallet,
}: PhantomConnectProps) => {
  const authenticateWithToken = useAuthStore(
    (state) => state.authenticateWithToken,
  );

  const { select, wallets: adapterWallets } = useWallet();

  const handlePhantomDirectConnect = async () => {
    setConnectingWallet("phantom");

    try {
      const provider = getPhantomProvider();

      if (!provider) {
        throw new Error(
          "Phantom wallet is not installed. Please install it from phantom.app",
        );
      }

      const resp = await provider.connect();
      const publicKey = resp.publicKey.toString();

      const { data: nonceResp } = await apiClient.post("/auth/nonce", {
        publicKey: publicKey,
        walletType: "phantom",
      });

      if (!nonceResp?.nonce) {
        throw new Error("Failed to get authentication nonce");
      }

      const message = `Login to Deor\nNonce=${nonceResp.nonce}`;
      const messageBytes = new TextEncoder().encode(message);

      const { signature } = await provider.signMessage(messageBytes, "utf8");
      const signatureBase58 = bs58.encode(signature);

      const { data: verifyResp } = await apiClient.post("/auth/verify", {
        message,
        signature: signatureBase58,
        publicKey: publicKey,
      });

      if (!verifyResp?.token || !verifyResp?.user) {
        throw new Error("Authentication failed");
      }

      await authenticateWithToken(verifyResp.token);

      // Sync adapter: select Phantom so autoConnect picks it up
      try {
        const phantomAdapter = adapterWallets.find(
          (w) => w.adapter.name === "Phantom",
        );
        if (phantomAdapter) {
          select(phantomAdapter.adapter.name);
        }
      } catch (e) {
        console.warn("Failed to sync wallet adapter:", e);
      }

      toast.success("Successfully connected to Phantom!");
      onConnect("phantom", verifyResp.user);
    } catch (err: any) {
      console.error("Phantom connection error:", err);

      let errorMessage = "Failed to connect to Phantom";

      if (err.code === 4001 || err.message?.includes("User rejected")) {
        errorMessage = "You rejected the connection request";
      } else if (err.message?.includes("not installed")) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setConnectingWallet(null);
    }
  };

  return { handlePhantomDirectConnect };
};
