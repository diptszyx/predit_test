import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, Trophy, Zap, Copy, Users, Star, TrendingUp, Crown, Award, Info, Shield, UserX, AlertTriangle } from 'lucide-react';
import { House, HouseMember, User } from '../lib/types';
import { toast } from 'sonner@2.0.3';
import { getHouseRole, canKickMember, getRemainingKicks, shouldResetDailyKicks } from '../lib/xpSystem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useState } from 'react';

interface HouseDetailPagePropsOld {
  houseId: string;
  onBack: () => void;
  onJoinHouse?: (houseId: string) => void;
  onSwitchHouse?: (houseId: string) => void;
  onLeaveHouse?: () => void;
  user?: User;
  houses?: House[];
  houseMembers?: Record<string, HouseMember[]>;
}

interface HouseDetailPagePropsNew {
  house: House;
  members: HouseMember[];
  onBack: () => void;
  isUserHouse: boolean;
  currentUser?: User;
}

type HouseDetailPageProps = HouseDetailPagePropsOld | HouseDetailPagePropsNew;

function isOldProps(props: HouseDetailPageProps): props is HouseDetailPagePropsOld {
  return 'houseId' in props;
}

export function HouseDetailPage(props: HouseDetailPageProps) {
  // Handle both old and new prop interfaces
  let house: House;
  let members: HouseMember[];
  let onBack: () => void;
  let isUserHouse: boolean;
  let currentUser: User | undefined;

  if (isOldProps(props)) {
    // Old interface from App.tsx
    const { houseId, houses = [], houseMembers = {}, user } = props;
    house = houses.find(h => h.id === houseId) || houses[0];
    members = houseMembers[houseId] || [];
    onBack = props.onBack;
    isUserHouse = user?.house === houseId;
    currentUser = user;
  } else {
    // New interface
    ({ house, members, onBack, isUserHouse, currentUser } = props);
  }

  // Rest of the component logic
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [memberToKick, setMemberToKick] = useState<HouseMember | null>(null);

  // Calculate current user's role if they're in this house
  const currentUserRole = currentUser && isUserHouse 
    ? getHouseRole(currentUser.level)
    : undefined;

  // Check if daily kicks need to be reset
  const dailyKicksUsed = currentUser && shouldResetDailyKicks(currentUser.dailyKicksResetDate)
    ? 0
    : (currentUser?.dailyKicksUsed || 0);

  const remainingKicks = getRemainingKicks(dailyKicksUsed);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address Copied!', {
      description: 'Wallet address copied to clipboard',
    });
  };

  const handleKickClick = (member: HouseMember) => {
    // Check daily limit
    if (remainingKicks <= 0) {
      toast.error('Daily Kick Limit Reached', {
        description: 'You can only remove 5 members per day. Try again tomorrow.',
      });
      return;
    }

    setMemberToKick(member);
    setKickDialogOpen(true);
  };

  const handleConfirmKick = () => {
    if (!memberToKick || !currentUser) return;
    
    // In a real app, this would:
    // 1. Call an API to remove the member
    // 2. Update the user's dailyKicksUsed count
    // 3. Refresh the member list
    
    toast.success('Member Removed', {
      description: `${memberToKick.username} has been removed from ${house.name}`,
    });
    
    setKickDialogOpen(false);
    setMemberToKick(null);
  };

  const getRoleDisplay = (role?: 'member' | 'officer' | 'leader') => {
    switch (role) {
      case 'leader':
        return { label: 'Leader', icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' };
      case 'officer':
        return { label: 'Officer', icon: Shield, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' };
      default:
        return null;
    }
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 1.8) return 'text-yellow-400';
    if (multiplier >= 1.5) return 'text-blue-400';
    if (multiplier >= 1.3) return 'text-green-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${house.color} flex items-center justify-center text-2xl flex-shrink-0`}
            >
              {house.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl">{house.name}</h1>
                {isUserHouse && (
                  <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">
                    Your House
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{house.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 md:px-6 py-8 max-w-6xl mx-auto">
        {/* Officer/Leader Kick Limit Banner */}
        {currentUser && isUserHouse && (currentUserRole === 'officer' || currentUserRole === 'leader') && (
          <Card className={`mb-6 border-border ${remainingKicks <= 2 ? 'bg-orange-500/5 border-orange-500/30' : 'bg-blue-500/5 border-blue-500/30'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${remainingKicks <= 2 ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
                  {remainingKicks <= 2 ? (
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  ) : (
                    <Shield className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {currentUserRole === 'leader' ? 'Leader' : 'Officer'} Permissions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {remainingKicks > 0 ? (
                      <>You can remove <strong>{remainingKicks}</strong> more {remainingKicks === 1 ? 'member' : 'members'} today (resets daily)</>
                    ) : (
                      <>Daily limit reached. You can remove more members tomorrow.</>
                    )}
                  </p>
                </div>
                {remainingKicks > 0 && (
                  <Badge variant="outline" className={remainingKicks <= 2 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-500/10 border-blue-500/30'}>
                    {remainingKicks}/5 kicks left
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">House Rank</p>
                  <p className="text-2xl">#{house.rank}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl">{house.memberCount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-2xl">{(house.totalXP / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg XP</p>
                  <p className="text-2xl">
                    {Math.floor(house.totalXP / house.memberCount).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Season Info Banner */}
        <Card className="border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 flex items-center gap-2">
                  Season 1 - The Summons Oracle Clash
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Compete until November 30, 2025. Top houses win massive XP bonuses and eternal bragging rights
                </p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Season Multiplier:</span>
                    <span className="ml-2 font-medium text-purple-400">
                      {house.rank === 1 ? '3x' : house.rank === 2 ? '2x' : house.rank === 3 ? '1.5x' : '0.5x'} XP
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">House Multiplier:</span>
                    <span className="ml-2 font-medium text-blue-400">+1.1x XP</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member List */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl mb-1">House Members</h2>
                <p className="text-sm text-muted-foreground">
                  Top {members.length} members by XP earned
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {members.length} / {house.memberCount.toLocaleString()} shown
              </Badge>
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <Card
                  key={member.walletAddress}
                  className="border-border hover:border-purple-500/30 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center min-w-[50px] h-12">
                        {member.rank <= 3 ? (
                          <div className="text-3xl leading-none">
                            {member.rank === 1 && '🥇'}
                            {member.rank === 2 && '🥈'}
                            {member.rank === 3 && '🥉'}
                          </div>
                        ) : (
                          <div className="text-xl text-muted-foreground leading-none">
                            #{member.rank}
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={member.avatar} alt={member.username} />
                        <AvatarFallback>{member.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className="font-medium text-lg truncate">{member.username}</p>
                          {member.level && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              Level {member.level}
                            </Badge>
                          )}
                          {(() => {
                            const roleDisplay = getRoleDisplay(member.role);
                            if (roleDisplay) {
                              const RoleIcon = roleDisplay.icon;
                              return (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs flex-shrink-0 ${roleDisplay.bgColor} ${roleDisplay.borderColor}`}
                                >
                                  <RoleIcon className={`w-3 h-3 mr-1 ${roleDisplay.color}`} />
                                  {roleDisplay.label}
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-muted-foreground font-mono truncate">
                            {member.walletAddress}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 flex-shrink-0"
                            onClick={() => handleCopyAddress(member.walletAddress)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* XP & Multiplier */}
                      <div className="text-right min-w-[180px] flex-shrink-0">
                        <div className="flex items-center justify-end gap-2 mb-1.5">
                          <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                          <p className="text-xl font-medium">{member.xpEarned.toLocaleString()}</p>
                          <span className="text-sm text-muted-foreground">XP</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <Zap className={`w-4 h-4 flex-shrink-0 ${getMultiplierColor(member.currentMultiplier)}`} />
                          <p className={`text-sm font-medium ${getMultiplierColor(member.currentMultiplier)}`}>
                            {member.currentMultiplier}x multiplier
                          </p>
                        </div>
                      </div>

                      {/* Kick Button - Show if current user can kick this member */}
                      {currentUser && currentUserRole && member.walletAddress !== currentUser.walletAddress && canKickMember(currentUserRole, member.role, dailyKicksUsed) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleKickClick(member)}
                          className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          disabled={remainingKicks <= 0}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    Member rankings update in real-time based on XP earned and active multipliers. 
                    Top members contribute significantly to the house's total XP score.
                  </p>
                  <p className="mb-2">
                    House roles are automatically assigned based on Summon Level:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong className="text-foreground">Regular Member</strong> (Below Lv 20): +1.1x XP multiplier</li>
                    <li><strong className="text-blue-400">Officer</strong> (Lv 20-24): +1.25x XP multiplier, can remove regular members (max 5/day)</li>
                    <li><strong className="text-yellow-400">Leader</strong> (Lv 25+): +1.5x XP multiplier, can remove officers and regular members (max 5/day)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kick Member Confirmation Dialog */}
      <AlertDialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-500" />
              Remove Member from House
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {memberToKick && (
                <>
                  <p>
                    Are you sure you want to remove <strong>{memberToKick.username}</strong> from {house.name}?
                  </p>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400">
                      ⚠️ This action cannot be undone. The member will lose all house benefits immediately.
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmKick}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
