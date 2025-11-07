import type { User, Quest, SubscriptionTier, PredictionMarket } from "./types";

export const mockUser: User = {
  id: "user-1",
  username: "PredictionSeeker",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
  walletAddress: "0xABC123...a7f2",
  level: 12,
  xp: 13450,
  streakDays: 7,
  totalPredictions: 156,
  accurateRate: 73,
  aiAgentsVisited: 12,
  subscriptionTier: "master",
  visitedAIAgents: [
    "politics",
    "crypto",
    "stocks",
    "fortune",
    "tech",
    "sports",
    "entertainment",
    "gaming",
    "memes",
    "weather",
    "food",
    "dating",
  ],
  dailyPredictionsUsed: 0,
  dailyPredictionsResetDate: new Date().toDateString(),
  dailyLinesUsed: 0,
  dailyLinesResetDate: new Date().toDateString(),
  referralCode: "PREDICTIONSEEKER-A7F2",
  dailyQuestProgress: {
    visitAIAgents: 5,
    makePredictions: 3,
    shareContent: 1,
    lastResetDate: new Date().toDateString(),
  },
  referredFriends: [
    {
      username: "CryptoWizard",
      joinedAt: "2025-10-15T10:30:00",
      xpEarned: 500,
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80",
    },
    {
      username: "ProphecyMaster",
      joinedAt: "2025-10-18T14:20:00",
      xpEarned: 500,
      avatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80",
    },
    {
      username: "FortuneReader",
      joinedAt: "2025-10-20T09:15:00",
      xpEarned: 500,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    },
  ],
  isPro: true,
};

export const dailyQuests: Quest[] = [
  {
    id: "quest-1",
    title: "Morning Market Check",
    description: "Consult any AI agent about crypto market trends",
    category: "crypto",
    reward: 75,
    xpReward: 150,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    progress: 0,
    maxProgress: 1,
    completed: false,
  },
  {
    id: "quest-2",
    title: "Political Pulse",
    description: "Get 3 predictions from the Political AI Agent",
    category: "politics",
    reward: 150,
    xpReward: 300,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    progress: 1,
    maxProgress: 3,
    completed: false,
  },
  {
    id: "quest-3",
    title: "Social Sharer",
    description: "Share a prediction on social media",
    category: "social",
    reward: 40,
    xpReward: 75,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    progress: 0,
    maxProgress: 1,
    completed: false,
  },
];

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Basic",
    price: 0,
    features: [
      "5 total free predictions",
      "Access to all AI agents",
      "Basic conversation features",
      "Community access",
    ],
    color: "from-gray-600 to-slate-600",
  },
  {
    id: "master",
    name: "Pro",
    price: 4.99,
    originalPrice: 19.99,
    features: [
      "Unlimited predictions",
      "Unlimited conversations",
      "2x XP multiplier",
      "Priority AI responses",
      "Advanced features",
      "Early access to new agents",
    ],
    color: "from-blue-600 to-cyan-600",
    popular: true,
  },
];

export const predictionMarkets: PredictionMarket[] = [
  {
    id: "market-1",
    title: "Bitcoin to hit $100K by end of 2026?",
    description: "Will Bitcoin reach $100,000 USD by December 31, 2026?",
    category: "crypto",
    endDate: new Date("2026-12-31"),
    totalStaked: 45000,
    options: [
      { id: "yes", label: "Yes", odds: 1.65, staked: 28000, bettors: 342 },
      { id: "no", label: "No", odds: 2.35, staked: 17000, bettors: 198 },
    ],
    status: "active",
  },
  {
    id: "market-2",
    title: "2026 Super Bowl Winner",
    description: "Which team will win Super Bowl LXI in 2027?",
    category: "sports",
    endDate: new Date("2027-02-07"),
    totalStaked: 62000,
    options: [
      {
        id: "chiefs",
        label: "Kansas City Chiefs",
        odds: 4.5,
        staked: 18000,
        bettors: 245,
      },
      {
        id: "49ers",
        label: "San Francisco 49ers",
        odds: 5.2,
        staked: 15000,
        bettors: 189,
      },
      {
        id: "bills",
        label: "Buffalo Bills",
        odds: 6.8,
        staked: 12000,
        bettors: 156,
      },
      {
        id: "other",
        label: "Other Team",
        odds: 2.1,
        staked: 17000,
        bettors: 412,
      },
    ],
    status: "active",
  },
  {
    id: "market-3",
    title: "AI Market Cap to exceed $500B in 2026?",
    description: "Will the global AI market reach $500 billion by end of 2026?",
    category: "tech",
    endDate: new Date("2026-12-31"),
    totalStaked: 38000,
    options: [
      { id: "yes", label: "Yes", odds: 1.85, staked: 22000, bettors: 267 },
      { id: "no", label: "No", odds: 2.15, staked: 16000, bettors: 145 },
    ],
    status: "active",
  },
];

export const platformStats = {
  totalUsers: 123789,
  totalConsultSessions: 339500,
  totalPredictions: 1245678,
  accuracy: 84,
  activeAIAgents: 18,
  activeUsers: 142000,
  totalMarkets: 127,
};
