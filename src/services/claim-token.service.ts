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

type xpTokenBalanceResponse = {
  solanaWalletAddress: string;
  balance: number;
  xp: number;
  error: any;
};

export const getXpTokenBalance = async () => {
  const response =
    await apiClient.get<xpTokenBalanceResponse>("/solana/xp-balance");

  return response.data;
};

export type Claim = {
  id: string;
  amount: number;
  solanaWalletAddress: string;
  txSignature: string;
  createdAt: string;
};

export type ClaimHistoryResponse = {
  claims: Claim[];
  total: number;
};

export const claimedHistory = async () => {
  const response = await apiClient.get<ClaimHistoryResponse>(
    "/solana/claim-history",
  );

  return response.data;
};
