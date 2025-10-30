import { useCallback } from "react";
import { toast } from "sonner@2.0.3";
import {
  awardXP,
  getXPForNextLevel,
  getXPForCurrentLevel,
  getLevelProgress,
  getUserMultipliers,
  type XPReward,
} from "./xpSystem";
import type { User } from "./types";

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
    currentXP: number;
    xpForNextLevel: number;
    xpForCurrentLevel: number;
    progress: number;
    xpNeeded: number;
  };
  trackQuestProgress: (
    questType: "visitAIAgents" | "makePredictions" | "shareContent",
    amount?: number
  ) => void;
}

/**
 * Custom hook for managing XP system
 */
export function useXP(
  user: User | null,
  updateUser: (updates: Partial<User>) => void
): UseXPReturn {
  const awardXPToUser = useCallback(
    (
      actionKey: string,
      options: {
        showToast?: boolean;
        customMultipliers?: number[];
      } = {}
    ): XPReward | null => {
      if (!user) return null;

      const { showToast = true, customMultipliers } = options;

      // Calculate multipliers
      const multipliers =
        customMultipliers ||
        getUserMultipliers(user.subscriptionTier || "free", user.streak);

      // Award XP with prediction count for exponential curve
      const awardOptions =
        actionKey === "MAKE_PREDICTION" ||
        actionKey === "MAKE_PREDICTION_PREMIUM"
          ? { predictionCount: user.totalPredictions }
          : undefined;

      const reward = awardXP(
        user.xp,
        user.level,
        actionKey,
        multipliers,
        awardOptions
      );

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
          toast.success(`🎉 Level Up!`, {
            description: `You reached Level ${reward.newLevel}!`,
            duration: 5000,
          });
        } else {
          const multiplierText =
            reward.bonusMultiplier && reward.bonusMultiplier > 1
              ? ` (${reward.bonusMultiplier}x bonus!)`
              : "";

          toast.success(`+${reward.xpGained} XP${multiplierText}`, {
            description: reward.source,
            duration: 3000,
          });
        }
      }

      return reward;
    },
    [user, updateUser]
  );

  const getLevelInfo = useCallback(() => {
    if (!user) {
      return {
        level: 1,
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
      currentXP: user.xp,
      xpForNextLevel,
      xpForCurrentLevel,
      progress,
      xpNeeded,
    };
  }, [user]);

  const trackQuestProgress = useCallback(
    (
      questType: "visitAIAgents" | "makePredictions" | "shareContent",
      amount: number = 1
    ) => {
      if (!user) return;

      const today = new Date().toDateString();
      const currentProgress = user.dailyQuestProgress || {
        visitAIAgents: 0,
        makePredictions: 0,
        shareContent: 0,
        lastResetDate: today,
      };

      // Reset if it's a new day
      if (currentProgress.lastResetDate !== today) {
        currentProgress.visitAIAgents = 0;
        currentProgress.makePredictions = 0;
        currentProgress.shareContent = 0;
        currentProgress.lastResetDate = today;
      }

      // Update the specific quest progress
      const updatedProgress = {
        ...currentProgress,
        [questType]: currentProgress[questType] + amount,
      };

      updateUser({ dailyQuestProgress: updatedProgress });
    },
    [user, updateUser]
  );

  return {
    awardXPToUser,
    getLevelInfo,
    trackQuestProgress,
  };
}
