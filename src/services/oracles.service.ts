import apiClient from "../lib/axios";

export interface GetAllOracleResponse {
  data: OracleEntity[];
  hasNextPage: boolean;
}

export interface OracleEntity {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  rating: string;
  predictions: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  __entity: "OracleEntity";
}

export interface OracleUserStatus {
  hasLiked: boolean;
  userRating: number | null;
}

export const oraclesServices = {
  getAllOracles: async () => {
    try {
      const { data } = await apiClient.get<GetAllOracleResponse>("oracles");
      return data;
    } catch (error) {
      console.log("Failed to fetch all oracles: ", error);
    }
  },

  getOracleById: async (oracleId: string) => {
    try {
      const { data } = await apiClient.get<OracleEntity>(
        `/oracles/${oracleId}`
      );

      return data;
    } catch (error) {
      console.log("Failed to fetch oracles id: ", error);
    }
  },

  getOracleUserStatus: async (oracleId: string) => {
    try {
      const { data } = await apiClient.get<OracleUserStatus>(
        `/oracles/${oracleId}/user-status`
      );

      return data;
    } catch (error) {
      console.log("Failed to fetch oracles user status: ", error);
    }
  },

  handleLike: async (oracleId: string) => {
    try {
      const { data } = await apiClient.post<OracleEntity>(
        `/oracles/${oracleId}/like`
      );

      return data;
    } catch (error) {
      console.log("Failed to like oracle: ", error);
    }
  },

  handleDislike: async (oracleId: string) => {
    try {
      const { data } = await apiClient.delete<OracleEntity>(
        `/oracles/${oracleId}/like`
      );

      return data;
    } catch (error) {
      console.log("Failed to dislike oracle: ", error);
    }
  },

  handleRating: async (oracleId: string, rating: number) => {
    try {
      const { data } = await apiClient.post<OracleEntity>(
        `/oracles/${oracleId}/rate`,
        {
          rating,
        }
      );

      return data;
    } catch (error) {
      console.log("Failed to rate oracle: ", error);
    }
  },
};
