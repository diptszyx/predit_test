import apiClient from "../lib/axios";

export interface CreateMarketValues {
  question: string;
  description: string;
  closeAt: Date | undefined | string;
  imageUrl: string | null;
  oracleId: string;
  yesPool: number;
  noPool: number;
}

export const marketServices = {
  createMarket: async (createData: CreateMarketValues) => {
    try {
      const { data } = await apiClient.post("market-admin", {
        ...createData,
      });

      return data;
    } catch (error) {
      console.error("Failed to create market: ", error);
    }
  },
};
