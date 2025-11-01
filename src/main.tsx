
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
import { WalletUiProvider } from "./providers/walletUiProvider.js";

  createRoot(document.getElementById("root")!).render(<WalletUiProvider><App /></WalletUiProvider>);
  