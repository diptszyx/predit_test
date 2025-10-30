import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
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
  const [sortBy, setSortBy] = useState<"xp" | "level">("xp");
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
  
  // Sort leaderboard based on selected option
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === "xp") {
      return b.xp - a.xp;
    } else {
      // Sort by level (descending), then by XP if levels are equal
      if (b.level !== a.level) {
        return b.level - a.level;
      }
      return b.xp - a.xp;
    }
  });
  
  // Re-assign ranks based on sort
  sortedLeaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-primary text-primary-foreground border-primary";
    if (rank === 2) return "bg-muted-foreground/20 border-muted-foreground/30";
    if (rank === 3) return "bg-muted-foreground/10 border-muted-foreground/20";
    if (rank <= 10) return "bg-primary/10 border-primary/30";
    return "";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* User's Current Standing */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Current Rank</p>
              <h3 className="text-2xl">
                {userRank <= 100 ? `#${userRank}` : `#${userRank}+`}
              </h3>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your XP</p>
                <p className="text-lg">{userXP.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Level</p>
                <p className="text-lg">Level {userLevel}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Top 100 Players</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-1">
                <Button
                  variant={sortBy === "xp" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("xp")}
                >
                  XP Earned
                </Button>
                <Button
                  variant={sortBy === "level" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("level")}
                >
                  Level
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">XP Earned</TableHead>
                  <TableHead className="text-right">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLeaderboard.map((entry, index) => (
                  <TableRow 
                    key={`${entry.address}-${index}`}
                    className={entry.isCurrentUser ? "bg-primary/5 border-primary/20" : ""}
                  >
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getRankBadge(entry.rank)}
                      >
                        #{entry.rank}
                      </Badge>
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
                      Lvl {entry.level}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Show user at bottom if not in top 100 */}
                {!isUserInTop100 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-2">
                        <div className="border-t border-dashed border-border"></div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-500/10 border-blue-500/30">
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
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
