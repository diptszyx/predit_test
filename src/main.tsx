import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import {
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  registerMwa,
} from '@solana-mobile/wallet-standard-mobile';
import { mwaAuthCache } from './lib/mwaAuthCache';

registerMwa({
  appIdentity: {
    name: 'Predit Market',
    uri: 'https://predit.market',
    icon: 'logo-MarkWhite.svg',
  },
  authorizationCache: mwaAuthCache,
  chains: ['solana:devnet', 'solana:mainnet'],
  chainSelector: createDefaultChainSelector(),
  onWalletNotFound: createDefaultWalletNotFoundHandler(),
});

createRoot(document.getElementById('root')!).render(<App />);
