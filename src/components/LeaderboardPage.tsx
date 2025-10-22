import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { getLevelTitle } from "../lib/xpSystem";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface LeaderboardPageProps {
  user?: any;
}

// Generate mock leaderboard data
const generateLeaderboard = (currentUser: any) => {
  const leaderboard = [];
  
  // Generate top 100 users
  for (let i = 0; i < 100; i++) {
    const rank = i + 1;
    // Generate decreasing XP values from 50,000 down
    const baseXP = 50000 - (i * 350);
    const xp = baseXP + Math.floor(Math.random() * 200);
    
    // Generate mock crypto addresses
    const address = `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`;
    
    // Calculate level based on XP (simplified)
    const level = Math.floor(xp / 1000) + 1;
    
    leaderboard.push({
      rank,
      address,
      xp,
      level,
      isCurrentUser: false,
    });
  }
  
  return leaderboard;
};

export function LeaderboardPage({ user }: LeaderboardPageProps) {
  const leaderboard = generateLeaderboard(user);
  
  // Determine user's rank based on their XP
  const userXP = user?.xp || 0;
  const userLevel = user?.level || 1;
  
  // Generate user identifier (wallet address or social login)
  let userAddress = "Guest";
  if (user?.walletAddress) {
    userAddress = user.walletAddress.length > 20 
      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
      : user.walletAddress;
  } else if (user?.socialProvider) {
    userAddress = `${user.socialProvider} User`;
  } else {
    userAddress = `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`;
  }
  
  // Find where user would rank
  let userRank = leaderboard.findIndex(entry => userXP >= entry.xp) + 1;
  if (userRank === 0) userRank = 101; // User is below top 100
  
  const isUserInTop100 = userRank <= 100;
  
  // If user is in top 100, update that entry
  if (isUserInTop100) {
    leaderboard[userRank - 1] = {
      rank: userRank,
      address: userAddress,
      xp: userXP,
      level: userLevel,
      isCurrentUser: true,
    };
  }
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    if (rank <= 10) return "bg-purple-500/20 border-purple-500/30 text-purple-400";
    return "";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-6">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">Top XP Earners • Season 1</span>
        </div>
        <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          XP Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Compete for the top spot and earn bragging rights as a legendary Summoner
        </p>
      </div>

      {/* User's Current Standing */}
      <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Current Rank</p>
                <h3 className="text-2xl">
                  {userRank <= 100 ? `#${userRank}` : `#${userRank}+`}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Your XP</p>
                <p className="text-lg">{userXP.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Level</p>
                <p className="text-lg">Level {userLevel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level Title</p>
                <Badge variant="outline" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                  {getLevelTitle(userLevel)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top 100 Summoners
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Summoner</TableHead>
                  <TableHead className="text-right">XP Earned</TableHead>
                  <TableHead className="text-right">Level</TableHead>
                  <TableHead className="text-right">Level Title</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow 
                    key={entry.rank}
                    className={entry.isCurrentUser ? "bg-purple-500/10 border-purple-500/30" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <Badge 
                          variant="outline" 
                          className={getRankBadge(entry.rank)}
                        >
                          #{entry.rank}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm">{entry.address}</code>
                        {entry.isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.xp.toLocaleString()} XP
                    </TableCell>
                    <TableCell className="text-right">
                      Level {entry.level}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {getLevelTitle(entry.level)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Show user at bottom if not in top 100 */}
                {!isUserInTop100 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-2">
                        <div className="border-t border-dashed border-border"></div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-purple-500/10 border-purple-500/30">
                      <TableCell>
                        <Badge variant="outline">
                          #{userRank}+
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm">{userAddress}</code>
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {userXP.toLocaleString()} XP
                      </TableCell>
                      <TableCell className="text-right">
                        Level {userLevel}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {getLevelTitle(userLevel)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Rankings are updated in real-time. Keep earning XP through oracle consultations, 
            daily quests, and house activities to climb the leaderboard. Season 1 ends November 30, 2025.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
