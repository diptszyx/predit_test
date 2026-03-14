import apiClient from "../lib/axios";

export enum QuestType {
  CONNECT_X = "CONNECT_X",
  FOLLOW_X = "FOLLOW_X",
  SHARE_POST = "SHARE_POST",
  DAILY_TRADE = "DAILY_TRADE",
  JOIN_DISCORD = "JOIN_DISCORD",
  LIKE_X = "LIKE_X",
  RETWEET_X = "RETWEET_X",
  DAILY_TRADE_POLYMARKET = "DAILY_TRADE_POLYMARKET",
}

export const DAILY_QUEST_TYPES: QuestType[] = [
  QuestType.SHARE_POST,
  QuestType.DAILY_TRADE,
  QuestType.DAILY_TRADE_POLYMARKET,
];

export enum QuestStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export interface BaseQuest {
  questId: string;
  questType: QuestType;
  name: string;
  description: string;
  xpReward: number;
  status: QuestStatus;
  metadata: Record<string, any> | null;
}

export interface FollowXMetadata {
  targetUsername: string;
}

export interface SharePostMetadata {
  requiredHashtag: string;
}

export interface LikeXMetadata {
  tweetId: string;
}

export interface RetweetXMetadata {
  tweetId: string;
}

export type Quest =
  | (BaseQuest & {
      questType: QuestType.CONNECT_X;
      metadata: null;
    })
  | (BaseQuest & {
      questType: QuestType.FOLLOW_X;
      metadata: FollowXMetadata;
    })
  | (BaseQuest & {
      questType: QuestType.SHARE_POST;
      metadata: SharePostMetadata;
    })
  | (BaseQuest & {
      questType: QuestType.DAILY_TRADE;
      metadata: null;
    })
  | (BaseQuest & {
      questType: QuestType.JOIN_DISCORD;
      metadata: null;
    })
  | (BaseQuest & {
      questType: QuestType.LIKE_X;
      metadata: LikeXMetadata;
    })
  | (BaseQuest & {
      questType: QuestType.RETWEET_X;
      metadata: RetweetXMetadata;
    })
  | (BaseQuest & {
      questType: QuestType.DAILY_TRADE_POLYMARKET;
      metadata: null;
    });

export interface QuestResponse {
  quests: Quest[];
  totalXpEarned: number;
  totalXpAvailable: number;
}

export const getQuests = async () => {
  const response = await apiClient.get<QuestResponse>("/quests");
  return response.data;
};

export type VerifyQuestResponse = {
  success: boolean;
  message: string;
  xpAwarded: number;
};

export const verifyFollow = async (questId: string) => {
  const response = await apiClient.post<VerifyQuestResponse>(
    `/quests/verify-follow`,
    {
      questId,
    },
  );

  return response.data;
};

export type ConnectX = {
  authUrl: string;
  state: string;
};

export const connectX = async () => {
  const response = await apiClient.get<ConnectX>("/quests/connect-x");

  return response.data;
};

export const connectDiscord = async () => {
  const response = await apiClient.get<ConnectX>("/quests/connect-discord");

  return response.data;
};

export const verifySharePost = async (questId: string, tweetUrl: string) => {
  const response = await apiClient.post<VerifyQuestResponse>(
    "/quests/verify-share-post",
    {
      questId,
      tweetUrl,
    },
  );

  return response.data;
};

export const verifyTradeDaily = async (questId: string) => {
  const response = await apiClient.post<VerifyQuestResponse>(
    "/quests/verify-daily-trade",
    {
      questId,
    },
  );

  return response.data;
};

export const verifyTradeDailyPolymarket = async (questId: string) => {
  const response = await apiClient.post<VerifyQuestResponse>(
    "/quests/verify-daily-trade-polymarket",
    {
      questId,
    },
  );

  return response.data;
};

export const verifyJoinDiscord = async (questId: string) => {
  const response = await apiClient.post<VerifyQuestResponse>(
    "/quests/verify-join-discord",
    {
      questId,
    },
  );

  return response.data;
};

export const verifyLikeTweet = async (questId: string) => {
  const response = await apiClient.post<VerifyQuestResponse>(
    "/quests/verify-like",
    {
      questId,
    },
  );

  return response.data;
};

export const verifyRetweetTweet = async (questId: string) => {
  const response = await apiClient.post<VerifyQuestResponse>(
    "/quests/verify-retweet",
    {
      questId,
    },
  );

  return response.data;
};

export type ContentShareResponse = {
  marketId: string;
  marketQuestion: string;
  shareContent: string;
  requiredMention: string;
  marketUrl: string;
};

export const getContentShare = async () => {
  const response = await apiClient.get<ContentShareResponse>(
    "/quests/share-content",
  );

  return response.data;
};
