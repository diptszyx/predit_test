import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import {
  ArrowLeft,
  Save,
  User,
  Camera,
  Mail,
  Phone,
  Edit2,
  Check,
  Flame,
  Star,
  TrendingUp,
  Crown,
  Sparkles,
  Infinity,
  Lock,
  Zap,
  Loader2,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { ReferralCard } from "./ReferralCard";
import { SubscriptionManagementDialog } from "./SubscriptionManagementDialog";
import { mockUser } from "../lib/mockData";
import {
  getXPForNextLevel,
  getXPForCurrentLevel,
  getLevelProgress,
  getSubscriptionMultiplier,
  getStreakMultiplier,
} from "../lib/xpSystem";
import { uploadFile, updateUserPhoto } from "../services/file.service";
import { useAuthStore } from "../store/auth.store";

interface SettingsPageProps {
  onBack: () => void;
  user?: typeof mockUser;
}

export function SettingsPage({ onBack, user = mockUser }: SettingsPageProps) {
  console.log("user--", user);

  // Auth store
  const { updateProfile, fetchCurrentUser } = useAuthStore();

  // Profile Settings
  const [avatar, setAvatar] = useState(
    user.photo?.path ||
      user.avatar ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"
  );
  const [nickname, setNickname] = useState(user.username || "Oracle Seeker");
  const [email, setEmail] = useState(user.email || "oracle.seeker@example.com");
  const [phone, setPhone] = useState(
    user.phone || user.phoneNumber || "+1 (555) 123-4567"
  );
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // XP and Level calculations
  const xpForCurrentLevel = getXPForCurrentLevel(user.level);
  const xpForNextLevel = getXPForNextLevel(user.level);
  const xpProgress = getLevelProgress(user.xp, user.level);
  const xpIntoLevel = user.xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const subscriptionMult = getSubscriptionMultiplier(
    user.subscriptionTier || "free"
  );
  const streakMult = getStreakMultiplier(user.streak);
  const totalMult = subscriptionMult * streakMult;

  // Subscription Dialog
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, GIF)");
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Step 1: Upload file to server
      const uploadResponse = await uploadFile(file);

      // Step 2: Update user profile with the photo ID
      await updateUserPhoto(uploadResponse.file.id);

      // Step 3: Fetch updated user profile
      await fetchCurrentUser();

      // Step 4: Update local avatar display
      if (uploadResponse.file.path) {
        setAvatar(uploadResponse.file.path);
      } else {
        // Fallback to local preview if path is not provided
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      toast.success("Avatar updated successfully");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to upload photo. Please try again."
      );
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveNickname = async () => {
    if (!nickname || nickname.trim().length === 0) {
      toast.error("Please enter a nickname");
      return;
    }
    if (nickname.length > 30) {
      toast.error("Nickname must be less than 30 characters");
      return;
    }

    setIsSavingNickname(true);
    try {
      await updateProfile({ username: nickname.trim() });
      setIsEditingNickname(false);
      toast.success("Nickname updated successfully");
    } catch (error: any) {
      console.error("Error updating nickname:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update nickname. Please try again."
      );
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handleSaveEmail = async () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSavingEmail(true);
    try {
      await updateProfile({ email: email.trim() });
      setIsEditingEmail(false);
      toast.success("Email updated successfully");
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update email. Please try again."
      );
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSavePhone = async () => {
    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSavingPhone(true);
    try {
      await updateProfile({ phoneNumber: phone.trim() });
      setIsEditingPhone(false);
      toast.success("Phone number updated successfully");
    } catch (error: any) {
      console.error("Error updating phone:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update phone number. Please try again."
      );
    } finally {
      setIsSavingPhone(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1>Settings & Customization</h1>
          <p className="text-sm text-muted-foreground">
            Tailor your feed for optimal Polymarket trading insights
          </p>
        </div>
        {/* Profile Settings */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h3>Profile Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage your nickname, avatar, email, and phone number
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
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={
                          user.subscriptionTier === "master"
                            ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50"
                            : "bg-muted border-border"
                        }
                      >
                        {user.subscriptionTier === "master" ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Pro
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 mr-1" />
                            Basic
                          </>
                        )}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Change Avatar
                        </>
                      )}
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
                    disabled={isUploadingPhoto}
                  />
                </div>
              </div>

              <Separator />

              {/* Nickname Section */}
              {/* <div className="space-y-3">
                <Label
                  htmlFor="nickname"
                  className="text-sm flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Nickname
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={!isEditingNickname}
                    className={`flex-1 ${
                      !isEditingNickname ? "bg-accent" : ""
                    }`}
                    maxLength={30}
                  />
                  {!isEditingNickname ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingNickname(true)}
                      disabled={isSavingNickname}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingNickname(false);
                          setNickname(user.username || "Oracle Seeker");
                        }}
                        disabled={isSavingNickname}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveNickname}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSavingNickname}
                      >
                        {isSavingNickname ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your display name shown to other users (max 30 characters)
                </p>
              </div>

              <Separator /> */}

              {/* Email Section */}
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm flex items-center gap-2"
                >
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
                    className={`flex-1 ${!isEditingEmail ? "bg-accent" : ""}`}
                  />
                  {!isEditingEmail ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingEmail(true)}
                      disabled={isSavingEmail}
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
                          setEmail(user.email || "oracle.seeker@example.com");
                        }}
                        disabled={isSavingEmail}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEmail}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSavingEmail}
                      >
                        {isSavingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
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
                <Label
                  htmlFor="phone"
                  className="text-sm flex items-center gap-2"
                >
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
                    className={`flex-1 ${!isEditingPhone ? "bg-accent" : ""}`}
                  />
                  {!isEditingPhone ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingPhone(true)}
                      disabled={isSavingPhone}
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
                          setPhone(
                            user.phone ||
                              user.phoneNumber ||
                              "+1 (555) 123-4567"
                          );
                        }}
                        disabled={isSavingPhone}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePhone}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSavingPhone}
                      >
                        {isSavingPhone ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional two-factor authentication and SMS alerts
                </p>
              </div>

              {/* Privacy Note */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-400">
                  🔒 <strong>Privacy First:</strong> Your personal information
                  is encrypted and never shared with third parties. You can
                  remove this information anytime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-blue-400" />
              <h3>Subscription</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage your subscription and unlock premium features
            </p>

            {user.subscriptionTier === "master" ? (
              /* Pro User View */
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2">
                          Pro Subscription
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          $4.99/month
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-background/50 text-center">
                      <Infinity className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                      <p className="text-xs text-muted-foreground">Unlimited</p>
                      <p className="text-sm">Predictions</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 text-center">
                      <Zap className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                      <p className="text-xs text-muted-foreground">2x XP</p>
                      <p className="text-sm">Multiplier</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 text-center">
                      <Star className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                      <p className="text-xs text-muted-foreground">Priority</p>
                      <p className="text-sm">Responses</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-500/20">
                    <p className="text-xs text-muted-foreground mb-2">
                      Next billing date
                    </p>
                    <p className="text-sm mb-3">November 28, 2025</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSubscriptionDialogOpen(true)}
                    >
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Basic User View */
              <div className="space-y-4">
                <div className="p-6 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4>Basic (Free)</h4>
                      <p className="text-sm text-muted-foreground">
                        5 total predictions
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Predictions Used
                      </span>
                      <span className="text-sm">
                        {user.totalPredictions || 0}/5
                      </span>
                    </div>
                    <Progress
                      value={((user.totalPredictions || 0) / 5) * 100}
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-blue-400" />
                    <h4>Upgrade to Pro</h4>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Unlimited predictions</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>2x XP multiplier on all actions</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>1,500 XP bonus</strong> when you subscribe
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Priority AI responses</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-500/20 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg text-muted-foreground line-through">
                        $19.99/mo
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 border-blue-500/30"
                      >
                        75% OFF
                      </Badge>
                    </div>
                    <p className="text-center text-3xl mb-1">
                      $4.99
                      <span className="text-sm text-muted-foreground">
                        /month
                      </span>
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
                    onClick={() => setSubscriptionDialogOpen(true)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Cancel anytime • Full access immediately
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prediction History */}
        {user.predictionHistory && user.predictionHistory.length > 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3>Recent Predictions</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Your last {user.predictionHistory.length} prediction
                {user.predictionHistory.length !== 1 ? "s" : ""}
              </p>

              <div className="space-y-3">
                {user.predictionHistory.map((prediction, index) => (
                  <div
                    key={prediction.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs text-primary font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm mb-2 line-clamp-2">
                        {prediction.question}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {prediction.oracleName}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(prediction.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Stats */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-blue-400" />
              <h3>Account Stats</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Track your progress and achievements
            </p>

            <div className="space-y-6">
              {/* Current Streak */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-sky-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Label className="text-sm">Current Streak</Label>
                      <p className="text-2xl mt-1">{user.streak} days</p>
                    </div>
                  </div>
                  {streakMult > 1 && (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 border-blue-500/30"
                    >
                      {streakMult}x XP Bonus
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep visiting daily to maintain your streak and earn bonus XP!
                </p>
              </div>

              <Separator />

              {/* Summon Level */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">
                          Summon Level {user.level}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {xpIntoLevel?.toLocaleString()} /{" "}
                        {xpNeededForLevel?.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total XP</p>
                    <p className="text-xl">{user.xp?.toLocaleString()}</p>
                  </div>
                </div>

                <Progress value={xpProgress} className="h-2 mb-3" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{xpProgress}% to next level</span>
                  {subscriptionMult > 1 && (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 border-blue-500/30 text-xs"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {totalMult.toFixed(2)}x Total Multiplier
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral System */}
        <ReferralCard user={user} />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Subscription Management Dialog */}
      <SubscriptionManagementDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        currentTier={user.subscriptionTier || "free"}
        onSubscriptionSuccess={() => {
          toast.success("Subscription updated successfully!");
        }}
      />
    </div>
  );
}
