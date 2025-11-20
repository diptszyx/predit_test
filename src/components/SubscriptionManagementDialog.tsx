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
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Crown,
  CreditCard,
  Wallet,
  Check,
  ArrowLeft,
  Loader2,
  Sparkles,
  Info,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { subscriptionService } from "../services/subscription.service";

interface SubscriptionManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // currentTier: 'free' | 'master';
  isUserPro?: boolean
  onSubscriptionSuccess?: () => void;
}

type PaymentMethod = 'stripe' | 'crypto';
type SubscriptionView = 'overview' | 'payment' | 'manage' | 'processing' | 'success';

export function SubscriptionManagementDialog({
  open,
  onOpenChange,
  // currentTier,
  isUserPro,
  onSubscriptionSuccess
}: SubscriptionManagementDialogProps) {
  const [view, setView] = useState<SubscriptionView>('overview');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);

  // Stripe form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Crypto payment state
  const [cryptoAddress] = useState('mn7U5A7qmB42JiuJ3MNJpiDvRQK9zQc4Tu');
  const [selectedCrypto, setSelectedCrypto] = useState<'usdc' | 'eth' | 'sol'>('usdc');

  const isPro = isUserPro

  const handleClose = () => {
    setView('overview');
    // setPaymentMethod('stripe');
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleSubscribe = async () => {
    // setView('payment');
    try {
      await subscriptionService.upgradeToPro()
    } catch (error) {
      console.error('Failed to handle payment', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    // setView('success');

    // Show success toast
    // toast.success("Successfully upgraded to Pro!", {
    //   description: "You now have unlimited predictions and 2x XP multiplier!"
    // });

    // Wait a bit then close and trigger callback
    setTimeout(() => {
      handleClose();
      if (onSubscriptionSuccess) {
        onSubscriptionSuccess();
      }
    }, 2000);
  };

  const handleCancelSubscription = async () => {
    // setIsProcessing(true);

    // // Simulate cancellation
    // await new Promise(resolve => setTimeout(resolve, 1500));

    // setIsProcessing(false);
    // toast.success("Subscription cancelled", {
    //   description: "You'll retain Pro access until the end of your billing period."
    // });
    handleClose();
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {view === 'overview' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-400" />
                {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
              </DialogTitle>
              <DialogDescription>
                {isPro
                  ? 'Manage your Pro subscription and billing information'
                  : 'Unlock unlimited predictions and premium features'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {!isPro && (
                <>
                  {/* Pricing Display */}
                  <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-2xl text-muted-foreground line-through">$19.99/mo</span>
                      <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">75% OFF</Badge>
                    </div>
                    <p className="text-5xl mb-2">$4.99<span className="text-xl text-muted-foreground">/month</span></p>
                    {/* <p className="text-sm text-muted-foreground">Cancel anytime</p> */}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      What's included:
                    </h4>
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm">Unlimited Predictions</p>
                          <p className="text-xs text-muted-foreground">No daily or total limits</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm">2x XP Multiplier</p>
                          <p className="text-xs text-muted-foreground">Level up twice as fast on all actions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-400">+1,500 XP Bonus</p>
                          <p className="text-xs text-muted-foreground">Instant XP boost when you subscribe</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm">Priority AI Responses</p>
                          <p className="text-xs text-muted-foreground">Faster oracle processing</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubscribe}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 cursor-pointer"
                    size="lg"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Continue to Payment
                  </Button>
                </>
              )}

              {isPro && (
                <>
                  {/* Current Subscription Status */}
                  <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4>Pro Subscription</h4>
                          <p className="text-sm text-muted-foreground">$4.99/month</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Active
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="flex items-center gap-2">
                          <Wallet className="w-5 h-5" />
                          Cryptocurrency
                        </span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Billing Date</span>
                        <span>November 28, 2025</span>
                      </div> */}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="text-green-400">Auto-renew enabled</span>
                      </div>
                    </div>
                  </div>

                  {/* Management Options */}
                  {/* <div className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => setView('payment')}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Update Payment Method
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={handleCancelSubscription}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Cancel Subscription'
                      )}
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 flex gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      If you cancel, you'll retain Pro access until the end of your current billing period.
                    </p>
                  </div> */}
                </>
              )}
            </div>
          </>
        )}

        {view === 'payment' && (
          <>
            <DialogHeader>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('overview')}
                className="w-fit mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <DialogTitle>Payment Method</DialogTitle>
              <DialogDescription>
                Choose how you'd like to pay for your Pro subscription
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              {/* Payment Method Selection */}
              {/* <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}> */}
              <div className="space-y-2">
                {/* <div
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'stripe'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-border bg-muted/30 hover:border-blue-500/50'
                      }`}
                    onClick={() => setPaymentMethod('stripe')}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe" className="cursor-pointer flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <div>
                          <p>Credit/Debit Card</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                        </div>
                      </Label>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">
                      Recommended
                    </Badge>
                  </div> */}

                <div
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${paymentMethod === 'crypto'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-border bg-muted/30 hover:border-blue-500/50'
                    }`}
                  onClick={() => setPaymentMethod('crypto')}
                >
                  <div className="flex items-center gap-3">
                    {/* <RadioGroupItem value="crypto" id="crypto" /> */}
                    <Label htmlFor="crypto" className="cursor-pointer flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      <div>
                        <p>Cryptocurrency</p>
                        <p className="text-xs text-muted-foreground">USDC, ETH, SOL</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
              {/* </RadioGroup> */}

              <Separator />

              {/* Stripe Payment Form */}
              {/* {paymentMethod === 'stripe' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 flex gap-2 text-xs text-muted-foreground">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Your payment is secured by Stripe. We never store your card details.</p>
                  </div>
                </div>
              )} */}

              {/* Crypto Payment Form */}
              {paymentMethod === 'crypto' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Select Cryptocurrency</Label>
                    <RadioGroup value={selectedCrypto} onValueChange={(v) => setSelectedCrypto(v as any)}>
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${selectedCrypto === 'usdc' ? 'border-blue-500 bg-blue-500/10' : 'border-border'
                          }`}
                        onClick={() => setSelectedCrypto('usdc')}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="usdc" id="usdc" />
                          <Label htmlFor="usdc" className="cursor-pointer">
                            <p>USDC (USD Coin)</p>
                            <p className="text-xs text-muted-foreground">$4.99 USDC</p>
                          </Label>
                        </div>
                        <Badge variant="outline">Stablecoin</Badge>
                      </div>

                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${selectedCrypto === 'eth' ? 'border-blue-500 bg-blue-500/10' : 'border-border'
                          }`}
                        onClick={() => setSelectedCrypto('eth')}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="eth" id="eth" />
                          <Label htmlFor="eth" className="cursor-pointer">
                            <p>Ethereum (ETH)</p>
                            <p className="text-xs text-muted-foreground">~0.0015 ETH</p>
                          </Label>
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${selectedCrypto === 'sol' ? 'border-blue-500 bg-blue-500/10' : 'border-border'
                          }`}
                        onClick={() => setSelectedCrypto('sol')}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="sol" id="sol" />
                          <Label htmlFor="sol" className="cursor-pointer">
                            <p>Solana (SOL)</p>
                            <p className="text-xs text-muted-foreground">~0.025 SOL</p>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Payment Address</Label>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-2">Send payment to:</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm break-all">{cryptoAddress}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(cryptoAddress);
                            toast.success("Address copied to clipboard");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="text-yellow-500">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Send the exact amount shown above</li>
                        <li>Your subscription will activate after 3 network confirmations</li>
                        <li>This typically takes 5-15 minutes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handlePaymentSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
                size="lg"
                disabled={isProcessing || (paymentMethod === 'stripe' && (!cardNumber || !expiryDate || !cvv || !cardholderName))}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'stripe' ? 'Subscribe Now - $4.99/mo' : 'I\'ve Sent the Payment'}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By subscribing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </>
        )}

        {view === 'success' && (
          <div className="py-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl mb-2">Welcome to Pro! 🎉</h3>
                <p className="text-muted-foreground">
                  You now have unlimited predictions and 2x XP multiplier
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                <p className="text-sm mb-1">You've earned</p>
                <p className="text-3xl text-yellow-400">+1,500 XP</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
