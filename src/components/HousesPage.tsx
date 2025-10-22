import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Users, Trophy, TrendingUp, Crown, Star, AlertCircle, Award, Zap, Info, HelpCircle, Lock, ArrowLeft, Target, MessageSquare, Send } from "lucide-react";
import { houses, mockUser } from "../lib/mockData";
import { toast } from "sonner@2.0.3";
import { MainNavigation } from "./MainNavigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { HowItWorksDialog } from "./HowItWorksDialog";

interface HousesPageProps {
  onJoinHouse?: (houseId: string) => void;
  onLeaveHouse?: () => void;
  userHouse?: string | null;
  houseSwitchesUsed?: number;
  onSwitchHouse?: (houseId: string) => void;
  onNavigateBack?: () => void;
  onNavigate?: (page: string) => void;
  user?: any;
}

interface HouseComment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  house: string;
  content: string;
  timestamp: string;
  level: number;
}

export function HousesPage({ onJoinHouse, onLeaveHouse, userHouse, houseSwitchesUsed, onSwitchHouse, onNavigateBack, onNavigate, user }: HousesPageProps) {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<HouseComment[]>([
    {
      id: "c1",
      userId: "user-2",
      username: "CryptoWhale",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80",
      house: "crypto-kings",
      content: "Crypto Kings to the moon! 🚀 Let's secure that #1 spot!",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      level: 18,
    },
    {
      id: "c2",
      userId: "user-3",
      username: "SportsMaven",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80",
      house: "sports-savants",
      content: "Sports Savants climbing the ranks! Great work everyone on the predictions this week 🏆",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      level: 22,
    },
    {
      id: "c3",
      userId: "user-4",
      username: "PolSeer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      house: "political-prophets",
      content: "Political Prophets need to step up! We can take down Crypto Kings if we coordinate our predictions",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      level: 15,
    },
    {
      id: "c4",
      userId: "user-5",
      username: "MysticDreamer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      house: "mystic-seers",
      content: "The cosmic energies are aligning for Mystic Seers this season 🔮✨",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      level: 20,
    },
    {
      id: "c5",
      userId: "user-6",
      username: "TechGuru42",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      house: "tech-titans",
      content: "Just switched to Tech Titans! The future is here 💻",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      level: 14,
    },
  ]);
  
  const currentUserHouse = userHouse || mockUser.house;
  const switchesUsed = houseSwitchesUsed ?? mockUser.houseSwitchesUsed ?? 0;
  const maxSwitches = 3;
  const remainingSwitches = maxSwitches - switchesUsed;

  // Season 1 switching lockout date: November 20, 2025
  const switchLockDate = new Date('2025-11-20T00:00:00');
  const seasonEndDate = new Date('2025-11-30T23:59:59');
  const currentDate = new Date();
  const daysUntilLockout = Math.ceil((switchLockDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilSeasonEnd = Math.ceil((seasonEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const isSwitchingLocked = currentDate >= switchLockDate;

  const handleJoinClick = (houseId: string) => {
    // If user already in a house, check if they can switch
    if (currentUserHouse) {
      // Check if switching is locked after Nov 20
      if (isSwitchingLocked) {
        toast.error("House Switching Locked", {
          description: `House switching closed on November 20th. You'll remain in your current house until Season 1 ends on November 30th.`,
        });
        return;
      }
      
      // Check if user has switches remaining
      if (switchesUsed >= maxSwitches) {
        toast.error("No Switches Remaining", {
          description: `You've used all ${maxSwitches} house switches. You'll remain in your current house until Season 1 ends.`,
        });
        return;
      }
      
      // User can switch
      setSelectedHouse(houseId);
      setSwitchDialogOpen(true);
      return;
    }
    
    // New join (first time)
    setSelectedHouse(houseId);
    setJoinDialogOpen(true);
  };

  const handleJoinConfirm = () => {
    if (selectedHouse && onJoinHouse) {
      onJoinHouse(selectedHouse);
      const houseName = houses.find(h => h.id === selectedHouse)?.name;
      toast.success("Welcome to the House!", {
        description: `You've joined ${houseName}! Start earning house XP now.`,
      });
    }
    setJoinDialogOpen(false);
  };

  const handleSwitchConfirm = () => {
    if (selectedHouse && onSwitchHouse) {
      const newHouseName = houses.find(h => h.id === selectedHouse)?.name;
      const oldHouseName = houses.find(h => h.id === currentUserHouse)?.name;
      onSwitchHouse(selectedHouse);
      toast.success("House Switched!", {
        description: `You've left ${oldHouseName} and joined ${newHouseName}! Switches remaining: ${remainingSwitches - 1}`,
      });
    }
    setSwitchDialogOpen(false);
  };

  const handleLeaveClick = () => {
    setLeaveDialogOpen(true);
  };

  const handleLeaveConfirm = () => {
    if (onLeaveHouse) {
      onLeaveHouse();
      toast.success("Left House", {
        description: "You've left your house. You can join a new one anytime.",
      });
    }
    setLeaveDialogOpen(false);
  };

  const handleViewDetails = (houseId: string) => {
    setSelectedHouse(houseId);
    setDetailsDialogOpen(true);
  };

  // Get season end multipliers
  const getSeasonMultiplier = (rank: number) => {
    if (rank === 1) return "3x";
    if (rank === 2) return "2x";
    if (rank === 3) return "1.5x";
    return "1x";
  };

  const selectedHouseData = houses.find(h => h.id === selectedHouse);

  const handlePostComment = () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (!currentUserHouse) {
      toast.error("Join a house to post comments");
      return;
    }

    const comment: HouseComment = {
      id: `c${Date.now()}`,
      userId: user?.id || mockUser.id,
      username: user?.username || mockUser.username,
      avatar: user?.avatar || mockUser.avatar,
      house: currentUserHouse,
      content: newComment,
      timestamp: new Date().toISOString(),
      level: user?.level || mockUser.level,
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("Comment posted!");
  };

  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400">10 Houses • The Summons Oracle Clash</span>
        </div>
        <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          The Great Houses
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose from 10 unique houses. Pledge your allegiance, collaborate with fellow Chroniclers, and compete for eternal glory
        </p>
      </div>

      {/* Season Rewards Banner */}
      <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-yellow-500">Season 1 - The Summons: XP Multipliers</h3>
              <p className="text-sm text-muted-foreground mb-3">
                At the end of Season 1, house rankings determine your XP bonus multiplier for the entire season!
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30">
                  <div className="text-2xl mb-1">🥇</div>
                  <p className="text-sm font-bold">1st Place</p>
                  <p className="text-xs text-muted-foreground">3x XP Earned</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-gray-300/20 to-gray-400/20 border border-gray-400/30">
                  <div className="text-2xl mb-1">🥈</div>
                  <p className="text-sm font-bold">2nd Place</p>
                  <p className="text-xs text-muted-foreground">2x XP Earned</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-600/20 to-yellow-700/20 border border-orange-500/30">
                  <div className="text-2xl mb-1">🥉</div>
                  <p className="text-sm font-bold">3rd Place</p>
                  <p className="text-xs text-muted-foreground">1.5x XP Earned</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User's Current House */}
      {currentUserHouse && (
        <Card className="border-border max-w-4xl mx-auto border-2 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                  houses.find((h) => h.id === currentUserHouse)?.color
                } flex items-center justify-center text-3xl`}
              >
                {houses.find((h) => h.id === currentUserHouse)?.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3>Your House: {houses.find((h) => h.id === currentUserHouse)?.name}</h3>
                  <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Member
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 border-green-500/30">
                    <Zap className="w-3 h-3 mr-1" />
                    +1.1x XP Bonus
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {houses.find((h) => h.id === currentUserHouse)?.description}
                </p>
              </div>
              <Button variant="outline" onClick={handleLeaveClick}>Leave House</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join House CTA (if not in a house) */}
      {!currentUserHouse && (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="mb-2">Join a House to Boost Your XP!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Members get a permanent +1.1x XP multiplier, plus bonus rewards based on your house's season ranking.
                  Choose wisely—you can only be in one house at a time!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <Zap className="w-3 h-3 mr-1" />
                    +1.1x Base XP
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="w-3 h-3 mr-1" />
                    Season End Bonus
                  </Badge>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    Exclusive Quests
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard & Comments Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl">House Leaderboard & Discussion</h2>
            <p className="text-sm text-muted-foreground mt-1">Season 1 - The Summons</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setHowItWorksOpen(true)}
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            How XP Works
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Houses List - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
          {houses.map((house, index) => {
            const isUserHouse = house.id === currentUserHouse;
            const rank = index + 1;
            const medals = ["🥇", "🥈", "🥉"];
            const multiplier = getSeasonMultiplier(rank);

            return (
              <Card
                key={house.id}
                className={`border-border transition-all hover:shadow-lg ${
                  isUserHouse ? "border-2 border-purple-500 shadow-purple-500/20" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="text-center min-w-[60px]">
                      <div className="text-3xl mb-1">{medals[index] || `#${rank}`}</div>
                      <p className="text-xs text-muted-foreground">Rank</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {multiplier} XP
                      </Badge>
                    </div>

                    {/* House Icon */}
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${house.color} flex items-center justify-center text-3xl flex-shrink-0`}
                    >
                      {house.icon}
                    </div>

                    {/* House Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3>{house.name}</h3>
                        {isUserHouse && (
                          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">
                            Your House
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{house.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Members</p>
                            <p className="text-sm">{house.memberCount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Total XP</p>
                            <p className="text-sm">
                              {(house.totalXP / 1000000).toFixed(1)}M
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Avg XP</p>
                            <p className="text-sm">
                              {Math.floor(house.totalXP / house.memberCount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(house.id)}
                      >
                        View Details
                      </Button>
                      {!isUserHouse && (
                        <Button 
                          variant="outline"
                          onClick={() => handleJoinClick(house.id)}
                        >
                          {currentUserHouse ? 'Switch House' : 'Join House'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>

          {/* Comments Section - Right Side (1 column) */}
          <div className="lg:col-span-1">
            <Card className="border-border sticky top-4">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    <h3>House Discussion</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Join the conversation
                  </p>
                </div>

                {/* Post Comment */}
                <div className="p-4 border-b border-border bg-accent/30">
                  <Textarea
                    placeholder={currentUserHouse ? "Share your thoughts..." : "Join a house to post comments..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3 min-h-[80px] resize-none"
                    disabled={!currentUserHouse}
                  />
                  <Button 
                    onClick={handlePostComment}
                    disabled={!currentUserHouse || !newComment.trim()}
                    className="w-full"
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>

                {/* Comments Feed */}
                <div className="max-h-[600px] overflow-y-auto">
                  {comments.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        No comments yet. Be the first!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {comments.map((comment) => {
                        const commentHouse = houses.find(h => h.id === comment.house);
                        return (
                          <div key={comment.id} className="p-4 hover:bg-accent/30 transition-colors">
                            <div className="flex gap-3">
                              {/* Avatar */}
                              <img
                                src={comment.avatar}
                                alt={comment.username}
                                className="w-10 h-10 rounded-full flex-shrink-0"
                              />
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-medium text-sm">{comment.username}</span>
                                  <Badge variant="outline" className="text-xs">
                                    Lvl {comment.level}
                                  </Badge>
                                  {commentHouse && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{
                                        background: `linear-gradient(to br, ${commentHouse.color.replace('from-', '').replace('to-', ', ')})`,
                                        borderColor: 'transparent',
                                      }}
                                    >
                                      {commentHouse.icon} {commentHouse.name}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {getTimeAgo(comment.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm break-words">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Season Info */}
      <Card className="border-border max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="mb-3">The Summons Oracle Clash - Season 1</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Compete until November 30, 2025. Top houses win massive XP bonuses and eternal bragging rights
            </p>
            <div className="flex justify-center gap-4 text-sm flex-wrap">
              <div>
                <span className="text-muted-foreground">Days Remaining:</span>
                <span className="ml-2 font-bold">{daysUntilSeasonEnd}</span>
              </div>
              <div className="border-l border-border pl-4">
                <span className="text-muted-foreground">Total Houses:</span>
                <span className="ml-2 font-bold">{houses.length}</span>
              </div>
              <div className="border-l border-border pl-4">
                <span className="text-muted-foreground">Total Members:</span>
                <span className="ml-2 font-bold">
                  {houses.reduce((sum, h) => sum + h.memberCount, 0).toLocaleString()}
                </span>
              </div>
              {currentUserHouse && (
                <div className="border-l border-border pl-4">
                  <span className="text-muted-foreground">Switches Left:</span>
                  <span className={`ml-2 font-bold ${remainingSwitches === 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {isSwitchingLocked ? '0 (Locked)' : remainingSwitches}
                  </span>
                </div>
              )}
            </div>
            
            {/* Switching Status Messages */}
            {currentUserHouse && !isSwitchingLocked && remainingSwitches > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-xs text-green-600 dark:text-green-500">
                  ✓ You have {remainingSwitches} house {remainingSwitches === 1 ? 'switch' : 'switches'} remaining. 
                  Switching locks on November 20th ({daysUntilLockout} days).
                </p>
              </div>
            )}
            
            {currentUserHouse && !isSwitchingLocked && remainingSwitches === 0 && (
              <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <p className="text-xs text-orange-600 dark:text-orange-500">
                  ⚠️ You've used all {maxSwitches} house switches. You'll remain in {houses.find(h => h.id === currentUserHouse)?.name} until Season 1 ends.
                </p>
              </div>
            )}
            
            {isSwitchingLocked && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-xs text-red-600 dark:text-red-500 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  House switching locked on November 20th. All houses finalized for Season 1 end (Nov 30).
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* House Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedHouseData?.color} flex items-center justify-center text-2xl`}
              >
                {selectedHouseData?.icon}
              </div>
              <div>
                {selectedHouseData?.name}
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Rank #{selectedHouseData?.rank} • {getSeasonMultiplier(selectedHouseData?.rank || 1)} Season XP Multiplier
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedHouseData?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-border">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{selectedHouseData?.memberCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">
                    {selectedHouseData ? (selectedHouseData.totalXP / 1000000).toFixed(1) : 0}M
                  </p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">
                    {selectedHouseData ? Math.floor(selectedHouseData.totalXP / selectedHouseData.memberCount).toLocaleString() : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg XP/Member</p>
                </CardContent>
              </Card>
            </div>

            {/* House Quest */}
            {selectedHouseData?.quest && (
              <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4>Exclusive House Quest</h4>
                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">
                          Members Only
                        </Badge>
                      </div>
                      <h5 className="mb-2 text-purple-400">{selectedHouseData.quest.title}</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedHouseData.quest.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                          Reward: {selectedHouseData.quest.reward}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <div>
              <h4 className="mb-3">House Benefits</h4>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <Zap className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">+1.1x Base XP Multiplier</p>
                    <p className="text-xs text-muted-foreground">Earn 10% more XP on all activities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Season End Multiplier</p>
                    <p className="text-xs text-muted-foreground">
                      Currently {getSeasonMultiplier(selectedHouseData?.rank || 1)} multiplier based on rank #{selectedHouseData?.rank}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Collaborative Predictions</p>
                    <p className="text-xs text-muted-foreground">Pool knowledge with house members</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <Target className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Exclusive House Quests</p>
                    <p className="text-xs text-muted-foreground">Complete special quests for bonus rewards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {selectedHouse && selectedHouse !== currentUserHouse && (
              <Button 
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleJoinClick(selectedHouse);
                }}
                className="w-full"
              >
                {currentUserHouse ? 'Switch to This House' : 'Join This House'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Join House Dialog */}
      <AlertDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Join {houses.find(h => h.id === selectedHouse)?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You're about to join <strong>{houses.find(h => h.id === selectedHouse)?.name}</strong>.
                As a member, you'll receive:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>+1.1x XP multiplier on all activities</li>
                <li>Access to house-exclusive quests</li>
                <li>Season end XP bonus based on house ranking</li>
                <li>Collaborative prediction pools</li>
              </ul>
              <p className="text-sm text-yellow-600 dark:text-yellow-500 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>You can only be in one house at a time. Leaving a house will remove your bonuses.</span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleJoinConfirm}>
              Join House
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave House Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Your House?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave {houses.find(h => h.id === currentUserHouse)?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="text-sm text-red-600 dark:text-red-500 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>You will lose your +1.1x XP multiplier and house benefits. You can join a new house anytime.</span>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveConfirm} className="bg-red-600 hover:bg-red-700">
              Leave House
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Switch House Dialog */}
      <AlertDialog open={switchDialogOpen} onOpenChange={setSwitchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Houses?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to leave {houses.find(h => h.id === currentUserHouse)?.name} and 
              join {houses.find(h => h.id === selectedHouse)?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="text-sm font-medium mb-2 text-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Switches Remaining
              </div>
              <p className="text-sm text-muted-foreground">
                This will be switch <strong>{switchesUsed + 1}</strong> of {maxSwitches}. 
                You'll have <strong>{remainingSwitches - 1}</strong> {remainingSwitches - 1 === 1 ? 'switch' : 'switches'} left 
                until November 20th, when all switching locks permanently.
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="text-sm font-medium mb-2 text-foreground">What happens when you switch:</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Your +1.1x XP multiplier continues uninterrupted</li>
                <li>All XP earned stays with you</li>
                <li>Your old house loses your contribution to their total</li>
                <li>Your new house gains your contribution</li>
                <li>Season end rewards depend on your house at season end (Nov 30)</li>
              </ul>
            </div>
            
            <div className="text-sm text-yellow-600 dark:text-yellow-500 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                You can switch up to 3 times before November 20th. After that, all houses lock until Season 1 ends on November 30th.
              </span>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSwitchConfirm}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
            >
              Switch to {houses.find(h => h.id === selectedHouse)?.name}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* How It Works Dialog */}
      <HowItWorksDialog 
        open={howItWorksOpen}
        onOpenChange={setHowItWorksOpen}
      />
    </div>
  );
}
