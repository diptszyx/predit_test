import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  MessageSquare,
  Trophy,
  Settings,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  User,
  Zap,
  Twitter,
  MessageCircle,
  Send,
} from "lucide-react";
import { User as UserType } from "../lib/types";
import { getUserLevel } from "../lib/xpSystem";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: UserType | null;
  onOpenWalletDialog: () => void;
  onWalletDisconnect: () => void;
  shortenAddress: (address: string) => string;
  onSetPendingNavigation: (page: string | null) => void;
  onOpenSettings: () => void;
  onOpenXPInfo?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const NAVIGATION_ITEMS = [
  {
    id: "chat",
    label: "Predictions",
    icon: MessageSquare,
    requiresAuth: false,
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    requiresAuth: false,
  },
];

const SOCIAL_LINKS = [
  {
    href: "https://twitter.com",
    icon: Twitter,
    label: "X (Twitter)",
  },
  {
    href: "https://discord.com",
    icon: MessageCircle,
    label: "Discord",
  },
  {
    href: "https://telegram.org",
    icon: Send,
    label: "Telegram",
  },
];

export function Sidebar({
  currentPage,
  onNavigate,
  user,
  onOpenWalletDialog,
  onWalletDisconnect,
  shortenAddress,
  onSetPendingNavigation,
  onOpenSettings,
  onOpenXPInfo,
  darkMode = true,
  onToggleDarkMode,
}: SidebarProps) {
  const userLevel = user ? getUserLevel(user.totalPredictions) : 1;
  console.log(user)
  const handleNavigation = (pageId: string, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      onSetPendingNavigation(pageId);
      onOpenWalletDialog();
    } else {
      onNavigate(pageId);
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Dehouse</h1>
            <p className="text-xs text-muted-foreground">AI Predictions</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              onClick={() => handleNavigation(item.id, item.requiresAuth)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Social Links */}
        <div className="flex items-center justify-center gap-4 pb-2">
          {SOCIAL_LINKS.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={social.label}
              >
                <Icon className="w-5 h-5" />
              </a>
            );
          })}
        </div>

        {/* How XP Works Button */}
        {onOpenXPInfo && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onOpenXPInfo}
          >
            <Sparkles className="w-4 h-4 mr-3" />
            How XP Works
          </Button>
        )}

        {/* Theme Toggle Button */}
        {onToggleDarkMode && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onToggleDarkMode}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 mr-3" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-3" />
                Dark Mode
              </>
            )}
          </Button>
        )}

        {/* User Section */}
        {user ? (
          <div className="space-y-2">
            {/* User Info Card */}
            <div className="p-3 rounded-lg bg-accent border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>
                    {/* {user.username.slice(0, 2).toUpperCase()} */}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.walletAddress
                      ? shortenAddress(user.walletAddress)
                      : user.email}
                  </p>
                </div>
              </div>

              {/* User Stats */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="font-medium">{user?.xp?.toLocaleString() || 1}</span>
                  <span className="text-muted-foreground">XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-primary" />
                  <span className="font-medium">Lv {userLevel}</span>
                </div>
                {user.subscriptionTier === "master" && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-xs px-1.5 py-0"
                  >
                    Pro
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={onOpenSettings}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={onWalletDisconnect}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <Button className="w-full" onClick={onOpenWalletDialog}>
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </aside>
  );
}
