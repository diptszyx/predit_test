import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { USDC_MINT } from "../hooks/dflow/useTrade";

export function useUSDCBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            mint: new PublicKey(USDC_MINT),
          }
        );

        const bal =
          accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
        setBalance(bal);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [connection, publicKey, connected]);

  return { balance, loading };
}
