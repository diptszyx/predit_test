import { createSolanaDevnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react';
import { ReactNode } from 'react';

const config = createWalletUiConfig({
    clusters: [
        // You can add mainnet when you're ready
        // createSolanaMainnet('https://mainnet.your-rpc.com?api-key=secret'),
        createSolanaDevnet(),
    ],
});

export function WalletUiProvider({ children }: { children: ReactNode }) {
    return <WalletUi config={config}>{children}</WalletUi>;
}