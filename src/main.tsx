import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import WalletAdapter from './providers/walletProvider.js';
import "@solana/wallet-adapter-react-ui/styles.css";

createRoot(document.getElementById('root')!).render(
  <WalletAdapter>
    <App />
  </WalletAdapter>
);
