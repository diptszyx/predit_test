import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Sparkles, TrendingUp, Users, Calendar, Zap } from "lucide-react";

interface XPInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function XPInfoDialog({ open, onOpenChange }: XPInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            How XP & Leveling Works
          </DialogTitle>
          <DialogDescription>
            Earn XP to level up and unlock new perks on your journey through the Dehouse of Predictions
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="pr-4 max-h-[60vh]">
          <div className="space-y-6">
            {/* Earning XP */}
            <div>
              <h3 className="flex items-center gap-2 mb-3 text-blue-600">
                <TrendingUp className="h-4 w-4" />
                Ways to Earn XP
              </h3>
              <div className="space-y-3 text-sm">
                {/* Prediction XP - Primary Source */}
                <div className="p-3 rounded-lg bg-blue-600/5 border border-blue-600/20">
                  <div className="mb-2">
                    <div className="text-blue-600 font-medium mb-1">🔮 Ask for Prediction (Scales with Progress)</div>
                    <div className="text-xs text-muted-foreground mb-2">XP increases as you make more predictions</div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prediction #1:</span>
                      <span className="text-foreground">15 XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prediction #10:</span>
                      <span className="text-foreground">23 XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prediction #100:</span>
                      <span className="text-foreground">30 XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prediction #1000+:</span>
                      <span className="text-foreground">37 XP</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>• Basic (Free):</span>
                        <span className="font-medium text-foreground">5 predictions/day</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• Pro:</span>
                        <span className="font-medium text-blue-600">Unlimited predictions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Activities */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="text-muted-foreground">Complete Quest</div>
                    <div className="text-blue-600">+150 XP</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="text-muted-foreground">Invite Friend</div>
                    <div className="text-blue-600">+200 XP</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="text-muted-foreground">Friend Joins</div>
                    <div className="text-blue-600">+300 XP</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="text-muted-foreground">Subscribe to Pro</div>
                    <div className="text-blue-600">+1,500 XP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multipliers */}
            <div>
              <h3 className="flex items-center gap-2 mb-3 text-blue-600">
                <Zap className="h-4 w-4" />
                XP Multipliers
              </h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="mb-1">🎯 <span className="text-muted-foreground">Pro Subscription</span></div>
                  <div className="text-blue-600">2x XP on all activities</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="mb-1">🔥 <span className="text-muted-foreground">Daily Streaks</span></div>
                  <div className="text-blue-600">3 days: 1.1x • 7 days: 1.2x • 14 days: 1.3x • 30 days: 1.5x</div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="flex items-center gap-2 mb-3 text-blue-600">
                <Users className="h-4 w-4" />
                Prediction Milestones
              </h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-card border border-border text-center">
                    <div className="text-muted-foreground text-xs">10 Predictions</div>
                    <div className="text-blue-600">+250 XP</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border text-center">
                    <div className="text-muted-foreground text-xs">50 Predictions</div>
                    <div className="text-blue-600">+750 XP</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border text-center">
                    <div className="text-muted-foreground text-xs">100 Predictions</div>
                    <div className="text-blue-600">+1,500 XP</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-card border border-border text-center">
                    <div className="text-muted-foreground text-xs">3-Day Streak</div>
                    <div className="text-blue-600">+100 XP</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border text-center">
                    <div className="text-muted-foreground text-xs">7-Day Streak</div>
                    <div className="text-blue-600">+250 XP</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border text-center">
                    <div className="text-muted-foreground text-xs">30-Day Streak</div>
                    <div className="text-blue-600">+750 XP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leveling System */}
            <div>
              <h3 className="flex items-center gap-2 mb-3 text-blue-600">
                <Calendar className="h-4 w-4" />
                Level Progression
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground text-xs mb-3">
                  Levels are based on prediction count: Every 100 predictions = 1 level
                </p>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">0-99 predictions</span>
                      <span className="text-blue-600">Level 1</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">100-199 predictions</span>
                      <span className="text-blue-600">Level 2</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">200-299 predictions</span>
                      <span className="text-blue-600">Level 3</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">1000+ predictions</span>
                      <span className="text-blue-600">Level 11+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Progression */}
            <div>
              <h3 className="mb-3 text-blue-600">
                Example Progression
              </h3>
              <div className="space-y-3 text-sm">
                {/* Basic User */}
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="font-medium mb-2 flex items-center justify-between">
                    <span>Basic User (Free)</span>
                    <span className="text-xs text-muted-foreground">5 predictions/day</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Daily XP (avg ~20 XP/prediction):</span>
                      <span className="text-foreground">~100 XP/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reach Level 2 (100 predictions):</span>
                      <span className="text-foreground">20 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reach Level 5 (400 predictions):</span>
                      <span className="text-foreground">80 days</span>
                    </div>
                  </div>
                </div>

                {/* Pro User */}
                <div className="p-3 rounded-lg bg-blue-600/5 border border-blue-600/20">
                  <div className="font-medium mb-2 flex items-center justify-between">
                    <span className="text-blue-600">Pro User (Premium)</span>
                    <span className="text-xs text-blue-600">Unlimited predictions</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>With 2x multiplier (10 predictions/day):</span>
                      <span className="text-foreground">~400 XP/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reach Level 2 (100 predictions):</span>
                      <span className="text-blue-600">10 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reach Level 5 (400 predictions):</span>
                      <span className="text-blue-600">40 days</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border text-blue-600">
                      Levels up 2x faster due to XP multiplier
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="p-4 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <p className="text-sm text-blue-600">
                💡 <span>Pro Tip:</span> Stack multipliers for maximum XP! A Pro subscriber with a 30-day streak can earn up to <span className="font-medium">3x XP</span> on all activities.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
