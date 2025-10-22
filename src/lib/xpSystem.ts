// XP System for Dehouse of Oracles

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
  // Oracle Interactions
  VISIT_ORACLE: { action: 'visit_oracle', baseXP: 10, description: 'Visited an oracle' },
  FIRST_ORACLE_VISIT: { action: 'first_oracle_visit', baseXP: 50, description: 'First oracle visit' },
  CHAT_MESSAGE: { action: 'chat_message', baseXP: 5, description: 'Sent a message to an oracle' },
  
  // Predictions
  MAKE_PREDICTION: { action: 'make_prediction', baseXP: 25, description: 'Asked for a prediction' },
  MAKE_PREDICTION_PREMIUM: { action: 'make_prediction_premium', baseXP: 100, description: 'Asked for a prediction (6+/day)' },
  STREAK_BONUS: { action: 'streak_bonus', baseXP: 50, description: 'Daily prediction streak bonus' },
  
  // Daily Activities
  DAILY_LOGIN: { action: 'daily_login', baseXP: 20, description: 'Daily login' },
  COMPLETE_QUEST: { action: 'complete_quest', baseXP: 100, description: 'Completed a quest' },
  DAILY_STREAK_3: { action: 'daily_streak_3', baseXP: 50, description: '3-day streak bonus' },
  DAILY_STREAK_7: { action: 'daily_streak_7', baseXP: 150, description: '7-day streak bonus' },
  DAILY_STREAK_30: { action: 'daily_streak_30', baseXP: 500, description: '30-day streak bonus' },
  
  // Social & Community
  SHARE_PREDICTION: { action: 'share_prediction', baseXP: 15, description: 'Shared a prediction' },
  INVITE_FRIEND: { action: 'invite_friend', baseXP: 200, description: 'Invited a friend' },
  FRIEND_JOINED: { action: 'friend_joined', baseXP: 300, description: 'Friend joined via invite' },
  
  // House Activities
  JOIN_HOUSE: { action: 'join_house', baseXP: 100, description: 'Joined a house' },
  HOUSE_CONTRIBUTION: { action: 'house_contribution', baseXP: 40, description: 'Contributed to house' },
  HOUSE_EVENT: { action: 'house_event', baseXP: 80, description: 'Participated in house event' },
  
  // Milestones
  TEN_PREDICTIONS: { action: 'ten_predictions', baseXP: 150, description: '10 predictions asked' },
  FIFTY_PREDICTIONS: { action: 'fifty_predictions', baseXP: 500, description: '50 predictions asked' },
  HUNDRED_PREDICTIONS: { action: 'hundred_predictions', baseXP: 1000, description: '100 predictions asked' },
  
  // Subscription & Premium
  SUBSCRIBE_MASTER: { action: 'subscribe_master', baseXP: 1000, description: 'Subscribed to Summon Master' },
  
  // Special Events
  ORACLE_BIRTHDAY: { action: 'oracle_birthday', baseXP: 100, description: 'Oracle anniversary bonus' },
  PLATFORM_EVENT: { action: 'platform_event', baseXP: 250, description: 'Special platform event' },
};

// Level progression thresholds
export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xpRequired: 0, title: 'Novice Seeker' },
  { level: 2, xpRequired: 100, title: 'Curious Explorer' },
  { level: 3, xpRequired: 250, title: 'Oracle Apprentice' },
  { level: 4, xpRequired: 500, title: 'Prophecy Student' },
  { level: 5, xpRequired: 1000, title: 'Vision Seeker', perks: ['Unlock special oracle chat themes'] },
  { level: 6, xpRequired: 1750, title: 'Fortune Reader' },
  { level: 7, xpRequired: 2750, title: 'Prediction Adept' },
  { level: 8, xpRequired: 4000, title: 'Oracle Disciple' },
  { level: 9, xpRequired: 5500, title: 'Mystic Scholar' },
  { level: 10, xpRequired: 7500, title: 'Prophecy Master', perks: ['Unlock exclusive oracle tier', 'Special oracle insights'] },
  { level: 11, xpRequired: 10000, title: 'Seer Veteran' },
  { level: 12, xpRequired: 13000, title: 'Vision Keeper' },
  { level: 13, xpRequired: 16500, title: 'Oracle Champion' },
  { level: 14, xpRequired: 20500, title: 'Divination Expert' },
  { level: 15, xpRequired: 25000, title: 'Fortune Sage', perks: ['Unlock custom oracle creation', 'Enhanced oracle responses'] },
  { level: 16, xpRequired: 30000, title: 'Prophecy Elder' },
  { level: 17, xpRequired: 36000, title: 'Master Seer' },
  { level: 18, xpRequired: 43000, title: 'Oracle Archon' },
  { level: 19, xpRequired: 51000, title: 'Legendary Prophet' },
  { level: 20, xpRequired: 60000, title: 'Grand Oracle', perks: ['Unlock all features', '+20% XP & rewards', 'Platform legend status'] },
  { level: 21, xpRequired: 70000, title: 'Transcendent Seer' },
  { level: 22, xpRequired: 82000, title: 'Cosmic Visionary' },
  { level: 23, xpRequired: 95000, title: 'Eternal Oracle' },
  { level: 24, xpRequired: 110000, title: 'Omniscient One' },
  { level: 25, xpRequired: 130000, title: 'Deity of Prophecy', perks: ['Maximum prestige', '+50% all rewards', 'Platform legend status'] },
];

