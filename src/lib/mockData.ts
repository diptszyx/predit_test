import { Oracle, User, House, Quest, SubscriptionTier, PredictionMarket, MarketOption, HouseMember } from './types';
import { getHouseRole } from './xpSystem';

export const mockUser: User = {
  id: 'user-1',
  username: 'OracleSeeker',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
  level: 12,
  xp: 13450,
  house: 'crypto-kings',
  houseSwitchesUsed: 0, // Tracks how many times user has switched houses
  dailyKicksUsed: 0, // Tracks member kicks used today
  dailyKicksResetDate: new Date().toDateString(), // Date when daily kicks were last reset
  streak: 7,
  totalPredictions: 156,
  accurateRate: 73,
  oraclesVisited: 12,
  achievements: ['7-day-streak', 'first-prediction', '100-predictions'],
  subscriptionTier: 'master',
  visitedOracles: ['politics', 'crypto', 'stocks', 'fortune', 'tech', 'sports', 'entertainment', 'gaming', 'memes', 'weather', 'food', 'dating'],
  dailyPredictionsUsed: 0,
  dailyPredictionsResetDate: new Date().toDateString(),
  dailyLinesUsed: 0,
  dailyLinesResetDate: new Date().toDateString(),
  referralCode: 'ORACLESEEKER-A7F2',
  referredFriends: [
    {
      username: 'CryptoWizard',
      joinedAt: '2025-10-15T10:30:00',
      xpEarned: 500,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80',
    },
    {
      username: 'ProphecyMaster',
      joinedAt: '2025-10-18T14:20:00',
      xpEarned: 500,
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80',
    },
    {
      username: 'FortuneReader',
      joinedAt: '2025-10-20T09:15:00',
      xpEarned: 500,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    },
  ],
};

export const houses: House[] = [
  {
    id: 'crypto-kings',
    name: 'Crypto Kings',
    icon: '₿',
    color: 'from-orange-600 to-yellow-600',
    description: 'Masters of blockchain prophecy and diamond hands',
    memberCount: 12450,
    totalXP: 8500000,
    rank: 1,
    quest: {
      title: 'Crypto Oracle Marathon',
      description: 'Consult the Crypto Oracle 15 times this week',
      reward: '500 XP + Crypto Master Badge',
    },
  },
  {
    id: 'political-prophets',
    name: 'Political Prophets',
    icon: '🎭',
    color: 'from-blue-600 to-indigo-600',
    description: 'Experts in predicting chaos and scandals',
    memberCount: 9830,
    totalXP: 6200000,
    rank: 2,
    quest: {
      title: 'Political Pulse',
      description: 'Ask the Political Prophet 12 questions and share 2 predictions',
      reward: '450 XP + Political Oracle Badge',
    },
  },
  {
    id: 'sports-savants',
    name: 'Sports Savants',
    icon: '🏆',
    color: 'from-red-600 to-orange-600',
    description: 'Champions of game day predictions',
    memberCount: 11200,
    totalXP: 7100000,
    rank: 3,
    quest: {
      title: 'Championship Series',
      description: 'Consult the Sports Oracle 20 times and share 3 game predictions',
      reward: '550 XP + Sports Legend Badge',
    },
  },
  {
    id: 'mystic-seers',
    name: 'Mystic Seers',
    icon: '🔮',
    color: 'from-purple-600 to-fuchsia-600',
    description: 'Keepers of ancient wisdom and cosmic vibes',
    memberCount: 8100,
    totalXP: 4800000,
    rank: 4,
    quest: {
      title: 'Cosmic Alignment',
      description: 'Visit Fortune & Mysticism oracle 10 times and post 3 house comments',
      reward: '400 XP + Mystic Vision Badge',
    },
  },
  {
    id: 'phoenix-rising',
    name: 'Phoenix Rising',
    icon: '🔥',
    color: 'from-red-600 to-orange-600',
    description: 'Born from the ashes of failed predictions, now unstoppable',
    memberCount: 7834,
    totalXP: 4512000,
    rank: 5,
    quest: {
      title: 'Rise from Defeat',
      description: 'Maintain a 5-day login streak and visit 8 different oracles',
      reward: '600 XP + Phoenix Resilience Badge',
    },
  },
  {
    id: 'lunar-legends',
    name: 'Lunar Legends',
    icon: '🌙',
    color: 'from-indigo-600 to-purple-600',
    description: 'Night owls who predict best when the moon is full',
    memberCount: 7421,
    totalXP: 4287400,
    rank: 6,
    quest: {
      title: 'Midnight Oracle',
      description: 'Ask 8 predictions between 10 PM - 4 AM and share 1 late-night insight',
      reward: '420 XP + Night Owl Badge',
    },
  },
  {
    id: 'diamond-minds',
    name: 'Diamond Minds',
    icon: '💎',
    color: 'from-cyan-600 to-blue-600',
    description: 'Unbreakable conviction, crystalline clarity, HODL mentality',
    memberCount: 6992,
    totalXP: 4034700,
    rank: 7,
    quest: {
      title: 'Diamond Hands Challenge',
      description: 'Maintain a 7-day login streak and ask 25 total predictions',
      reward: '650 XP + Diamond Conviction Badge',
    },
  },
  {
    id: 'meme-lords',
    name: 'Meme Lords',
    icon: '🐸',
    color: 'from-lime-600 to-green-600',
    description: 'Predicting the unpredictable through the power of memes',
    memberCount: 6754,
    totalXP: 3906300,
    rank: 8,
    quest: {
      title: 'Meme Coin Madness',
      description: 'Visit Meme Oracle 15 times, share 3 predictions, and recruit 1 friend',
      reward: '700 XP + Meme Prophet Badge',
    },
  },
  {
    id: 'quantum-questers',
    name: 'Quantum Questers',
    icon: '⚛️',
    color: 'from-violet-600 to-fuchsia-600',
    description: 'Existing in superposition until predictions collapse into reality',
    memberCount: 6323,
    totalXP: 3657200,
    rank: 9,
    quest: {
      title: 'Quantum Entanglement',
      description: 'Visit 6 different oracles in a single day and ask 10 total predictions',
      reward: '480 XP + Quantum Mind Badge',
    },
  },
  {
    id: 'alpha-hunters',
    name: 'Alpha Hunters',
    icon: '🎯',
    color: 'from-rose-600 to-pink-600',
    description: 'Always first to spot the next big trend before it goes mainstream',
    memberCount: 5991,
    totalXP: 3464100,
    rank: 10,
    quest: {
      title: 'Early Bird Alpha',
      description: 'Post 5 house comments, share 4 predictions, and visit all 18 oracles',
      reward: '750 XP + Alpha Hunter Badge',
    },
  },
];

