import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Star, 
  Zap, 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  Flame, 
  Gift,
  Crown,
  Sparkles,
  Award,
  ChevronRight,
  Info
} from "lucide-react";

interface HowItWorksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowItWorksDialog({ open, onOpenChange }: HowItWorksDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Info className="w-6 h-6 text-purple-500" />
            How the XP & Summon Level System Works
          </DialogTitle>
          <DialogDescription>
            Everything you need to know about earning XP, leveling up your Summon Level, and maximizing your rewards
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earning">Earning XP</TabsTrigger>
            <TabsTrigger value="multipliers">Multipliers</TabsTrigger>
            <TabsTrigger value="houses">Houses</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Summary */}
            <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Quick Summary
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Earn XP through oracle consultations, predictions, daily activities, and house participation. 
                    XP increases your <strong>Summon Level</strong>, unlocks perks, and boosts rewards. 
                    Multiply your XP gains with <strong>Summon Master</strong> subscription (2x), daily login streaks, 
                    and house membership!
                  </p>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                What is XP?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Experience Points (XP) are earned by engaging with the Dehouse of Oracles platform through consultations, 
                predictions, daily activities, and house participation. The more you participate, the more XP you earn. 
                XP increases your Summon Level and helps you:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Level Up Your Summon Power</h4>
                        <p className="text-xs text-muted-foreground">
                          Progress through 25 Summon Levels, each with unique titles and perks
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Unlock Perks</h4>
                        <p className="text-xs text-muted-foreground">
                          Gain access to exclusive features, oracles, and rewards
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Boost XP Earnings</h4>
                        <p className="text-xs text-muted-foreground">
                          Higher levels earn bonus XP multipliers on all activities
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Show Status</h4>
                        <p className="text-xs text-muted-foreground">
                          Display your level and title as a badge of honor
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Summon Level Milestones
              </h3>
              <div className="space-y-2">
                {[
                  { level: 5, title: "Vision Seeker", perk: "Unlock special oracle chat themes" },
                  { level: 10, title: "Prophecy Master", perk: "Exclusive oracle tier + Special oracle insights" },
                  { level: 15, title: "Fortune Sage", perk: "Custom oracle creation + Enhanced oracle responses" },
                  { level: 20, title: "Grand Oracle", perk: "All features + +20% XP & rewards + Platform legend status" },
                  { level: 25, title: "Deity of Prophecy", perk: "Maximum prestige + +50% all rewards + Ultimate legend status" },
                ].map((milestone) => (
                  <Card key={milestone.level} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">
                          Summon Lv {milestone.level}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{milestone.title}</p>
                          <p className="text-xs text-muted-foreground">{milestone.perk}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Earning XP Tab */}
          <TabsContent value="earning" className="space-y-6 mt-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Ways to Earn XP
              </h3>
              <div className="space-y-4">
                {/* Oracle Interactions */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Oracle Interactions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">First visit to an oracle</span>
                        <Badge variant="outline">+50 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Return visit to oracle</span>
                        <Badge variant="outline">+10 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Chat message</span>
                        <Badge variant="outline">+5 XP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Oracle Predictions */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      Oracle Predictions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ask for a prediction (first 5/day)</span>
                        <Badge variant="outline">+25 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ask for a prediction (6+/day, Master only)</span>
                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">+100 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Daily prediction streak bonus</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">+50 XP</Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <p className="text-xs font-medium mb-2">📊 Daily Prediction Limits:</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>• Summoner (Free):</span>
                          <span className="font-medium text-foreground">5 predictions/day @ 25 XP each</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>• Summon Master:</span>
                          <span className="font-medium text-purple-400">Unlimited @ 100 XP each (after 5)</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 <strong>Premium Power:</strong> Summon Master users earn 4x more XP per prediction after their 5th daily ask!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Activities */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Daily Activities
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Daily login</span>
                        <Badge variant="outline">+20 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Complete daily quest</span>
                        <Badge variant="outline">+100 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">3-day streak bonus</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">+50 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">7-day streak bonus</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">+150 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">30-day streak bonus</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">+500 XP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* House Activities */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      House Activities
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Join a house</span>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">+100 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">House contribution</span>
                        <Badge variant="outline">+40 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">House event participation</span>
                        <Badge variant="outline">+80 XP</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Plus earn +1.1x XP multiplier on all activities while in a house!
                    </p>
                  </CardContent>
                </Card>

                {/* Milestones & Social */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Milestones & Social
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subscribe to Summon Master</span>
                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">+1000 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">10 predictions asked</span>
                        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">+150 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">50 predictions asked</span>
                        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">+500 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">100 predictions asked</span>
                        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">+1000 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Share a prediction</span>
                        <Badge variant="outline">+15 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Invite a friend</span>
                        <Badge variant="outline">+200 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Friend joins via invite</span>
                        <Badge variant="outline" className="bg-green-500/10 border-green-500/30">+300 XP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Multipliers Tab */}
          <TabsContent value="multipliers" className="space-y-6 mt-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                XP Multipliers
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Multipliers stack together to boost your XP gains. The more bonuses you have active, the faster you level up!
              </p>

              <div className="space-y-4">
                {/* Subscription Tiers */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-500" />
                      Subscription Tiers
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Summoner (Free)</span>
                        <Badge variant="outline">1.0x</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Summon Master (Premium)</span>
                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">2.0x</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Summon Master subscribers earn double XP on all activities!
                    </p>
                  </CardContent>
                </Card>

                {/* Login Streaks */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Login Streaks
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">3+ day streak</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">1.1x</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">7+ day streak</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">1.2x</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">14+ day streak</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">1.3x</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">30+ day streak</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">1.5x</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* House Membership */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      House Membership & Roles
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Regular Member (Below Lv 20)</span>
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">1.1x</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Standard house benefits</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Officer (Lv 20-24)</span>
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">1.25x</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Can remove regular members (max 5/day)</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Leader (Lv 25+)</span>
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">1.5x</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Can remove officers & members (max 5/day)</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 p-2 rounded bg-muted/50">
                      💡 Roles are automatically assigned based on your Summon Level
                    </p>
                  </CardContent>
                </Card>

                {/* Example Calculation */}
                <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Example: Stacking Multipliers
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      With Summon Master subscription (2x) + 7-day streak (1.2x) + House membership (1.1x):
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Base XP for winning bet</span>
                        <Badge variant="outline">100 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total multiplier (2.0 × 1.2 × 1.1)</span>
                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">2.64x</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-foreground">Final XP earned</span>
                        <Badge variant="outline" className="bg-green-500/10 border-green-500/30">264 XP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Houses Tab */}
          <TabsContent value="houses" className="space-y-6 mt-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                House System & Season Rewards
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join a Great House to boost your XP and compete for massive season-end rewards!
              </p>

              {/* Immediate Benefits */}
              <Card className="border-border mb-4">
                <CardContent className="p-4">
                  <h4 className="mb-3">Immediate Benefits</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">+1.1x XP Multiplier</p>
                        <p className="text-xs text-muted-foreground">
                          Earn 10% more XP on all activities as soon as you join
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Gift className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Exclusive Quests</p>
                        <p className="text-xs text-muted-foreground">
                          Access house-only daily and weekly quests with bonus rewards
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Collaborative Predictions</p>
                        <p className="text-xs text-muted-foreground">
                          Pool insights with house members for better accuracy
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* House Roles & Permissions */}
              <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5 mb-4">
                <CardContent className="p-4">
                  <h4 className="mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-blue-500" />
                    House Roles & Permissions
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    As you level up, you automatically gain higher roles with better multipliers and management permissions:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">Regular Member</p>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">Below Lv 20</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +1.1x XP multiplier • Standard house benefits
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-blue-400">Officer</p>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">Lv 20-24</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +1.25x XP multiplier • Can remove regular members (max 5/day)
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-yellow-400">Leader</p>
                        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">Lv 25+</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +1.5x XP multiplier • Can remove officers & members (max 5/day)
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 p-2 rounded bg-muted/50">
                    ⚡ Pro tip: Roles update automatically when you reach the required level. The daily kick limit resets at midnight.
                  </p>
                </CardContent>
              </Card>

              {/* Season 1 Rewards */}
              <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                <CardContent className="p-4">
                  <h4 className="mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    Season 1 - The Summons: Final Rewards
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    At the end of Season 1 (November 30, 2025), ALL members of top houses receive a massive XP bonus based on house ranking:
                  </p>
                  <div className="space-y-2">
                    <Card className="border-border">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🥇</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">1st Place House</p>
                            <p className="text-xs text-muted-foreground">
                              All members get <strong>3x</strong> their total Season 1 XP added as bonus
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🥈</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">2nd Place House</p>
                            <p className="text-xs text-muted-foreground">
                              All members get <strong>2x</strong> their total Season 1 XP added as bonus
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🥉</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">3rd Place House</p>
                            <p className="text-xs text-muted-foreground">
                              All members get <strong>1.5x</strong> their total Season 1 XP added as bonus
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Example */}
              <Card className="border-border mt-4">
                <CardContent className="p-4">
                  <h4 className="mb-3">Example Scenario</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    You earn 10,000 XP during Season 1 and your house places 1st:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Season 1 XP</span>
                      <Badge variant="outline">10,000 XP</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">1st Place Bonus (3x)</span>
                      <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">+30,000 XP</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-foreground">Total XP Gained</span>
                      <Badge variant="outline" className="bg-green-500/10 border-green-500/30">40,000 XP</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    That's enough to jump multiple levels instantly!
                  </p>
                </CardContent>
              </Card>

              {/* House Switching Rules */}
              <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5 mt-4">
                <CardContent className="p-4">
                  <h4 className="mb-3">House Switching Rules</h4>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      To prevent excessive manipulation while allowing strategic choices:
                    </p>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-sm font-medium mb-2">✓ Switching Window: Launch - November 19</p>
                      <p className="text-xs text-muted-foreground">
                        You can switch houses up to <strong>3 times</strong> before November 20th. 
                        Use your switches wisely to find the best house for season-end rewards.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-sm font-medium mb-2">🔒 Lockout: November 20-30</p>
                      <p className="text-xs text-muted-foreground">
                        On November 20th, all house switching locks permanently until Season 1 ends. 
                        Your house at lockout determines your season-end rewards.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strategy Tips */}
              <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 mt-4">
                <CardContent className="p-4">
                  <h4 className="mb-3">Strategy Tips</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
                      <span>Join early to maximize the +1.1x multiplier benefit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
                      <span>Choose a house with active members for better collaboration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
                      <span>Monitor rankings closely as the season progresses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
                      <span>Use the final 10-day window strategically to switch to a winning house</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Got It!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
