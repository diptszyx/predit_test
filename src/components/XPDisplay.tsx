import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Star, TrendingUp, Zap } from "lucide-react";
import { getLevelTitle, getXPForNextLevel, getXPForCurrentLevel, getLevelProgress, getUserMultipliers, getSubscriptionMultiplier, getStreakMultiplier } from "../lib/xpSystem";
import { User } from "../lib/types";

interface XPDisplayProps {
  user: User;
  compact?: boolean;
  showMultipliers?: boolean;
}

export function XPDisplay({ user, compact = false, showMultipliers = false }: XPDisplayProps) {
  const levelTitle = getLevelTitle(user.level);
  const xpForCurrentLevel = getXPForCurrentLevel(user.level);
  const xpForNextLevel = getXPForNextLevel(user.level);
  const xpProgress = getLevelProgress(user.xp, user.level);
  const xpIntoLevel = user.xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

  // Calculate multipliers
  const subscriptionMult = getSubscriptionMultiplier(user.subscriptionTier || 'free');
  const streakMult = getStreakMultiplier(user.streak);
  const houseMult = user.house ? 1.1 : 1.0;
  const totalMult = subscriptionMult * streakMult * houseMult;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
          <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
          <span className="text-sm">Level {user.level}</span>
        </div>
        <div className="flex-1 max-w-[200px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              {xpIntoLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
            </span>
            <span className="text-xs text-purple-400">{xpProgress}%</span>
          </div>
          <Progress value={xpProgress} className="h-1.5" />
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Level Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h3>Level {user.level}</h3>
                  <p className="text-sm text-muted-foreground">{levelTitle}</p>
                </div>
              </div>
            </div>
            {totalMult > 1 && showMultipliers && (
              <Badge variant="outline" className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                {totalMult.toFixed(1)}x XP
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {xpIntoLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
              </p>
              <Badge variant="outline" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                {xpProgress}%
              </Badge>
            </div>
            <Progress value={xpProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {(xpForNextLevel - user.xp).toLocaleString()} XP to Level {user.level + 1}
            </p>
          </div>

          {/* Active Multipliers */}
          {showMultipliers && totalMult > 1 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Active Bonuses:</p>
              <div className="flex flex-wrap gap-2">
                {subscriptionMult > 1 && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Summon Master {subscriptionMult}x
                  </Badge>
                )}
                {streakMult > 1 && (
                  <Badge variant="outline" className="text-xs">
                    🔥 {user.streak}-day streak {streakMult}x
                  </Badge>
                )}
                {houseMult > 1 && (
                  <Badge variant="outline" className="text-xs">
                    🏛️ House bonus {houseMult}x
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
