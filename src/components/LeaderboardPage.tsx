import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  LeaderboardEntry,
  leaderboardService,
  LeaderboardType,
} from '../services/leaderboard.service';
import { User } from '../lib/types';
import { shortenAddress } from '../lib/address';

interface RankedLeaderboardEntry extends LeaderboardEntry {
  rank: number;
  isCurrentUser: boolean;
}

interface LeaderboardPageProps {
  user?: User;
}

export function LeaderboardPage({ user }: LeaderboardPageProps) {
  const [sortBy, setSortBy] = useState<LeaderboardType>('xp');
  const [leaderboard, setLeaderBoard] = useState<LeaderboardEntry[]>([]);
  const [userLeaderBoardData, setUserLeaderBoardData] = useState<
    LeaderboardEntry | undefined
  >();

  const userAddress =
    user?.appWallet ?? userLeaderBoardData?.appWalletAddress ?? '';
  const userXP = user?.xp ?? userLeaderBoardData?.xp ?? 0;
  const userLevel = user?.level ?? userLeaderBoardData?.level ?? 1;

  useEffect(() => {
    (async () => {
      try {
        const data = await leaderboardService.getLeaderboard(sortBy);
        setLeaderBoard([...data.leaderboard]);
        if (data?.userData) setUserLeaderBoardData({ ...data.userData });
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      }
    })();
  }, [sortBy, user]);

  const sortedLeaderboard = useMemo<RankedLeaderboardEntry[]>(() => {
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser:
        entry?.appWalletAddress?.toLowerCase() === userAddress.toLowerCase(),
    }));
  }, [leaderboard, userAddress]);

  const isUserInTop100 = sortedLeaderboard.some(
    (e: RankedLeaderboardEntry) => e.isCurrentUser
  );
  const currentUserRank =
    sortedLeaderboard.find((e: RankedLeaderboardEntry) => e.isCurrentUser)
      ?.rank ?? 101;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-primary text-primary-foreground border-primary';
    if (rank === 2) return 'bg-muted-foreground/20 border-muted-foreground/30';
    if (rank === 3) return 'bg-muted-foreground/10 border-muted-foreground/20';
    if (rank <= 10) return 'bg-primary/10 border-primary/30';
    return '';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {user?.id && (
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Your Current Rank
                </p>
                <h3 className="text-2xl">
                  {currentUserRank <= 100
                    ? `#${currentUserRank}`
                    : `#${currentUserRank}+`}
                </h3>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your XP</p>
                  <p className="text-lg">{userXP.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Your Level
                  </p>
                  <p className="text-lg">Level {userLevel}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Top 100 Players</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-1">
                <Button
                  variant={sortBy === 'xp' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('xp')}
                >
                  XP Earned
                </Button>
                <Button
                  variant={sortBy === 'level' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('level')}
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
                {sortedLeaderboard.map((entry: RankedLeaderboardEntry) => (
                  <TableRow
                    key={entry.appWalletAddress}
                    className={
                      entry.isCurrentUser
                        ? 'bg-primary/5 border-primary/20'
                        : ''
                    }
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
                        <code className="text-sm">
                          {shortenAddress(entry.appWalletAddress)}
                        </code>
                        {entry.isCurrentUser && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            You
                          </Badge>
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
                {!isUserInTop100 && userAddress && (
                  <>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-2"
                      >
                        <div className="border-t border-dashed border-border"></div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-500/10 border-blue-500/30">
                      <TableCell>
                        <Badge variant="outline">#{currentUserRank}+</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm">
                            {shortenAddress(userAddress)}
                          </code>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            You
                          </Badge>
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
