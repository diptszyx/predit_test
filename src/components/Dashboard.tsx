import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import {
  TrendingUp,
  Trophy,
  Flame,
  Star,
  Target,
  Zap,
  ArrowRight,
  Users,
  Award,
  Lock,
  Info,
} from "lucide-react";
import { mockUser, dailyQuests, platformStats, houses } from "../lib/mockData";
import {
  getLevelTitle,
  getXPForNextLevel,
  getXPForCurrentLevel,
  getLevelProgress,
} from "../lib/xpSystem";
import { XPAchievementsCard } from "./XPAchievementsCard";
import { MainNavigation } from "./MainNavigation";
import { ReferralCard } from "./ReferralCard";

interface DashboardProps {
  onNavigate: (page: string) => void;
  onBackToOracles?: () => void;
  totalOracles?: number;
  user?: typeof mockUser;
}

export function Dashboard({
  onNavigate,
  onBackToOracles,
  totalOracles = 22,
  user = mockUser,
}: DashboardProps) {
  const levelTitle = getLevelTitle(user.level);
  const xpForCurrentLevel = getXPForCurrentLevel(user.level);
  const xpForNextLevel = getXPForNextLevel(user.level);
  const xpProgress = getLevelProgress(user.xp, user.level);
  const xpIntoLevel = user.xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

  // Season dates
  const switchLockDate = new Date("2025-11-20T00:00:00");
  const seasonEndDate = new Date("2025-11-30T23:59:59");
  const currentDate = new Date();
  const daysUntilLockout = Math.ceil(
    (switchLockDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUntilSeasonEnd = Math.ceil(
    (seasonEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isSwitchingLocked = currentDate >= switchLockDate;

  // House switching info
  const switchesUsed = user.houseSwitchesUsed ?? 0;
  const maxSwitches = 3;
  const remainingSwitches = maxSwitches - switchesUsed;

  // Get user's house info
  const userHouse = user.house ? houses.find((h) => h.id === user.house) : null;

  // Get season end multiplier based on house rank
  const getSeasonMultiplier = (rank: number) => {
    if (rank === 1) return "3x";
    if (rank === 2) return "2x";
    if (rank === 3) return "1.5x";
    return "0.5x";
  };

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Consultations
                </p>
                <h3 className="mt-1">
                  {(user.totalPredictions || 42).toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <h3 className="mt-1">{user.streak} days</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Oracles Visited</p>
                <h3 className="mt-1">
                  {user.oraclesVisited}/{totalOracles}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Summon Level</p>
                <h3 className="mt-1">Level {user.level}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* House Banner */}
      {user.house && userHouse && (
        <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${userHouse.color} flex items-center justify-center text-2xl flex-shrink-0`}
              >
                {userHouse.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg">House: {userHouse.name}</h3>
                  <Badge
                    variant="outline"
                    className="bg-purple-500/10 border-purple-500/30"
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    Rank #{userHouse.rank}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 border-green-500/30"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    +1.1x XP
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-yellow-500/10 border-yellow-500/30"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {getSeasonMultiplier(userHouse.rank)} Season Bonus
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Season 1 - The Summons ends in {daysUntilSeasonEnd} days (Nov
                  30).
                  {!isSwitchingLocked &&
                    remainingSwitches > 0 &&
                    ` ${remainingSwitches} house ${
                      remainingSwitches === 1 ? "switch" : "switches"
                    } left (locks Nov 20).`}
                  {isSwitchingLocked &&
                    " House switching locked until season end."}
                </p>
              </div>
              <Button variant="outline" onClick={() => onNavigate("houses")}>
                View Ranking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join House CTA */}
      {!user.house && (
        <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Join a Great House</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose from 20 unique houses. Earn +1.1x XP multiplier and
                  compete for massive season end rewards!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    +1.1x Base XP
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    Up to 3x Season Bonus
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Info className="w-3 h-3 mr-1" />
                    {daysUntilSeasonEnd} days left
                  </Badge>
                </div>
              </div>
              <Button
                variant="default"
                onClick={() => onNavigate("houses")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                Browse Houses
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total XP Earned */}
      <Card className="border-border bg-gradient-to-r from-purple-500/5 to-pink-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total XP Earned</p>
              <h3 className="mt-1">{user.xp.toLocaleString()} XP</h3>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate("leaderboard")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Top 100
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="mb-1">
                Level {user.level}: {levelTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                {xpIntoLevel.toLocaleString()} /{" "}
                {xpNeededForLevel.toLocaleString()} XP
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
            >
              {xpProgress}% Complete
            </Badge>
          </div>
          <Progress value={xpProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {(xpForNextLevel - user.xp).toLocaleString()} XP to Level{" "}
            {user.level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Daily Quests */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Daily Quests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {dailyQuests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="p-4 rounded-lg bg-accent">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm mb-1">{quest.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {quest.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{quest.xpReward} XP
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Progress
                    value={(quest.progress! / quest.maxProgress) * 100}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    {quest.progress}/{quest.maxProgress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-2xl mb-1">
                {platformStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Consult Sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl mb-1">
                {(platformStats.totalPredictions / 1000).toFixed(0)}K+
              </div>
              <p className="text-xs text-muted-foreground">Predictions Made</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Season Progress Card */}
      <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Season 1 - The Summons
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm mb-3">Season Timeline</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Days Remaining
                  </span>
                  <Badge variant="outline">{daysUntilSeasonEnd} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Season Ends
                  </span>
                  <span className="text-sm">Nov 30, 2025</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    House Switching
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      isSwitchingLocked
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-green-500/10 border-green-500/30"
                    }
                  >
                    {isSwitchingLocked ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </>
                    ) : (
                      `${remainingSwitches} left`
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm mb-3">Season End Rewards</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">🥇</span>
                  <span className="text-muted-foreground">1st Place:</span>
                  <span className="font-bold">3x Season XP</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">🥈</span>
                  <span className="text-muted-foreground">2nd Place:</span>
                  <span className="font-bold">2x Season XP</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">🥉</span>
                  <span className="text-muted-foreground">3rd Place:</span>
                  <span className="font-bold">1.5x Season XP</span>
                </div>
              </div>
            </div>
          </div>
          {user.house && userHouse && (
            <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm">
                <strong>Your Projected Bonus:</strong> If {userHouse.name}{" "}
                maintains rank #{userHouse.rank}, you'll receive a{" "}
                <strong>{getSeasonMultiplier(userHouse.rank)}</strong>{" "}
                multiplier on all Season 1 XP at season end!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral System */}
      <ReferralCard user={user} />

      {/* Achievements Section */}
      <XPAchievementsCard user={user} />
    </div>
  );
}
