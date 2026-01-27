import { Connection, PublicKey } from "@solana/web3.js";

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);

const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);

export type TokenAccount = {
  mint: string;
  balance: string;
  decimals: number;
  programId: string;
};

export async function getUserTokenAccounts(
  walletAddress: string,
  rpcUrl = import.meta.env.VITE_RPC_URL,
): Promise<TokenAccount[]> {
  const connection = new Connection(rpcUrl, "confirmed");
  const owner = new PublicKey(walletAddress);

  const programIds = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID];

  const results = await Promise.all(
    programIds.map(async (programId) => {
      const res = await connection.getParsedTokenAccountsByOwner(owner, {
        programId,
      });

      return res.value
        .map((acc) => {
          const info = acc.account.data.parsed.info;
          return {
            mint: info.mint as string,
            balance: info.tokenAmount.amount as string,
            decimals: info.tokenAmount.decimals as number,
            programId: programId.toBase58(),
          } satisfies TokenAccount;
        })
        .filter((t) => t.balance !== "0");
    }),
  );

  return results.flat();
}
