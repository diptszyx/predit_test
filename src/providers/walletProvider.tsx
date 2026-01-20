import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useMemo } from 'react';
interface WalletAdapterProps {
  children: React.ReactNode;
}

export default function WalletAdapter(props: WalletAdapterProps) {
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={import.meta.env.VITE_RPC_URL}>
      <WalletProvider
        wallets={wallets}
        autoConnect
      >
        <WalletModalProvider>{props.children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
