// Core type definitions for Dehouse of Predictions

export interface AIAgent {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  category: string;
  rating: string;
  likes: string;
  specialty: string;
  tags: string[];
  avatar: string;
  bgColor: string;
  level?: number;
  xp?: number;
  tier?: "free" | "premium" | "elite";
  consultSessions?: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  totalPredictions: number;
  accurateRate: number;
  aiAgentsVisited: number;
  walletAddress?: string;
  walletType?: "metamask" | "phantom" | "backpack";
  socialProvider?: "google" | "apple";
  email?: string;
  phone?: string;
  subscriptionTier?: "free" | "master";
  visitedAIAgents?: string[];
  dailyPredictionsUsed?: number;
  dailyPredictionsResetDate?: string;
  dailyLinesUsed?: number;
  dailyLinesResetDate?: string;
  referralCode?: string;
  referredBy?: string;
  referredFriends?: Array<{
    username: string;
    joinedAt: string;
    xpEarned: number;
    avatar?: string;
  }>;
  dailyQuestProgress?: {
    visitAIAgents: number;
    makePredictions: number;
    shareContent: number;
    lastResetDate: string;
  };
  predictionHistory?: Array<{
    id: string;
    question: string;
    aiAgentName: string;
    timestamp: string;
  }>;
}

export interface Prediction {
  id: string;
  aiAgentId: string;
  userId: string;
  question: string;
  prediction: string;
  confidence: number;
  outcome?: "correct" | "incorrect" | "pending";
  stake?: number;
  reward?: number;
  timestamp: Date;
  category: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  xpReward: number;
  deadline: Date;
  progress?: number;
  maxProgress: number;
  completed?: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  features: string[];
  color: string;
  popular?: boolean;
}

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: Date;
  totalStaked: number;
  options: MarketOption[];
  status: "active" | "closed" | "resolved";
}

export interface MarketOption {
  id: string;
  label: string;
  odds: number;
  staked: number;
  bettors: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  relevance: string;
  image?: string;
  category?: string;
}
