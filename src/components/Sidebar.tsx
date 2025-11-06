import {
  Crown,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Moon,
  Send,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  Twitter,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { User as UserType } from "../lib/types";
import { getUserLevel } from "../lib/xpSystem";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

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
    id: "home",
    label: "Home",
    icon: Home,
    requiresAuth: false,
  },
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
  {
    id: "subscription",
    label: "Subscription",
    icon: Crown,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile(1024); // Use custom hook with 1024px breakpoint
  const userLevel = user ? user.level : 1;

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (pageId: string, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      onSetPendingNavigation(pageId);
      onOpenWalletDialog();
    } else {
      onNavigate(pageId);
    }
    setIsMobileMenuOpen(false);
  };

  // Mobile Sidebar Content (with close button)
  const MobileSidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Dehouse</h1>
              <p className="text-xs text-muted-foreground">AI Predictions</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
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
              className={`w-full justify-start ${isActive
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
                  <AvatarImage
                    src={
                      user.photo?.path ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"
                    }
                    alt={user.username}
                  />
                  <AvatarFallback>
                    {/* {user.username.slice(0, 2).toUpperCase()} */}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.email || shortenAddress(user.appWallet)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.email ? shortenAddress(user.appWallet) : ""}
                  </p>
                </div>
              </div>

              {/* User Stats */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="font-medium">
                    {user?.xp?.toLocaleString() || 0}
                  </span>
                  <span className="text-muted-foreground">XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-primary" />
                  <span className="font-medium">
                    Lv {!Number.isNaN(userLevel) ? userLevel : 0}
                  </span>
                </div>
                {user.isPro && (
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
    </>
  );

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile screens */}
      {isMobile && (
        <button
          className="fixed p-3 bg-sidebar border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
          style={{
            top: "1rem",
            left: "0.5rem",
            zIndex: 9999,
          }}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          style={{ zIndex: 9998 }}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar - Slides in from left when open */}
      {isMobile && isMobileMenuOpen && (
        <aside
          className="fixed top-0 left-0 w-64 h-screen border-r border-border bg-sidebar flex flex-col animate-slide-in"
          style={{ zIndex: 9999 }}
        >
          <MobileSidebarContent />
        </aside>
      )}

      {/* Desktop Sidebar - Always visible on desktop */}
      {!isMobile && (
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
                  className={`w-full justify-start ${isActive
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
                      <AvatarImage
                        src={
                          user.photo?.path ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"
                        }
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {/* {user.username.slice(0, 2).toUpperCase()} */}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.email || shortenAddress(user?.appWallet || "")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email
                          ? shortenAddress(user?.appWallet || "")
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-medium">
                        {user?.xp?.toLocaleString() || 1}
                      </span>
                      <span className="text-muted-foreground">XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-primary" />
                      <span className="font-medium">
                        Lv {!Number.isNaN(userLevel) ? userLevel : 0}
                      </span>
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
      )}
    </>
  );
}