export const dailyQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Morning Market Check',
    description: 'Consult any oracle about crypto market trends',
    category: 'crypto',
    reward: 50,
    xpReward: 100,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    progress: 0,
    maxProgress: 1,
    completed: false,
  },
  {
    id: 'quest-2',
    title: 'Political Pulse',
    description: 'Get 3 predictions from the Political Prophet',
    category: 'politics',
    reward: 100,
    xpReward: 200,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    progress: 1,
    maxProgress: 3,
    completed: false,
  },
  {
    id: 'quest-3',
    title: 'Social Sharer',
    description: 'Share a prediction on social media',
    category: 'social',
    reward: 25,
    xpReward: 50,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    progress: 0,
    maxProgress: 1,
    completed: false,
  },
];

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Summoner',
    price: 0,
    features: [
      '1.0x XP (standard rate)',
      '5 predictions per day',
      '100 text lines per day',
      'Access to all oracles',
      'Community access',
      'Join houses and earn XP',
      'Daily quests and streaks',
    ],
    color: 'from-gray-600 to-slate-600',
  },
  {
    id: 'master',
    name: 'Summon Master',
    price: 9.99,
    originalPrice: 19.99,
    features: [
      '2.0x XP multiplier (double XP!)',
      'Unlimited predictions per day',
      'Unlimited text messaging',
      'All premium features unlocked',
      'Priority support',
      'Early feature access',
      'Contribute more XP to your House',
      'Faster level progression',
      'Unlock legendary status faster',
    ],
    color: 'from-purple-600 to-pink-600',
    popular: true,
  },
];

export const predictionMarkets: PredictionMarket[] = [
  {
    id: 'market-1',
    title: 'Bitcoin to hit $100K by end of 2026?',
    description: 'Will Bitcoin reach $100,000 USD by December 31, 2026?',
    category: 'crypto',
    endDate: new Date('2026-12-31'),
    totalStaked: 45000,
    options: [
      { id: 'yes', label: 'Yes', odds: 1.65, staked: 28000, bettors: 342 },
      { id: 'no', label: 'No', odds: 2.35, staked: 17000, bettors: 198 },
    ],
    status: 'active',
  },
  {
    id: 'market-2',
    title: '2026 Super Bowl Winner',
    description: 'Which team will win Super Bowl LXI in 2027?',
    category: 'sports',
    endDate: new Date('2027-02-07'),
    totalStaked: 62000,
    options: [
      { id: 'chiefs', label: 'Kansas City Chiefs', odds: 4.5, staked: 18000, bettors: 245 },
      { id: '49ers', label: 'San Francisco 49ers', odds: 5.2, staked: 15000, bettors: 189 },
      { id: 'bills', label: 'Buffalo Bills', odds: 6.8, staked: 12000, bettors: 156 },
      { id: 'other', label: 'Other Team', odds: 2.1, staked: 17000, bettors: 412 },
    ],
    status: 'active',
  },
  {
    id: 'market-3',
    title: 'AI Market Cap to exceed $500B in 2026?',
    description: 'Will the global AI market reach $500 billion by end of 2026?',
    category: 'tech',
    endDate: new Date('2026-12-31'),
    totalStaked: 38000,
    options: [
      { id: 'yes', label: 'Yes', odds: 1.85, staked: 22000, bettors: 267 },
      { id: 'no', label: 'No', odds: 2.15, staked: 16000, bettors: 145 },
    ],
    status: 'active',
  },
];

