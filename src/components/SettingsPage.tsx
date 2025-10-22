import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ArrowLeft, Bell, Zap, Filter, Link as LinkIcon, Save, User, Camera, Mail, Phone, Edit2, Check } from "lucide-react";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  // Profile Settings
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80');
  const [email, setEmail] = useState('oracle.seeker@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Oracle Preferences
  const [politicsEnabled, setPoliticsEnabled] = useState(true);
  const [economicsEnabled, setEconomicsEnabled] = useState(true);
  const [newsVolume, setNewsVolume] = useState([70]);
  const [highAlertMode, setHighAlertMode] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(true);
  const [predictiveStrategies, setPredictiveStrategies] = useState(true);
  const [polymarketConnected, setPolymarketConnected] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        toast.success("Avatar updated successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEmail = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsEditingEmail(false);
    toast.success("Email updated successfully");
  };

  const handleSavePhone = () => {
    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setIsEditingPhone(false);
    toast.success("Phone number updated successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1>Settings & Customization</h1>
          <p className="text-sm text-muted-foreground">
            Tailor your feed for optimal Polymarket trading insights
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Profile Settings */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-purple-400" />
              <h3>Profile Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage your avatar, email, and phone number
            </p>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div>
                <Label className="text-sm mb-3 block">Profile Avatar</Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img 
                      src={avatar} 
                      alt="Profile avatar" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
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

              {/* Email Section */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditingEmail}
                    className={`flex-1 ${!isEditingEmail ? 'bg-accent' : ''}`}
                  />
                  {!isEditingEmail ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingEmail(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingEmail(false);
                          setEmail('oracle.seeker@example.com');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEmail}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for account recovery and important notifications
                </p>
              </div>

              {/* Phone Section */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditingPhone}
                    className={`flex-1 ${!isEditingPhone ? 'bg-accent' : ''}`}
                  />
                  {!isEditingPhone ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingPhone(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingPhone(false);
                          setPhone('+1 (555) 123-4567');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePhone}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional two-factor authentication and SMS alerts
                </p>
              </div>

              {/* Privacy Note */}
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-xs text-purple-400">
                  🔒 <strong>Privacy First:</strong> Your personal information is encrypted and never shared with third parties. You can remove this information anytime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Oracle Preferences */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-400" />
              <h3>Oracle Preferences</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Enable or disable specific AI Oracles to customize your news feed
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <div>
                    <Label>Politics Oracle</Label>
                    <p className="text-xs text-muted-foreground">
                      Elections, geopolitics, policy analysis
                    </p>
                  </div>
                </div>
                <Switch checked={politicsEnabled} onCheckedChange={setPoliticsEnabled} />
              </div>

              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <Label>Economics Oracle</Label>
                    <p className="text-xs text-muted-foreground">
                      Market trends, Fed rates, economic indicators
                    </p>
                  </div>
                </div>
                <Switch checked={economicsEnabled} onCheckedChange={setEconomicsEnabled} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News Volume Control */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3>News Volume</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Control how much news you receive and set alert preferences
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Feed Intensity</Label>
                  <Badge variant="outline">{newsVolume[0]}%</Badge>
                </div>
                <Slider
                  value={newsVolume}
                  onValueChange={setNewsVolume}
                  max={100}
                  step={10}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Minimal</span>
                  <span>Moderate</span>
                  <span>Maximum</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <Label>High Alert Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Get instant notifications for breaking news
                  </p>
                </div>
                <Switch checked={highAlertMode} onCheckedChange={setHighAlertMode} />
              </div>

              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive real-time alerts for market-moving events
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Preferences */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3>AI Analysis Focus</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Choose which AI capabilities to emphasize in your feed
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <Label>Sentiment Analysis</Label>
                  <p className="text-xs text-muted-foreground">
                    Bullish/bearish indicators on every article
                  </p>
                </div>
                <Switch checked={sentimentAnalysis} onCheckedChange={setSentimentAnalysis} />
              </div>

              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <Label>Predictive Strategies</Label>
                  <p className="text-xs text-muted-foreground">
                    AI-generated betting recommendations
                  </p>
                </div>
                <Switch checked={predictiveStrategies} onCheckedChange={setPredictiveStrategies} />
              </div>

              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <Label>Ripple Effect Analysis</Label>
                  <p className="text-xs text-muted-foreground">
                    Cross-market impact predictions
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Polymarket Integration */}
        <Card className="border-border bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-emerald-400">Polymarket Integration</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Connect your Polymarket wallet to auto-filter news based on your active bets
            </p>

            {!polymarketConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-card/50 rounded-lg border border-border">
                  <h4 className="mb-3 text-sm">Benefits:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      Auto-filter news tied to your open positions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      Real-time odds updates on your bets
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      One-click market access from articles
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      Portfolio-aware AI predictions
                    </li>
                  </ul>
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setPolymarketConnected(true)}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect Polymarket Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wallet: 0x7a2F...9d3B
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-card/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Active Bets</p>
                    <p className="text-emerald-400">12</p>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
                    <p className="text-emerald-400">$4,280</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setPolymarketConnected(false)}>
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3>Feed Preview</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your settings, your feed will show:
            </p>
            <div className="space-y-2">
              {politicsEnabled && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Politics</Badge>
                  <span className="text-sm text-muted-foreground">~15 articles/day</span>
                </div>
              )}
              {economicsEnabled && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Economics</Badge>
                  <span className="text-sm text-muted-foreground">~12 articles/day</span>
                </div>
              )}
              {highAlertMode && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    High Alert
                  </Badge>
                  <span className="text-sm text-muted-foreground">Instant breaking news</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