// XP multipliers based on various factors
export const XP_MULTIPLIERS = {
  // Subscription tiers
  FREE: 1.0,
  MASTER: 2.0,
  
  // House bonuses
  HOUSE_MEMBER: 1.1,
  HOUSE_OFFICER: 1.25,
  HOUSE_LEADER: 1.5,
  
  // Streak bonuses
  STREAK_3_DAYS: 1.1,
  STREAK_7_DAYS: 1.2,
  STREAK_14_DAYS: 1.3,
  STREAK_30_DAYS: 1.5,
  
  // Event multipliers
  DOUBLE_XP_EVENT: 2.0,
  WEEKEND_BONUS: 1.25,
  ORACLE_BIRTHDAY: 1.5,
};

/**
 * Calculate XP for an action with multipliers
 */
export function calculateXP(
  actionKey: string,
  multipliers: number[] = []
): number {
  const action = XP_ACTIONS[actionKey];
  if (!action) return 0;
  
  const totalMultiplier = multipliers.length > 0 
    ? multipliers.reduce((acc, mult) => acc * mult, 1)
    : 1;
  
  return Math.floor(action.baseXP * totalMultiplier);
}

/**
 * Get user's current level based on total XP
 */
export function getUserLevel(totalXP: number): number {
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
  const nextLevelThreshold = LEVEL_THRESHOLDS.find(t => t.level === currentLevel + 1);
  return nextLevelThreshold ? nextLevelThreshold.xpRequired : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].xpRequired;
}

/**
 * Get current level's XP threshold
 */
export function getXPForCurrentLevel(currentLevel: number): number {
  const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === currentLevel);
  return currentThreshold ? currentThreshold.xpRequired : 0;
}

/**
 * Calculate progress to next level (0-100)
 */
export function getLevelProgress(totalXP: number, currentLevel: number): number {
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
  multipliers: number[] = []
): XPReward {
  const xpGained = calculateXP(actionKey, multipliers);
  const newTotalXP = currentXP + xpGained;
  const newLevel = getUserLevel(newTotalXP);
  const leveledUp = newLevel > currentLevel;
  
  const totalMultiplier = multipliers.length > 0
    ? multipliers.reduce((acc, mult) => acc * mult, 1)
    : 1;
  
  return {
    xpGained,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    bonusMultiplier: totalMultiplier > 1 ? totalMultiplier : undefined,
    source: XP_ACTIONS[actionKey]?.description || 'Unknown action',
  };
}

/**
 * Get level title
 */
export function getLevelTitle(level: number): string {
  const threshold = LEVEL_THRESHOLDS.find(t => t.level === level);
  return threshold?.title || 'Oracle Seeker';
}

/**
 * Get subscription multiplier
 */
export function getSubscriptionMultiplier(tier: 'free' | 'master'): number {
  switch (tier) {
    case 'master':
      return XP_MULTIPLIERS.MASTER;
    default:
      return XP_MULTIPLIERS.FREE;
  }
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
 * Get house role based on user level
 * Level 20-24: Officer
 * Level 25+: Leader
 * Below 20: Member
 */
export function getHouseRole(level: number): 'member' | 'officer' | 'leader' {
  if (level >= 25) return 'leader';
  if (level >= 20) return 'officer';
  return 'member';
}

/**
 * Get house multiplier based on role
 */
export function getHouseMultiplier(role?: 'member' | 'officer' | 'leader'): number {
  switch (role) {
    case 'leader':
      return XP_MULTIPLIERS.HOUSE_LEADER;
    case 'officer':
      return XP_MULTIPLIERS.HOUSE_OFFICER;
    case 'member':
      return XP_MULTIPLIERS.HOUSE_MEMBER;
    default:
      return 1.0;
  }
}

/**
 * Check if a user can kick another member from the house
 * Includes role-based permissions and daily limit check (5 kicks/day)
 */
export function canKickMember(
  kickerRole?: 'member' | 'officer' | 'leader',
  targetRole?: 'member' | 'officer' | 'leader',
  dailyKicksUsed: number = 0
): boolean {
  if (!kickerRole || !targetRole) return false;
  
  // Check daily limit (5 kicks per day for Officers and Leaders)
  const MAX_DAILY_KICKS = 5;
  if (dailyKicksUsed >= MAX_DAILY_KICKS) {
    return false;
  }
  
  // Leaders can kick officers and members
  if (kickerRole === 'leader') {
    return targetRole === 'officer' || targetRole === 'member';
  }
  
  // Officers can kick regular members only
  if (kickerRole === 'officer') {
    return targetRole === 'member';
  }
  
  // Regular members cannot kick anyone
  return false;
}

/**
 * Get remaining kicks for the day
 */
export function getRemainingKicks(dailyKicksUsed: number = 0): number {
  const MAX_DAILY_KICKS = 5;
  return Math.max(0, MAX_DAILY_KICKS - dailyKicksUsed);
}

/**
 * Check if daily kicks need to be reset
 */
export function shouldResetDailyKicks(lastResetDate?: string): boolean {
  if (!lastResetDate) return true;
  
  const today = new Date().toDateString();
  return lastResetDate !== today;
}

/**
 * Get all active multipliers for a user
 */
export function getUserMultipliers(
  subscriptionTier: 'free' | 'master' = 'free',
  streakDays: number = 0,
  houseRole?: 'member' | 'officer' | 'leader',
  isWeekend: boolean = false
): number[] {
  const multipliers: number[] = [];
  
  // Subscription
  multipliers.push(getSubscriptionMultiplier(subscriptionTier));
  
  // Streak
  const streakMult = getStreakMultiplier(streakDays);
  if (streakMult > 1) multipliers.push(streakMult);
  
  // House membership with role-based multiplier
  if (houseRole) {
    multipliers.push(getHouseMultiplier(houseRole));
  }
  
  // Weekend bonus
  if (isWeekend) multipliers.push(XP_MULTIPLIERS.WEEKEND_BONUS);
  
  return multipliers;
}
