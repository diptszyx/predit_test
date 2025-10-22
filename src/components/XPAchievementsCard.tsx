import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Trophy, Lock, CheckCircle, Star, Target, Flame, Users, TrendingUp, Shield, Crown } from "lucide-react";
import { User } from "../lib/types";
import { LEVEL_THRESHOLDS } from "../lib/xpSystem";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  requirement: number;
  current: number;
  reward: string;
  unlocked: boolean;
}

interface XPAchievementsCardProps {
  user: User;
}

export function XPAchievementsCard({ user }: XPAchievementsCardProps) {
  // Define achievements based on user stats
  const achievements: Achievement[] = [
    {
      id: "first-steps",
      title: "First Steps",
      description: "Visit your first oracle",
      icon: Star,
      requirement: 1,
      current: user.oraclesVisited,
      reward: "+50 XP",
      unlocked: user.oraclesVisited >= 1,
    },
    {
      id: "oracle-explorer",
      title: "Oracle Explorer",
      description: "Visit 5 different oracles",
      icon: Users,
      requirement: 5,
      current: user.oraclesVisited,
      reward: "+150 XP",
      unlocked: user.oraclesVisited >= 5,
    },
    {
      id: "oracle-master",
      title: "Oracle Master",
      description: "Visit all 18 oracles",
      icon: Trophy,
      requirement: 18,
      current: user.oraclesVisited,
      reward: "+500 XP",
      unlocked: user.oraclesVisited >= 18,
    },
    {
      id: "prediction-novice",
      title: "Prediction Novice",
      description: "Asked 10 predictions",
      icon: Target,
      requirement: 10,
      current: user.totalPredictions,
      reward: "+100 XP",
      unlocked: user.totalPredictions >= 10,
    },
    {
      id: "prediction-adept",
      title: "Prediction Adept",
      description: "Asked 50 predictions",
      icon: Target,
      requirement: 50,
      current: user.totalPredictions,
      reward: "+300 XP",
      unlocked: user.totalPredictions >= 50,
    },
    {
      id: "prediction-legend",
      title: "Prediction Legend",
      description: "Asked 100 predictions",
      icon: Trophy,
      requirement: 100,
      current: user.totalPredictions,
      reward: "+1000 XP",
      unlocked: user.totalPredictions >= 100,
    },
    {
      id: "streak-starter",
      title: "Streak Starter",
      description: "Maintain a 3-day login streak",
      icon: Flame,
      requirement: 3,
      current: user.streak,
      reward: "+50 XP + 1.1x XP Multiplier",
      unlocked: user.streak >= 3,
    },
    {
      id: "week-warrior",
      title: "Week Warrior",
      description: "Maintain a 7-day login streak",
      icon: Flame,
      requirement: 7,
      current: user.streak,
      reward: "+150 XP + 1.2x XP Multiplier",
      unlocked: user.streak >= 7,
    },
    {
      id: "monthly-devotee",
      title: "Monthly Devotee",
      description: "Maintain a 30-day login streak",
      icon: Flame,
      requirement: 30,
      current: user.streak,
      reward: "+500 XP + 1.5x XP Multiplier",
      unlocked: user.streak >= 30,
    },
    {
      id: "level-10",
      title: "Prophecy Master",
      description: "Reach Level 10",
      icon: Star,
      requirement: 10,
      current: user.level,
      reward: "Special Oracle Tier Unlocked",
      unlocked: user.level >= 10,
    },
    {
      id: "level-20",
      title: "Grand Oracle",
      description: "Reach Level 20",
      icon: Trophy,
      requirement: 20,
      current: user.level,
      reward: "Platform Legend Status + All Features Unlocked",
      unlocked: user.level >= 20,
    },
    {
      id: "house-member",
      title: "House Member",
      description: "Join a house",
      icon: Users,
      requirement: 1,
      current: user.house ? 1 : 0,
      reward: "+100 XP + 1.1x XP Bonus",
      unlocked: !!user.house,
    },
    {
      id: "house-officer",
      title: "House Officer",
      description: "Reach Level 20 to become an Officer",
      icon: Shield,
      requirement: 20,
      current: user.level,
      reward: "+250 XP + 1.25x House Bonus + Moderation Powers",
      unlocked: user.level >= 20 && !!user.house,
    },
    {
      id: "house-leader",
      title: "House Leader",
      description: "Reach Level 25 to become a Leader",
      icon: Crown,
      requirement: 25,
      current: user.level,
      reward: "+500 XP + 1.5x House Bonus + Full Management Powers",
      unlocked: user.level >= 25 && !!user.house,
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <Badge variant="outline" className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const progress = Math.min(100, (achievement.current / achievement.requirement) * 100);

            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-border bg-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                        : 'bg-muted'
                    }`}
                  >
                    {achievement.unlocked ? (
                      <Icon className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className={achievement.unlocked ? 'text-yellow-500' : ''}>
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    {/* Progress */}
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            {achievement.current} / {achievement.requirement}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}

                    {/* Reward */}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {achievement.reward}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
