import apiClient from "../lib/axios";

export type LeaderboardType = "xp" | "level";

export interface LeaderboardEntry {
  xp: number;
  level: number;
  appWalletAddress: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userData?: LeaderboardEntry;
}

export type XpEventType =
  | "prediction"
  | "quest"
  | "invite"
  | "friend_join"
  | "subscribe_pro"
  | "streak"
  | "milestone";
export interface XpMetadata {
  isPro?: boolean;
  streakDays?: number;
  predictionCount?: number;
}

export interface XpHistoryItem {
  id: string;
  userId: string;
  // user: UserSnapshot;

  eventType: XpEventType;

  baseXp: number;
  multiplier: number;
  totalXp: number;

  metadata: XpMetadata | null;

  createdAt: string;
}

export type XpHistoryResponse = {
  events: XpHistoryItem[];
};

export const XP_EVENT_LABEL: Record<XpEventType, string> = {
  prediction: "Prediction",
  quest: "Quest",
  invite: "Invite",
  friend_join: "Friend Joined",
  subscribe_pro: "Pro Subscription",
  streak: "Daily Streak",
  milestone: "Milestone",
};

export const leaderboardService = {
  getLeaderboard: async (
    type: LeaderboardType = "xp"
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
      console.error("Failed to fetch leaderboard:", error);
      return { leaderboard: [] };
    }
  },

  getXpEvents: async (params: {
    page: number;
    eventType?: XpEventType;
    limit: number;
  }) => {
    try {
      const { data } = await apiClient.get<XpHistoryResponse>(`/xp-events`, {
        params,
      });
      return {
        events: data?.events ?? [],
      };
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      return { events: [] };
    }
  },
};
