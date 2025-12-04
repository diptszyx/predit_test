import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Mail, Phone, Upload, User } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { updateUserPhoto, uploadFile } from "../services/file.service";
import { useAuthStore } from "../store/auth.store";

export interface UserProfileForm {
  avatar: string;
  email: string;
  phoneNumber: string;
  referralCode: string;
}

interface UserProfileFormProps {
  data: UserProfileForm;
  onChange: (updates: Partial<UserProfileForm>) => void;
  onSkip?: () => void;
  onComplete: () => void;
  completeLabel?: string;
  skipLabel?: string;
  emailLocked?: boolean;
  emailProvider?: string;
  isSubmitting?: boolean;
}

export function UserProfileForm({
  data,
  onChange,
  onSkip,
  onComplete,
  completeLabel = "Complete Setup",
  skipLabel = "Skip for Now",
  emailLocked = false,
  emailProvider,
  isSubmitting = false,
}: UserProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchCurrentUser } = useAuthStore();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      input.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, GIF)");
      input.value = "";
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const uploadResponse = await uploadFile(file);

      await updateUserPhoto(uploadResponse.file.id);
      const updatedUser = await fetchCurrentUser();

      const nextAvatar =
        updatedUser?.photo?.path ||
        updatedUser?.avatar ||
        uploadResponse.file.path;

      if (nextAvatar) {
        onChange({ avatar: nextAvatar });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange({ avatar: reader.result as string });
        };
        reader.readAsDataURL(file);
      }

      toast.success("Avatar uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to upload photo. Please try again."
      );
    } finally {
      setIsUploadingPhoto(false);
      input.value = "";
    }
  };

  const emailProviderLabel =
    emailProvider === "google"
      ? "Google"
      : emailProvider === "email"
      ? "your email login"
      : "your login provider";

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-3">
        <Label htmlFor="avatar" className="text-sm">
          Profile Avatar
        </Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAvatarClick}
              className="w-full"
              disabled={isUploadingPhoto}
            >
              {isUploadingPhoto ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Avatar
                </>
              )}
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
            disabled={isUploadingPhoto}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={data.email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ email: event.target.value })
          }
          className="w-full"
          disabled={emailLocked}
        />
        <p className="text-xs text-muted-foreground">
          {emailLocked
            ? `Email is managed by ${emailProviderLabel} and cannot be changed here.`
            : "Used for account recovery and important notifications"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={data.phoneNumber}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ phoneNumber: event.target.value })
          }
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Optional two-factor authentication and SMS alerts
        </p>
      </div>

      {/* <div className="space-y-2">
        <Label
          htmlFor="referralCode"
          className="text-sm flex items-center gap-2"
        >
          referral Code
        </Label>
        <Input
          id="referralCode"
          type="tel"
          placeholder="DEH-XXXX"
          value={data.referralCode}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ referralCode: event.target.value })
          }
          className="w-full"
        />
      </div> */}

      <Separator />

      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-xs text-blue-400">
          🔒 <strong>Privacy First:</strong> Your personal information is
          encrypted and never shared with third parties. You can update or
          remove this information anytime in Settings.
        </p>
      </div>

      <div className="flex gap-3">
        {onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
            disabled={isSubmitting}
          >
            {skipLabel}
          </Button>
        )}
        <Button onClick={onComplete} className="flex-1" disabled={isSubmitting}>
          {completeLabel}
        </Button>
      </div>
    </div>
  );
}