export const platformStats = {
  totalUsers: 123789, // Updated to reflect all 20 houses
  totalConsultSessions: 339500, // Sum of all oracle consult sessions
  totalPredictions: 1245678,
  accuracy: 84,
  activeOracles: 8, // Updated to reflect new oracles
  activeUsers: 142000, // Active platform users
  totalHouses: 6, // Total houses available
  totalMarkets: 127, // Total prediction markets on platform
};

// Generate mock house members for each house
const generateHouseMembers = (houseId: string, count: number, baseXP: number): HouseMember[] => {
  const members: HouseMember[] = [];
  const usernames = [
    'CryptoWhale', 'DiamondHands', 'MoonSeeker', 'OracleKing', 'DegenLord',
    'AlphaHunter', 'ChartMaster', 'TokenSniper', 'ChainExplorer', 'Web3Warrior',
    'BlockchainBoss', 'DeFiDegen', 'MetaverseExplorer', 'SmartTrader', 'HODLer420',
    'SatoshiFan', 'EthMaxi', 'AltcoinKing', 'YieldFarmer', 'StakingPro',
    'GasOptimizer', 'LiquidityProvider', 'DAOVoter', 'BridgeMaster', 'L2Enthusiast',
  ];

  for (let i = 0; i < Math.min(count, 25); i++) {
    const randomXP = baseXP * (0.5 + Math.random() * 1.5);
    const level = Math.floor(randomXP / 1000) + 5;
    const role = getHouseRole(level); // Automatically assign role based on level
    const multiplier = 1.1 + (Math.random() * 0.9); // 1.1x to 2.0x
    
    members.push({
      walletAddress: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      username: `${usernames[i % usernames.length]}${Math.floor(Math.random() * 1000)}`,
      xpEarned: Math.floor(randomXP),
      currentMultiplier: parseFloat(multiplier.toFixed(2)),
      rank: i + 1,
      level,
      role,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + i}?w=100&q=80`,
    });
  }

  // Sort by XP earned (descending)
  return members.sort((a, b) => b.xpEarned - a.xpEarned).map((member, index) => ({
    ...member,
    rank: index + 1,
  }));
};

// House members data - showing top 25 members per house
export const houseMembers: Record<string, HouseMember[]> = {
  'crypto-kings': generateHouseMembers('crypto-kings', 25, 682000),
  'political-prophets': generateHouseMembers('political-prophets', 25, 631000),
  'sports-savants': generateHouseMembers('sports-savants', 25, 634000),
  'mystic-seers': generateHouseMembers('mystic-seers', 25, 593000),
  'phoenix-rising': generateHouseMembers('phoenix-rising', 25, 576000),
  'lunar-legends': generateHouseMembers('lunar-legends', 25, 578000),
  'diamond-minds': generateHouseMembers('diamond-minds', 25, 577000),
  'meme-lords': generateHouseMembers('meme-lords', 25, 578000),
  'quantum-questers': generateHouseMembers('quantum-questers', 25, 578000),
  'alpha-hunters': generateHouseMembers('alpha-hunters', 25, 578000),
  'whale-watchers': generateHouseMembers('whale-watchers', 25, 578000),
  'chaos-collective': generateHouseMembers('chaos-collective', 25, 578000),
  'sage-syndicate': generateHouseMembers('sage-syndicate', 25, 578000),
  'robot-revolutionaries': generateHouseMembers('robot-revolutionaries', 25, 578000),
  'cosmic-cowboys': generateHouseMembers('cosmic-cowboys', 25, 578000),
  'neon-ninjas': generateHouseMembers('neon-ninjas', 25, 578000),
  'storm-chasers': generateHouseMembers('storm-chasers', 25, 578000),
  'void-walkers': generateHouseMembers('void-walkers', 25, 578000),
  'galaxy-guardians': generateHouseMembers('galaxy-guardians', 25, 578000),
  'degen-dynasty': generateHouseMembers('degen-dynasty', 25, 578000),
};
