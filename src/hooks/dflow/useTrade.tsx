import { useState, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';


import {
  getDflowTradeTransaction,
  getDflowOrderStatus,
  getDflowRedemptionTransaction,
} from '../../services/dflow.service';

export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const CASH_MINT = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH';

export const useTrade = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [isTrading, setIsTrading] = useState(false);

  const placeOrder = useMemo(
    () =>
      async (side: 'BUY' | 'SELL', outcomeMint: string, uiAmount: number, inputMint?: string) => {
        if (!publicKey || !signTransaction)
          throw new Error('Wallet not connected');

        try {
          setIsTrading(true);

          const finalInputMint = inputMint || (side === 'BUY' ? USDC_MINT : outcomeMint);
          const finalOutputMint = side === 'BUY' ? outcomeMint : CASH_MINT;

          // Assuming 6 decimals for both USDC and Outcome tokens
          const atomicAmount = Math.floor(uiAmount * 1_000_000);

          const { transaction: swapTransaction } =
            await getDflowTradeTransaction({
              inputMint: finalInputMint,
              outputMint: finalOutputMint,
              amount: atomicAmount,
              slippageBps: 500, // Increased slippage tolerance slightly
              userPublicKey: publicKey.toString(),
            });

          const txBuf = Buffer.from(swapTransaction, 'base64');
          const transaction = VersionedTransaction.deserialize(txBuf);

          const signedTx = await signTransaction(transaction);

          const txid = await connection.sendRawTransaction(
            signedTx.serialize(),
            {
              skipPreflight: true,
            }
          );

          const confirmation = await connection.confirmTransaction(txid);
          if (confirmation.value.err) {
            throw new Error('Transaction failed to confirm');
          }

          let attempts = 0;
          while (attempts < 30) {
            try {
              const orderStatus = await getDflowOrderStatus(txid);
              if (
                orderStatus.status === 'closed' ||
                orderStatus.status === 'failed'
              ) {
                if (orderStatus.status === 'failed')
                  throw new Error('Order failed to fill on Dflow');
                return { signature: txid, status: orderStatus };
              }
            } catch (e) {
              console.warn('Error polling order status:', e);
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
            attempts++;
          }

          throw new Error('Timeout waiting for order verification');
        } catch (err) {
          console.error(err);
          throw err;
        } finally {
          setIsTrading(false);
        }
      },
    [publicKey, signTransaction, connection]
  );

  const redeemPositions = useMemo(
    () =>
      async (outcomeMint: string, uiAmount: number) => {
        if (!publicKey || !signTransaction)
          throw new Error('Wallet not connected');

        try {
          setIsTrading(true);

          // Assuming 6 decimals
          const atomicAmount = Math.floor(uiAmount * 1_000_000);

          const { transaction: redeemTransaction } =
            await getDflowRedemptionTransaction({
              inputMint: outcomeMint,
              outputMint: CASH_MINT,
              amount: atomicAmount,
              userPublicKey: publicKey.toString(),
            });

          const txBuf = Buffer.from(redeemTransaction, 'base64');
          const transaction = VersionedTransaction.deserialize(txBuf);

          const signedTx = await signTransaction(transaction);

          const txid = await connection.sendRawTransaction(
            signedTx.serialize(),
            {
              skipPreflight: true,
            }
          );


          const confirmation = await connection.confirmTransaction(txid);
          if (confirmation.value.err) {
            throw new Error('Transaction failed to confirm');
          }

          let attempts = 0;
          while (attempts < 30) {
            try {
              const orderStatus = await getDflowOrderStatus(txid);
              if (
                orderStatus.status === 'closed' ||
                orderStatus.status === 'failed'
              ) {
                if (orderStatus.status === 'failed')
                  throw new Error('Order failed to fill on Dflow');
                return { signature: txid, status: orderStatus };
              }
            } catch (e) {
              console.warn('Error polling order status:', e);
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
            attempts++;
          }

          throw new Error('Timeout waiting for order verification');
        } catch (err) {
          console.error(err);
          throw err;
        } finally {
          setIsTrading(false);
        }
      },
    [publicKey, signTransaction, connection]
  );

  const checkOrder = useCallback(async (signature: string) => {
    return await getDflowOrderStatus(signature);
  }, []);

  return { placeOrder, redeemPositions, checkOrder, isTrading };
};
