import apiClient from "../lib/axios";

type ClaimToken = {
  amount: number;
  solanaWalletAddress: string;
};

type ClaimTokenResponse = {
  amount: number;
  message: string;
  remainingXp: number;
  solanaWalletAddress: string;
  success: boolean;
  txSignature: string;
};

export const claimToken = async (data: ClaimToken) => {
  const response = await apiClient.post<ClaimTokenResponse>("/solana/claim", {
    ...data,
  });

  return response.data;
};
