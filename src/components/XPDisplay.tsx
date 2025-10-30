import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Star, TrendingUp, Zap, Home, Crown, Award } from "lucide-react";
import { getXPForNextLevel, getXPForCurrentLevel, getLevelProgress, getHouseMultiplier, getSubscriptionMultiplier, getStreakMultiplier } from "../lib/xpSystem";
import { User } from "../lib/types";
import { houses } from "../lib/mockData";

interface XPDisplayProps {
  user: User;
  compact?: boolean;
  showMultipliers?: boolean;
}

export function XPDisplay({ user, compact = false, showMultipliers = false }: XPDisplayProps) {
  const xpForCurrentLevel = getXPForCurrentLevel(user.level);
  const xpForNextLevel = getXPForNextLevel(user.level);
  const xpProgress = getLevelProgress(user.xp, user.level);
  const xpIntoLevel = user.xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

  // Find user's house for accurate multiplier
  const userHouse = houses.find(h => h.id === user.house);
  const houseLevel = userHouse?.level || 1;

  // Calculate multipliers
  const subscriptionMult = getSubscriptionMultiplier(user.subscriptionTier || 'free');
  const streakMult = getStreakMultiplier(user.streak);
  const houseMult = user.house ? getHouseMultiplier(houseLevel) : 1.0;
  
  // Role bonus
  let roleMult = 0;
  if (user.houseRole === 'leader') roleMult = 0.05;
  else if (user.houseRole === 'officer') roleMult = 0.03;
  else if (user.houseRole === 'active-contributor') roleMult = 0.02;
  
  const totalHouseMult = user.house ? houseMult + roleMult : 1.0;
  const totalMult = subscriptionMult * streakMult * totalHouseMult;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30">
          <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
          <span className="text-sm">Summon Lvl {user.level}</span>
        </div>
        <div className="flex-1 max-w-[200px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              {xpIntoLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
            </span>
            <span className="text-xs text-blue-400">{xpProgress}%</span>
          </div>
          <Progress value={xpProgress} className="h-1.5" />
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border bg-gradient-to-br from-blue-900/10 to-cyan-900/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Level Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h3>Summon Level {user.level}</h3>
                </div>
              </div>
            </div>
            {totalMult > 1 && showMultipliers && (
              <Badge variant="outline" className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                {totalMult.toFixed(2)}x XP
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {xpIntoLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
              </p>
              <Badge variant="outline" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                {xpProgress}%
              </Badge>
            </div>
            <Progress value={xpProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {(xpForNextLevel - user.xp).toLocaleString()} XP to Summon Level {user.level + 1}
            </p>
          </div>

          {/* Active Multipliers */}
          {showMultipliers && totalMult > 1 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Active XP Bonuses:</p>
              <div className="flex flex-wrap gap-2">
                {subscriptionMult > 1 && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Pro {subscriptionMult}x
                  </Badge>
                )}
                {streakMult > 1 && (
                  <Badge variant="outline" className="text-xs">
                    🔥 {user.streak}-day streak {streakMult}x
                  </Badge>
                )}
                {user.house && totalHouseMult > 1 && (
                  <Badge variant="outline" className="text-xs">
                    <Home className="w-3 h-3 mr-1" />
                    House Lvl {houseLevel} {totalHouseMult.toFixed(2)}x
                  </Badge>
                )}
                {user.houseRole === 'leader' && (
                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
                    <Crown className="w-3 h-3 mr-1 text-yellow-500" />
                    Leader +0.05x
                  </Badge>
                )}
                {user.houseRole === 'officer' && (
                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30">
                    <Award className="w-3 h-3 mr-1 text-blue-500" />
                    Officer +0.03x
                  </Badge>
                )}
                {user.houseRole === 'active-contributor' && (
                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
                    <Star className="w-3 h-3 mr-1 text-green-500" />
                    Active +0.02x
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
