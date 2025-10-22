import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check, Sparkles, Crown, Rocket, Zap, TrendingUp, Star, Award } from "lucide-react";
import { subscriptionTiers, mockUser } from "../lib/mockData";
import type { User } from "../lib/types";

interface SubscriptionPageProps {
  onBack?: () => void;
  user?: User | null;
  updateUser?: (updates: Partial<User>) => void;
}

export function SubscriptionPage({ onBack, user, updateUser }: SubscriptionPageProps) {
  const currentTier = user?.subscriptionTier || "free";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400">Accelerate Your XP Journey</span>
        </div>
        <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Level Up Faster
        </h1>
        <p className="text-lg text-muted-foreground">
          Unlock XP multipliers, exclusive features, and premium oracles to reach legendary status faster
        </p>
      </div>

      {/* XP Multiplier Showcase */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl mb-2 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              XP Multiplier Benefits
            </h3>
            <p className="text-sm text-muted-foreground">
              Earn bonus XP on every action with Summon Master subscription
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-background border border-border">
              <div className="text-3xl mb-3">1.0x</div>
              <div className="text-sm mb-2">Summoner</div>
              <div className="text-xs text-muted-foreground">Standard XP rate</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <div className="text-3xl mb-3 text-purple-400">2.0x</div>
              <div className="text-sm mb-2">Summon Master</div>
              <div className="text-xs text-muted-foreground">Double XP on all actions!</div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-center">
              <strong>Example:</strong> Ask for a prediction (25 XP) → Summon Masters earn <strong>50 XP</strong> instead!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {subscriptionTiers.map((tier, index) => {
          const icons = [Sparkles, Crown];
          const Icon = icons[index];
          const isCurrentTier = tier.id === currentTier;

          return (
            <Card
              key={tier.id}
              className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                tier.popular
                  ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20 scale-105"
                  : "border-border"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-4 py-1 rounded-bl-lg">
                  RECOMMENDED
                </div>
              )}

              <CardContent className="p-8">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Tier Name */}
                <h3 className="text-3xl mb-2">{tier.name}</h3>

                {/* Price */}
                <div className="mb-6">
                  {tier.price === 0 ? (
                    <div>
                      <div className="text-4xl">Free</div>
                      <div className="flex items-center gap-2 mt-3">
                        <Zap className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-muted-foreground">1.0x XP</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {tier.originalPrice && (
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl text-muted-foreground line-through decoration-2">
                            ${tier.originalPrice}
                          </span>
                          <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 animate-pulse">
                            50% OFF
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl">${tier.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Zap className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-purple-400">2.0x XP Multiplier</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isCurrentTier ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      tier.popular
                        ? `bg-gradient-to-r ${tier.color} text-white hover:opacity-90`
                        : ""
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.price === 0 ? "Stay Free" : "Upgrade Now"}
                  </Button>
                )}

                {tier.id === "master" && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    🚀 Level up 2x faster than Summoners
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl text-center mb-8">Why Upgrade?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="mb-2">Accelerated XP Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn 2x XP on every action. Reach legendary levels and unlock exclusive perks twice as fast as Summoners
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="mb-2">Unlimited Predictions</h3>
                  <p className="text-sm text-muted-foreground">
                    No daily limits on predictions. Free users get 5 predictions per day. Summon Masters get unlimited predictions to maximize XP earning and house contributions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="mb-2">Faster Level Progression</h3>
                  <p className="text-sm text-muted-foreground">
                    Reach Level 10, 15, 20, and 25 milestones faster to unlock exclusive features and platform privileges
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="mb-2">Boost House Rankings</h3>
                  <p className="text-sm text-muted-foreground">
                    Your XP multiplier helps your house climb the leaderboard. More XP = better season-end rewards for everyone
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="mb-2">Priority Support & Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Get priority customer support, early access to new features, and help shape the future of the platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* XP Comparison */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl text-center mb-6">XP Earning Comparison</h2>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Action</th>
                    <th className="text-center py-3 px-4">Summoner (1.0x)</th>
                    <th className="text-center py-3 px-4">Summon Master (2.0x)</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">Ask for a Prediction (first 5/day)</td>
                    <td className="text-center py-3 px-4">25 XP</td>
                    <td className="text-center py-3 px-4 text-purple-400">50 XP</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">Ask for a Prediction (6+/day)</td>
                    <td className="text-center py-3 px-4 text-muted-foreground/50">N/A</td>
                    <td className="text-center py-3 px-4 text-purple-400">100 XP</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">Complete Daily Quest</td>
                    <td className="text-center py-3 px-4">100 XP</td>
                    <td className="text-center py-3 px-4 text-purple-400">200 XP</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">7-Day Streak Bonus</td>
                    <td className="text-center py-3 px-4">150 XP</td>
                    <td className="text-center py-3 px-4 text-purple-400">300 XP</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">House Contribution</td>
                    <td className="text-center py-3 px-4">40 XP</td>
                    <td className="text-center py-3 px-4 text-purple-400">80 XP</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-foreground">Total (1 week active)</td>
                    <td className="text-center py-3 px-4 font-medium">~2,000 XP</td>
                    <td className="text-center py-3 px-4 font-medium text-purple-400">~5,000 XP</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * All XP multipliers stack with house bonuses (+1.1x) and streak bonuses for even faster progression
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl text-center mb-6">Frequently Asked Questions</h2>
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="mb-2 text-sm">How do XP multipliers work?</h3>
              <p className="text-sm text-muted-foreground">
                XP multipliers are applied to ALL XP-earning actions on the platform. For example, if you make a prediction (25 base XP) with Summon Master tier (2.0x), you'll earn 50 XP instead. Multipliers stack with house bonuses and streaks!
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm">What happens to my XP if I downgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Your XP and level are permanent! You'll keep all progress you've made. The multiplier only affects future XP earning, so you'll just earn XP at the normal rate if you downgrade.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. Cancel your subscription at any time with no penalties. You'll keep access until the end of your billing period, and all earned XP is permanent.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm">Do higher levels unlock more features?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Reaching Level 5, 10, 15, 20, and 25 unlocks special perks like exclusive oracle themes, unique profile badges, and platform legend status. Premium subscriptions help you reach these milestones much faster.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
