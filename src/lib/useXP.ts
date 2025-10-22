import { useState, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { 
  awardXP, 
  getUserLevel, 
  getXPForNextLevel,
  getXPForCurrentLevel,
  getLevelProgress,
  getLevelTitle,
  getUserMultipliers,
  XPReward 
} from './xpSystem';
import { User } from './types';

interface UseXPReturn {
  awardXPToUser: (
    actionKey: string,
    options?: {
      showToast?: boolean;
      customMultipliers?: number[];
    }
  ) => XPReward | null;
  getLevelInfo: () => {
    level: number;
    title: string;
    currentXP: number;
    xpForNextLevel: number;
    xpForCurrentLevel: number;
    progress: number;
    xpNeeded: number;
  };
}

/**
 * Custom hook for managing XP system
 */
export function useXP(
  user: User | null,
  updateUser: (updates: Partial<User>) => void
): UseXPReturn {
  
  const awardXPToUser = useCallback((
    actionKey: string,
    options: {
      showToast?: boolean;
      customMultipliers?: number[];
    } = {}
  ): XPReward | null => {
    if (!user) return null;
    
    const { showToast = true, customMultipliers } = options;
    
    // Calculate multipliers
    const multipliers = customMultipliers || getUserMultipliers(
      user.subscriptionTier || 'free',
      user.streak,
      !!user.house,
      isWeekend()
    );
    
    // Award XP
    const reward = awardXP(user.xp, user.level, actionKey, multipliers);
    
    // Update user
    const newXP = user.xp + reward.xpGained;
    const updates: Partial<User> = {
      xp: newXP,
    };
    
    if (reward.leveledUp && reward.newLevel) {
      updates.level = reward.newLevel;
    }
    
    updateUser(updates);
    
    // Show toast notification
    if (showToast) {
      if (reward.leveledUp && reward.newLevel) {
        // Level up toast
        toast.success(`🎉 Level Up!`, {
          description: `You reached Level ${reward.newLevel}: ${getLevelTitle(reward.newLevel)}`,
          duration: 5000,
        });
      } else {
        // XP gained toast
        const multiplierText = reward.bonusMultiplier && reward.bonusMultiplier > 1
          ? ` (${reward.bonusMultiplier}x bonus!)`
          : '';
        
        toast.success(`+${reward.xpGained} XP${multiplierText}`, {
          description: reward.source,
          duration: 3000,
        });
      }
    }
    
    return reward;
  }, [user, updateUser]);
  
  const getLevelInfo = useCallback(() => {
    if (!user) {
      return {
        level: 1,
        title: 'Novice Seeker',
        currentXP: 0,
        xpForNextLevel: 100,
        xpForCurrentLevel: 0,
        progress: 0,
        xpNeeded: 100,
      };
    }
    
    const xpForNextLevel = getXPForNextLevel(user.level);
    const xpForCurrentLevel = getXPForCurrentLevel(user.level);
    const progress = getLevelProgress(user.xp, user.level);
    const xpNeeded = xpForNextLevel - user.xp;
    
    return {
      level: user.level,
      title: getLevelTitle(user.level),
      currentXP: user.xp,
      xpForNextLevel,
      xpForCurrentLevel,
      progress,
      xpNeeded,
    };
  }, [user]);
  
  return {
    awardXPToUser,
    getLevelInfo,
  };
}

/**
 * Check if today is weekend
 */
function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}
