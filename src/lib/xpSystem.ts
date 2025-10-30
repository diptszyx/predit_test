// XP System for Dehouse of Predictions

export interface XPAction {
  action: string;
  baseXP: number;
  description: string;
}

export interface LevelThreshold {
  level: number;
  xpRequired: number;
  title: string;
  perks?: string[];
}

export interface XPReward {
  xpGained: number;
  leveledUp: boolean;
  newLevel?: number;
  bonusMultiplier?: number;
  source: string;
}

// XP rewards for different actions
export const XP_ACTIONS: Record<string, XPAction> = {
  // Predictions
  MAKE_PREDICTION: {
    action: "make_prediction",
    baseXP: 15,
    description: "Asked for a prediction",
  },
  MAKE_PREDICTION_PREMIUM: {
    action: "make_prediction_premium",
    baseXP: 30,
    description: "Asked for a prediction (6+/day)",
  },
  STREAK_BONUS: {
    action: "streak_bonus",
    baseXP: 100,
    description: "Daily prediction streak bonus",
  },

  // Daily Activities
  COMPLETE_QUEST: {
    action: "complete_quest",
    baseXP: 150,
    description: "Completed a quest",
  },
  DAILY_STREAK_3: {
    action: "daily_streak_3",
    baseXP: 100,
    description: "3-day streak bonus",
  },
  DAILY_STREAK_7: {
    action: "daily_streak_7",
    baseXP: 250,
    description: "7-day streak bonus",
  },
  DAILY_STREAK_30: {
    action: "daily_streak_30",
    baseXP: 750,
    description: "30-day streak bonus",
  },

  // Milestones
  TEN_PREDICTIONS: {
    action: "ten_predictions",
    baseXP: 250,
    description: "10 predictions asked",
  },
  FIFTY_PREDICTIONS: {
    action: "fifty_predictions",
    baseXP: 750,
    description: "50 predictions asked",
  },
  HUNDRED_PREDICTIONS: {
    action: "hundred_predictions",
    baseXP: 1500,
    description: "100 predictions asked",
  },

  // Subscription & Premium
  SUBSCRIBE_MASTER: {
    action: "subscribe_master",
    baseXP: 1500,
    description: "Subscribed to Pro",
  },

  // Special Events
  AI_AGENT_BIRTHDAY: {
    action: "ai_agent_birthday",
    baseXP: 150,
    description: "AI agent anniversary bonus",
  },
  PLATFORM_EVENT: {
    action: "platform_event",
    baseXP: 400,
    description: "Special platform event",
  },
};

// Level progression thresholds
export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xpRequired: 0, title: "Novice Seeker" },
  { level: 2, xpRequired: 100, title: "Curious Explorer" },
  { level: 3, xpRequired: 300, title: "Prediction Apprentice" },
  { level: 4, xpRequired: 600, title: "Prophecy Student" },
  {
    level: 5,
    xpRequired: 1200,
    title: "Vision Seeker",
    perks: ["Unlock special AI agent chat themes"],
  },
  { level: 6, xpRequired: 2000, title: "Fortune Reader" },
  { level: 7, xpRequired: 3000, title: "Prediction Adept" },
  { level: 8, xpRequired: 4200, title: "AI Agent Disciple" },
  { level: 9, xpRequired: 5600, title: "Mystic Scholar" },
  {
    level: 10,
    xpRequired: 7500,
    title: "Prophecy Master",
    perks: ["Unlock exclusive AI agent tier", "Special AI agent insights"],
  },
  { level: 11, xpRequired: 10000, title: "Seer Veteran" },
  { level: 12, xpRequired: 13000, title: "Vision Keeper" },
  { level: 13, xpRequired: 16500, title: "Prediction Champion" },
  { level: 14, xpRequired: 20500, title: "Divination Expert" },
  {
    level: 15,
    xpRequired: 25000,
    title: "Fortune Sage",
    perks: ["Unlock custom AI agent creation", "Enhanced AI agent responses"],
  },
  { level: 16, xpRequired: 30000, title: "Prophecy Elder" },
  { level: 17, xpRequired: 36000, title: "Master Seer" },
  { level: 18, xpRequired: 43000, title: "AI Agent Archon" },
  { level: 19, xpRequired: 51000, title: "Legendary Prophet" },
  {
    level: 20,
    xpRequired: 60000,
    title: "Grand Predictor",
    perks: [
      "Unlock all features",
      "+20% XP & rewards",
      "Platform legend status",
    ],
  },
  { level: 21, xpRequired: 70000, title: "Transcendent Seer" },
  { level: 22, xpRequired: 80000, title: "Cosmic Visionary" },
  { level: 23, xpRequired: 90000, title: "Eternal Predictor" },
  { level: 24, xpRequired: 100000, title: "Omniscient One" },
  {
    level: 25,
    xpRequired: 110000,
    title: "Deity of Prophecy",
    perks: ["Maximum prestige", "+50% all rewards", "Platform legend status"],
  },
];

