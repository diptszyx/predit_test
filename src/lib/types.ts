// Core type definitions for Dehouse of Oracles

export interface Oracle {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  category: string;
  accuracy: string;
  likes: string;
  specialty: string;
  tags: string[];
  avatar: string;
  bgColor: string;
  level?: number;
  xp?: number;
  tier?: 'free' | 'premium' | 'elite';
  house?: string;
  consultSessions?: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  house?: string;
  houseRole?: 'member' | 'officer' | 'leader'; // House role based on level (20-24: officer, 25+: leader)
  houseSwitchesUsed?: number; // Track number of house switches (max 3 before Nov 20)
  dailyKicksUsed?: number; // Track member kicks used today (max 5/day for Officers & Leaders)
  dailyKicksResetDate?: string; // Date when daily kicks were last reset
  streak: number;
  totalPredictions: number;
  accurateRate: number;
  oraclesVisited: number;
  achievements: string[];
  walletAddress?: string;
  walletType?: 'metamask' | 'phantom' | 'backpack';
  socialProvider?: 'google' | 'apple'; // Social login provider
  email?: string; // User's email address for account recovery
  phone?: string; // User's phone number for 2FA and SMS alerts
  subscriptionTier?: 'free' | 'master';
  visitedOracles?: string[]; // Track which oracles have been visited
  dailyPredictionsUsed?: number; // Track predictions used today
  dailyPredictionsResetDate?: string; // Date when daily predictions were last reset
  dailyLinesUsed?: number; // Track text lines sent today (free tier: 100/day limit)
  dailyLinesResetDate?: string; // Date when daily lines were last reset
  referralCode?: string; // User's unique referral code
  referredBy?: string; // Referral code of user who invited them
  referredFriends?: Array<{
    username: string;
    joinedAt: string;
    xpEarned: number;
    avatar?: string;
  }>; // List of friends referred by this user
}

export interface Prediction {
  id: string;
  oracleId: string;
  userId: string;
  question: string;
  prediction: string;
  confidence: number;
  outcome?: 'correct' | 'incorrect' | 'pending';
  stake?: number;
  reward?: number;
  timestamp: Date;
  category: string;
}

export interface House {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  memberCount: number;
  totalXP: number;
  rank: number;
  quest?: {
    title: string;
    description: string;
    reward: string;
  };
}

export interface HouseMember {
  walletAddress: string;
  username: string;
  xpEarned: number;
  currentMultiplier: number;
  rank: number;
  avatar?: string;
  level?: number;
  role?: 'member' | 'officer' | 'leader'; // Automatically assigned based on level
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
  status: 'active' | 'closed' | 'resolved';
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
