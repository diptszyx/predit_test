import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Wallet, CheckCircle2, Upload, User, Mail, Phone, Camera } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (wallet: WalletType) => void;
  onSocialConnect: (provider: SocialProvider) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export type WalletType = "metamask" | "phantom" | "backpack";
export type SocialProvider = "google" | "apple";

interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  icon: string;
  color: string;
  supported: boolean;
}

interface SocialOption {
  id: SocialProvider;
  name: string;
  icon: string;
  color: string;
}

const wallets: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect with MetaMask wallet",
    icon: "🦊",
    color: "from-orange-600 to-yellow-600",
    supported: true,
  },
  {
    id: "phantom",
    name: "Phantom",
    description: "Connect with Phantom wallet",
    icon: "👻",
    color: "from-purple-600 to-pink-600",
    supported: true,
  },
  {
    id: "backpack",
    name: "Backpack",
    description: "Connect with Backpack wallet",
    icon: "🎒",
    color: "from-blue-600 to-cyan-600",
    supported: true,
  },
];

const socialOptions: SocialOption[] = [
  {
    id: "google",
    name: "Continue with Google",
    icon: "🔍",
    color: "hover:bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "apple",
    name: "Continue with Apple",
    icon: "🍎",
    color: "hover:bg-gray-500/10 border-gray-500/30",
  },
];

export function WalletConnectDialog({ open, onOpenChange, onConnect, onSocialConnect, onOpenPrivacy, onOpenTerms }: WalletConnectDialogProps) {
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null);
  const [connectingSocial, setConnectingSocial] = useState<SocialProvider | null>(null);
  const [step, setStep] = useState<'connect' | 'profile'>('connect');
  const [profileData, setProfileData] = useState({
    avatar: '',
    email: '',
    phone: '',
  });
  const [connectedMethod, setConnectedMethod] = useState<WalletType | SocialProvider | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = async (walletType: WalletType) => {
    setConnectingWallet(walletType);
    
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setConnectingWallet(null);
    setConnectedMethod(walletType);
    setStep('profile');
  };

  const handleSocialConnect = async (provider: SocialProvider) => {
    setConnectingSocial(provider);
    
    // Simulate social login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setConnectingSocial(null);
    setConnectedMethod(provider);
    setStep('profile');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result as string }));
        toast.success("Avatar uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileComplete = () => {
    // Validate email if provided
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone if provided
    if (profileData.phone && !/^\+?[\d\s-()]+$/.test(profileData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Complete the connection
    if (connectedMethod && ['metamask', 'phantom', 'backpack'].includes(connectedMethod)) {
      onConnect(connectedMethod as WalletType);
    } else if (connectedMethod && ['google', 'apple'].includes(connectedMethod)) {
      onSocialConnect(connectedMethod as SocialProvider);
    }

    // Reset state
    setStep('connect');
    setConnectedMethod(null);
    setProfileData({ avatar: '', email: '', phone: '' });
    onOpenChange(false);
    
    toast.success("Profile setup complete!");
  };

  const handleSkipProfile = () => {
    // Complete the connection without profile setup
    if (connectedMethod && ['metamask', 'phantom', 'backpack'].includes(connectedMethod)) {
      onConnect(connectedMethod as WalletType);
    } else if (connectedMethod && ['google', 'apple'].includes(connectedMethod)) {
      onSocialConnect(connectedMethod as SocialProvider);
    }

    // Reset state
    setStep('connect');
    setConnectedMethod(null);
    setProfileData({ avatar: '', email: '', phone: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // Reset state when closing
        setStep('connect');
        setConnectedMethod(null);
        setProfileData({ avatar: '', email: '', phone: '' });
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'connect' ? (
              <>
                <Wallet className="w-5 h-5" />
                Connect to Dehouse of Oracles
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                Complete Your Profile
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'connect' 
              ? "Sign in with your wallet or social account" 
              : "Add your profile details (optional)"}
          </DialogDescription>
        </DialogHeader>

        {step === 'connect' && (
        <div className="space-y-4 py-4">
          {/* Social Login Options */}
          <div className="space-y-2">
            {socialOptions.map((social) => {
              const isConnecting = connectingSocial === social.id;
              
              return (
                <button
                  key={social.id}
                  onClick={() => handleSocialConnect(social.id)}
                  disabled={isConnecting}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${social.color} ${
                    isConnecting ? "border-purple-500 bg-accent" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">{social.icon}</span>
                    <span className="text-sm flex-1">{social.name}</span>
                    {isConnecting && (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              Or connect with wallet
            </span>
          </div>

          {/* Wallet Options */}
          <div className="space-y-3">
            {wallets.map((wallet) => {
              const isConnecting = connectingWallet === wallet.id;
              
              return (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={!wallet.supported || isConnecting}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    wallet.supported
                      ? "border-border hover:border-purple-500 hover:bg-accent cursor-pointer"
                      : "border-border opacity-50 cursor-not-allowed"
                  } ${isConnecting ? "border-purple-500 bg-accent" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Wallet Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl flex-shrink-0`}
                    >
                      {wallet.icon}
                    </div>

                    {/* Wallet Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm">{wallet.name}</h3>
                        {wallet.supported && (
                          <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        )}
                        {!wallet.supported && (
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{wallet.description}</p>
                    </div>

                    {/* Loading State */}
                    {isConnecting && (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400">
              🔒 <strong>Secure Connection:</strong> We never store your private keys. Your wallet stays in your control.
            </p>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <button
                onClick={onOpenPrivacy}
                className="text-purple-500 hover:underline"
              >
                Privacy Policy
              </button>
              {" "}and{" "}
              <button
                onClick={onOpenTerms}
                className="text-purple-500 hover:underline"
              >
                Terms of Use
              </button>
              .
            </p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              New to crypto wallets?{" "}
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-500 hover:underline"
              >
                Learn how to get started
              </a>
            </p>
          </div>
        </div>
        )}

        {step === 'profile' && (
        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="space-y-3">
            <Label htmlFor="avatar" className="text-sm">Profile Avatar</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Avatar preview" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB (JPG, PNG, GIF)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <Separator />

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Used for account recovery and important notifications
            </p>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Optional two-factor authentication and SMS alerts
            </p>
          </div>

          <Separator />

          {/* Info Banner */}
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <p className="text-xs text-purple-400">
              🔒 <strong>Privacy First:</strong> Your personal information is encrypted and never shared with third parties. You can update or remove this information anytime in Settings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkipProfile}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleProfileComplete}
              className="flex-1"
            >
              Complete Setup
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
