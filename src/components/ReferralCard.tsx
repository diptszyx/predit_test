import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Users, Copy, CheckCircle, Gift, Zap, Trophy, Share2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { copyToClipboard } from "../lib/clipboardUtils";

interface ReferralCardProps {
  user: {
    id: string;
    username: string;
    referralCode?: string;
    referredFriends?: Array<{
      username: string;
      joinedAt: string;
      xpEarned: number;
      avatar?: string;
    }>;
  };
  onGenerateCode?: () => string;
  onAwardXP?: (amount: number, description: string) => void;
}

export function ReferralCard({ user, onGenerateCode, onAwardXP }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate referral code if not exists (format: USERNAME-XXXX)
  const referralCode = user.referralCode || 
    (onGenerateCode ? onGenerateCode() : 
    `${user.username.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  
  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  const referredCount = user.referredFriends?.length || 0;
  const totalXPFromReferrals = (user.referredFriends || []).reduce((sum, friend) => sum + 500, 0); // 200 invite + 300 join = 500 per friend

  const handleCopyToClipboard = async (text?: string) => {
    const textToCopy = text || referralLink;
    
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      toast.success("Referral link copied to clipboard!", {
        description: "Share it with friends to earn XP!"
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      // If both methods fail, show the text in a toast for manual copying
      toast.error("Unable to copy automatically", {
        description: "Please copy the link manually from the input field"
      });
    }
  };

  const shareViaTwitter = () => {
    const text = `Join me on Dehouse of Predictions - Get AI predictions from specialized prediction agents! Use my code: ${referralCode}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
    
    // Award XP for sharing (same as share_prediction)
    if (onAwardXP) {
      onAwardXP(15, 'Shared referral link');
    }
  };

  return (
    <Card className="border-border bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-blue-500" />
          Invite Friends & Earn XP
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-accent text-center">
            <div className="text-2xl mb-1">{referredCount}</div>
            <p className="text-xs text-muted-foreground">Friends Referred</p>
          </div>
          <div className="p-4 rounded-lg bg-accent text-center">
            <div className="text-2xl mb-1 text-blue-400">{totalXPFromReferrals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">XP from Referrals</p>
          </div>
          <div className="p-4 rounded-lg bg-accent text-center">
            <div className="text-2xl mb-1 text-blue-400">500</div>
            <p className="text-xs text-muted-foreground">XP per Referral</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <h4 className="text-sm font-medium mb-3">🎁 How Referral Rewards Work</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3 text-sm">
              <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 shrink-0">
                <Zap className="w-3 h-3 mr-1" />
                +200 XP
              </Badge>
              <span className="text-muted-foreground">You get 200 XP instantly when you share your referral link</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 shrink-0">
                <Trophy className="w-3 h-3 mr-1" />
                +300 XP
              </Badge>
              <span className="text-muted-foreground">You get 300 XP bonus when your friend creates an account</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-3 p-2 rounded bg-blue-500/10 border border-blue-500/20">
              <span className="text-lg">💎</span>
              <span className="text-muted-foreground">Your friend also gets <strong className="text-foreground">100 XP bonus</strong> when they sign up with your code!</span>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">Your Referral Code</label>
          <div className="flex gap-2">
            <Input 
              value={referralCode}
              readOnly
              className="font-mono text-center text-lg tracking-wider"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Referral Link Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">Referral Link</label>
          <div className="flex gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="text-sm"
            />
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCopyToClipboard}
            variant="outline"
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button
            onClick={shareViaTwitter}
            variant="outline"
            className="flex-1 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share on 𝕏
          </Button>
        </div>

        {/* Referred Friends List */}
        {referredCount > 0 && (
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Your Referred Friends ({referredCount})
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {user.referredFriends?.map((friend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent"
                >
                  <div className="flex items-center gap-3">
                    {friend.avatar ? (
                      <img 
                        src={friend.avatar} 
                        alt={friend.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">{friend.username}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(friend.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">
                    +500 XP
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Referrals Yet */}
        {referredCount === 0 && (
          <div className="border-t border-border pt-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center opacity-20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              No friends referred yet
            </p>
            <p className="text-xs text-muted-foreground">
              Share your code with friends and start earning XP together!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