// XP multipliers
export const XP_MULTIPLIERS = {
  FREE: 1.0,
  MASTER: 2.0,
  STREAK_3_DAYS: 1.1,
  STREAK_7_DAYS: 1.2,
  STREAK_14_DAYS: 1.3,
  STREAK_30_DAYS: 1.5,
  DOUBLE_XP_EVENT: 2.0,
  AI_AGENT_BIRTHDAY: 1.5,
};

/**
 * Calculate XP for predictions with relatively flat exponential curve
 * Formula: baseXP * (1 + log₁₀(count + 1) * 0.5)
 */
export function calculatePredictionXP(
  totalPredictionCount: number,
  baseXP: number = 15
): number {
  if (totalPredictionCount <= 0) return baseXP;

  const scaleFactor = 0.5;
  const bonus = Math.log10(totalPredictionCount + 1) * scaleFactor;
  const xp = baseXP * (1 + bonus);

  return Math.floor(xp);
}

/**
 * Calculate XP for an action with multipliers
 */
export function calculateXP(
  actionKey: string,
  multipliers: number[] = []
): number {
  const action = XP_ACTIONS[actionKey];
  if (!action) return 0;

  const totalMultiplier =
    multipliers.length > 0
      ? multipliers.reduce((acc, mult) => acc * mult, 1)
      : 1;

  return Math.floor(action.baseXP * totalMultiplier);
}

/**
 * Get user's current level based on total predictions
 * Level = floor(totalPredictions / 100) + 1
 */
export function getUserLevel(totalPredictions: number): number {
  return Math.floor(totalPredictions / 100) + 1;
}

/**
 * Get user's current level based on total XP (deprecated)
 */
export function getUserLevelFromXP(totalXP: number): number {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP >= threshold.xpRequired) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  const nextLevelThreshold = LEVEL_THRESHOLDS.find(
    (t) => t.level === currentLevel + 1
  );
  return nextLevelThreshold
    ? nextLevelThreshold.xpRequired
    : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].xpRequired;
}

/**
 * Get current level's XP threshold
 */
export function getXPForCurrentLevel(currentLevel: number): number {
  const currentThreshold = LEVEL_THRESHOLDS.find(
    (t) => t.level === currentLevel
  );
  return currentThreshold ? currentThreshold.xpRequired : 0;
}

/**
 * Calculate progress to next level (0-100)
 */
export function getLevelProgress(
  totalXP: number,
  currentLevel: number
): number {
  const currentLevelXP = getXPForCurrentLevel(currentLevel);
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;

  return Math.min(100, Math.floor((xpIntoLevel / xpNeededForLevel) * 100));
}

/**
 * Award XP and check for level up
 */
export function awardXP(
  currentXP: number,
  currentLevel: number,
  actionKey: string,
  multipliers: number[] = [],
  options?: {
    predictionCount?: number;
  }
): XPReward {
  let xpGained: number;

  // Special handling for predictions with exponential curve
  if (
    actionKey === "MAKE_PREDICTION" ||
    actionKey === "MAKE_PREDICTION_PREMIUM"
  ) {
    const predictionCount = options?.predictionCount || 0;
    const baseXP = XP_ACTIONS[actionKey]?.baseXP || 15;
    const curveXP = calculatePredictionXP(predictionCount, baseXP);

    const totalMultiplier =
      multipliers.length > 0
        ? multipliers.reduce((acc, mult) => acc * mult, 1)
        : 1;
    xpGained = Math.floor(curveXP * totalMultiplier);
  } else {
    xpGained = calculateXP(actionKey, multipliers);
  }

  const newTotalXP = currentXP + xpGained;
  const newLevel = getUserLevel(newTotalXP);
  const leveledUp = newLevel > currentLevel;

  const totalMultiplier =
    multipliers.length > 0
      ? multipliers.reduce((acc, mult) => acc * mult, 1)
      : 1;

  return {
    xpGained,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    bonusMultiplier: totalMultiplier > 1 ? totalMultiplier : undefined,
    source: XP_ACTIONS[actionKey]?.description || "Unknown action",
  };
}

/**
 * Get subscription multiplier
 */
export function getSubscriptionMultiplier(tier: "free" | "master"): number {
  return tier === "master" ? XP_MULTIPLIERS.MASTER : XP_MULTIPLIERS.FREE;
}

/**
 * Get streak multiplier
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return XP_MULTIPLIERS.STREAK_30_DAYS;
  if (streakDays >= 14) return XP_MULTIPLIERS.STREAK_14_DAYS;
  if (streakDays >= 7) return XP_MULTIPLIERS.STREAK_7_DAYS;
  if (streakDays >= 3) return XP_MULTIPLIERS.STREAK_3_DAYS;
  return 1.0;
}

/**
 * Get all active multipliers for a user
 */
export function getUserMultipliers(
  subscriptionTier: "free" | "master" = "free",
  streakDays: number = 0
): number[] {
  const multipliers: number[] = [];

  multipliers.push(getSubscriptionMultiplier(subscriptionTier));

  const streakMult = getStreakMultiplier(streakDays);
  if (streakMult > 1) multipliers.push(streakMult);

  return multipliers;
}
