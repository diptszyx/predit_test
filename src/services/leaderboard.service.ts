import apiClient from '../lib/axios';

export type LeaderboardType = 'xp' | 'level';

export interface LeaderboardEntry {
  xp: number;
  level: number;
  appWalletAddress: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userData?: LeaderboardEntry;
}

export const leaderboardService = {
  getLeaderboard: async (
    type: LeaderboardType = 'xp'
  ): Promise<LeaderboardResponse> => {
    try {
      const { data } = await apiClient.get<LeaderboardResponse>(
        `/xp-events/leaderboard?type=${type}`
      );
      return {
        leaderboard: data?.leaderboard ?? [],
        userData: data?.userData,
      };
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return { leaderboard: [] };
    }
  },
};
