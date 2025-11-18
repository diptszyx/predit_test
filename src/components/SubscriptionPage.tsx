import { Bitcoin, Check, CheckCircle2, Crown, Loader2, Lock, Sparkles, Trophy, X, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { subscriptionTiers } from "../lib/mockData";
import type { User } from "../lib/types";
import { subscriptionService } from "../services/subscription.service";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface SubscriptionPageProps {
  user?: User | null;
  onOpenWalletDialog?: () => void;
  onSubscriptionSuccess?: () => void;
}

type PaymentMethod = "card" | "crypto" | "wallet";

export function SubscriptionPage({ user, onOpenWalletDialog, onSubscriptionSuccess }: SubscriptionPageProps) {
  const isUserPro = user?.isPro;
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("crypto");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const handleUpgrade = () => {
    // In a real app, this would open a payment dialog
    if (!user) {
      onOpenWalletDialog?.();
    } else {
      // Show payment dialog
      setPaymentDialogOpen(true);
      setPaymentSuccess(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on payment method
    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        toast.error("Please fill in all card details");
        return;
      }

      // Basic card number validation (should be 16 digits)
      const cleanCardNumber = cardNumber.replace(/\s/g, "");
      if (cleanCardNumber.length !== 16) {
        toast.error("Please enter a valid card number");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    // await new Promise((resolve) => setTimeout(resolve, 2500));

    // setIsProcessing(false);
    // setPaymentSuccess(true);

    // // Wait a moment to show success state
    // setTimeout(() => {
    //   setPaymentDialogOpen(false);

    //   // Call the success callback
    //   if (onSubscriptionSuccess) {
    //     onSubscriptionSuccess();
    //   }

    //   // Reset form
    //   setCardNumber("");
    //   setCardExpiry("");
    //   setCardCvc("");
    //   setCardName("");
    //   setPaymentSuccess(false);
    // }, 1500);

    try {
      await subscriptionService.upgradeToPro()
    } catch (error) {
      console.error('Failed to handle payment', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <>
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {!paymentSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-blue-500" />
                  Upgrade to Pro
                </DialogTitle>
                <DialogDescription>
                  Choose your payment method and complete your upgrade to unlock unlimited predictions and 2x XP.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="grid grid-cols-3 gap-3"
                  >
                    {/* <div>
                      <RadioGroupItem
                        value="card"
                        id="card"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                      >
                        <CreditCard className="w-6 h-6 mb-2" />
                        <span className="text-sm">Card</span>
                      </Label>
                    </div> */}

                    <div>
                      <RadioGroupItem
                        value="crypto"
                        id="crypto"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="crypto"
                        className="flex flex-col items-center justify-between rounded-lg border-2 bg-blue-500/10 p-4 border border-blue-500/30"
                      >
                        <Bitcoin className="w-6 h-6 mb-2" />
                        <span className="text-sm">Crypto</span>
                      </Label>
                    </div>

                    {/* <div>
                      <RadioGroupItem
                        value="wallet"
                        id="wallet"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="wallet"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                      >
                        <Wallet className="w-6 h-6 mb-2" />
                        <span className="text-sm">Wallet</span>
                      </Label>
                    </div> */}
                  </RadioGroup>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          if (formatted.replace(/\s/g, "").length <= 16) {
                            setCardNumber(formatted);
                          }
                        }}
                        maxLength={19}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            const formatted = formatExpiry(e.target.value);
                            if (formatted.replace(/\D/g, "").length <= 4) {
                              setCardExpiry(formatted);
                            }
                          }}
                          maxLength={5}
                          disabled={isProcessing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 3) {
                              setCardCvc(value);
                            }
                          }}
                          maxLength={3}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Crypto Payment Info */}
                {paymentMethod === "crypto" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-sm mb-3">
                        Send payment to the following address:
                      </p>
                      <div className="bg-background p-3 rounded border border-border">
                        <code className="text-xs break-all">
                          mn7U5A7qmB42JiuJ3MNJpiDvRQK9zQc4Tu
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        We accept BTC, ETH, USDC, and other major cryptocurrencies
                      </p>
                    </div>
                  </div>
                )}

                {/* Wallet Payment Info */}
                {paymentMethod === "wallet" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-sm mb-3">
                        Connect your wallet to complete the payment
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• MetaMask</p>
                        <p>• Phantom</p>
                        <p>• Backpack</p>
                        <p>• WalletConnect</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t border-border pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pro Plan</span>
                    <span className="text-sm">$19.99/month</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Early Bird Discount</span>
                    <span className="text-sm text-green-500">-$15.00</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-semibold">$4.99/month</span>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPaymentDialogOpen(false)}
                    disabled={isProcessing}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Complete Payment
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <DialogTitle className="text-2xl">Payment Successful!</DialogTitle>
              <DialogDescription>
                Welcome to Pro! You now have unlimited predictions and 2x XP. 🎉
              </DialogDescription>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Bar - Mobile only */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-48 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-semibold">Subscription</span>
            </div>
          </div>
        </div>

        {/* Spacer for fixed header on mobile */}
        <div className="md:hidden h-14" />

        {/* Page Title - Desktop only */}
        <div className="hidden md:flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Crown className="w-7 h-7 text-primary" />
            <h1 className="text-3xl">Subscription Plans</h1>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 py-6">
          <h2 className="text-2xl md:text-4xl">
            Unlock the Full Power of AI Predictions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you. Upgrade anytime to get unlimited predictions,
            2x XP multiplier, and exclusive features.
          </p>
        </div>

        {/* Current Tier Status */}
        {user && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                    {isUserPro ? (
                      <Crown className="w-6 h-6 text-white" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <h3 className="text-xl">
                      {isUserPro ? "Pro" : "Basic"}
                    </h3>
                  </div>
                </div>
                {!isUserPro && (
                  <Button
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {subscriptionTiers.map((tier) => {
            const isCurrentTier = tier.isPro === isUserPro;
            const isPro = tier.id === "master";

            return (
              <Card
                key={tier.id}
                className={`relative ${isPro
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-border"
                  }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                      <Trophy className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}
                    >
                      {isPro ? (
                        <Crown className="w-8 h-8 text-white" />
                      ) : (
                        <Sparkles className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {isPro
                      ? "Perfect for serious prediction enthusiasts"
                      : "Get started with basic features"}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl">${tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {tier.originalPrice && (
                      <div className="mt-1">
                        <span className="text-sm text-muted-foreground line-through">
                          ${tier.originalPrice}/month
                        </span>
                        <Badge variant="outline" className="ml-2 text-green-500 border-green-500">
                          75% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features List */}
                  <div className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Additional features for Basic (shown as not included) */}
                  {!isPro && (
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-start gap-3 opacity-50">
                        <div className="mt-0.5">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          2x XP multiplier
                        </span>
                      </div>
                      <div className="flex items-start gap-3 opacity-50">
                        <div className="mt-0.5">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Priority AI responses
                        </span>
                      </div>
                      <div className="flex items-start gap-3 opacity-50">
                        <div className="mt-0.5">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Early access to new agents
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-4">
                    {isCurrentTier ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : isPro ? (
                      <Button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        Free Forever
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Basic</th>
                    <th className="text-center py-3 px-4 bg-primary/5">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Total Predictions</td>
                    <td className="text-center py-3 px-4">5</td>
                    <td className="text-center py-3 px-4 bg-primary/5">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">AI Agent Access</td>
                    <td className="text-center py-3 px-4">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4 bg-primary/5">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Conversations</td>
                    <td className="text-center py-3 px-4">Basic</td>
                    <td className="text-center py-3 px-4 bg-primary/5">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">XP Multiplier</td>
                    <td className="text-center py-3 px-4">1x</td>
                    <td className="text-center py-3 px-4 bg-primary/5">2x</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Priority Responses</td>
                    <td className="text-center py-3 px-4">
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4 bg-primary/5">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Community Access</td>
                    <td className="text-center py-3 px-4">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4 bg-primary/5">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Early Access to New Agents</td>
                    <td className="text-center py-3 px-4">
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4 bg-primary/5">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have access
                until the end of your current billing period.
              </p>
            </div>
            <div>
              <h4 className="mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, cryptocurrency payments, and wallet-based payments
                through MetaMask, Phantom, and other supported wallets.
              </p>
            </div>
            <div>
              <h4 className="mb-2">How does the 2x XP multiplier work?</h4>
              <p className="text-sm text-muted-foreground">
                Pro members earn double XP for all activities, helping you level up faster and climb
                the leaderboard more quickly.
              </p>
            </div>
            <div>
              <h4 className="mb-2">What happens to my data if I downgrade?</h4>
              <p className="text-sm text-muted-foreground">
                All your prediction history, XP, and level progress are preserved. You'll just be
                limited to the Basic tier features until you upgrade again.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        {!user && (
          <Card className="mt-8 border-primary/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <CardContent className="p-8 text-center space-y-4">
              <h3 className="text-2xl">Ready to get started?</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Sign up now to start making predictions and earning XP.
                No credit card required for the Basic plan.
              </p>
              <Button
                onClick={onOpenWalletDialog}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mobile bottom padding */}
        <div className="md:hidden h-20" />
      </div>
    </>
  );
}
