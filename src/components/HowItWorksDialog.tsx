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
  Target,
  TrendingUp,
  Flame,
  Crown,
  Sparkles,
  Award,
  Info,
  Calculator
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
            <Info className="w-6 h-6 text-blue-500" />
            How the XP & Level System Works
          </DialogTitle>
          <DialogDescription>
            Everything you need to know about earning XP and leveling up
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earning">Earning XP</TabsTrigger>
            <TabsTrigger value="multipliers">Multipliers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Summary */}
            <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Quick Summary
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Earn XP through oracle consultations and daily activities.
                    Your level is determined by your total prediction count: <strong>Level = floor(Predictions ÷ 100) + 1</strong>.
                    Multiply your XP gains with <strong>Pro subscription</strong> (2x) and daily login streaks!
                  </p>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                What is XP?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Experience Points (XP) are earned by engaging with the Predit of Predictions platform through consultations
                and daily activities. The more you participate, the more XP you earn. XP helps you:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Track Your Progress</h4>
                        <p className="text-xs text-muted-foreground">
                          See how much you've engaged with the platform
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
                        <h4 className="text-sm mb-1">Climb the Leaderboard</h4>
                        <p className="text-xs text-muted-foreground">
                          Compete with other users for the top spot
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
                        <h4 className="text-sm mb-1">Level Up</h4>
                        <p className="text-xs text-muted-foreground">
                          Your level increases automatically as you make predictions
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
                          Display your level as a badge of honor
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-500" />
                Level Calculation
              </h3>
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm mb-2">Your level is based entirely on prediction count:</h4>
                      <div className="p-3 rounded bg-muted/50 border border-border">
                        <code className="text-sm text-blue-400">Level = floor(Total Predictions ÷ 100) + 1</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Examples:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">0-99 predictions</span>
                          <Badge variant="outline" className="text-xs">Level 1</Badge>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">100-199 predictions</span>
                          <Badge variant="outline" className="text-xs">Level 2</Badge>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">200-299 predictions</span>
                          <Badge variant="outline" className="text-xs">Level 3</Badge>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">1000+ predictions</span>
                          <Badge variant="outline" className="text-xs">Level 11+</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      💡 There is no level cap - keep making predictions to reach higher levels!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                XP Per Prediction (Scaling Curve)
              </h3>
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm mb-2">XP earned per prediction increases gradually:</h4>
                      <div className="p-3 rounded bg-muted/50 border border-border">
                        <code className="text-xs text-blue-400">XP = baseXP × (1 + log₁₀(totalPredictionCount + 1) × 0.5)</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">XP scaling examples (baseXP = 15):</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Prediction #1</span>
                          <Badge variant="outline" className="text-xs">15 XP</Badge>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Prediction #10</span>
                          <Badge variant="outline" className="text-xs">23 XP</Badge>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Prediction #50</span>
                          <Badge variant="outline" className="text-xs">26 XP</Badge>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Prediction #100</span>
                          <Badge variant="outline" className="text-xs">30 XP</Badge>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Prediction #500</span>
                          <Badge variant="outline" className="text-xs">35 XP</Badge>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Prediction #1000+</span>
                          <Badge variant="outline" className="text-xs">37 XP</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      💡 The more predictions you make, the more XP each one is worth!
                    </p>
                  </div>
                </CardContent>
              </Card>
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
                {/* Oracle Predictions */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      Oracle Predictions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ask for a prediction (1-5 per day)</span>
                        <Badge variant="outline">15-37 XP (scales)</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ask for a prediction (6+/day, Pro only)</span>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">30-74 XP (scales)</Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <p className="text-xs font-medium mb-2">📊 Daily Prediction Limits:</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>• Basic (Free):</span>
                          <span className="font-medium text-foreground">5 predictions/day</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>• Pro:</span>
                          <span className="font-medium text-blue-400">Unlimited predictions</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Streak Bonuses */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Daily Streak Bonuses
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">3-day streak bonus</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">+100 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">7-day streak bonus</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">+250 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">30-day streak bonus</span>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30">+750 XP</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      💡 Maintain your daily prediction streak to unlock bonus XP!
                    </p>
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Prediction Milestones
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">10 predictions asked</span>
                        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">+250 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">50 predictions asked</span>
                        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">+750 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">100 predictions asked</span>
                        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">+1,500 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subscribe to Pro</span>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">+1,500 XP</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      🎯 Achieve prediction milestones to earn big bonus XP rewards!
                    </p>
                  </CardContent>
                </Card>

                {/* Daily Activities */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      Daily Activities
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Complete a daily quest</span>
                        <Badge variant="outline">+150 XP</Badge>
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
                      <Crown className="w-4 h-4 text-blue-500" />
                      Subscription Tiers
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Basic (Free)</span>
                        <Badge variant="outline">1.0x</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pro (Premium)</span>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">2.0x</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Pro subscribers earn double XP on all activities!
                    </p>
                  </CardContent>
                </Card>

                {/* Login Streaks */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Login Streak Multipliers
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
                    <p className="text-xs text-muted-foreground mt-3">
                      💡 Keep your streak alive to maximize your XP gains!
                    </p>
                  </CardContent>
                </Card>

                {/* Example Calculation */}
                <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Example: Stacking Multipliers
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      With Pro subscription (2x) + 7-day streak (1.2x):
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Base XP for prediction</span>
                        <Badge variant="outline">30 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total multiplier (2.0 × 1.2)</span>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">2.4x</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-foreground">Final XP earned</span>
                        <Badge variant="outline" className="bg-green-500/10 border-green-500/30">72 XP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
