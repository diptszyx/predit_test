import { Button } from "./ui/button";
import { Moon, Sun, Menu, X, Settings, User, Sparkles } from "lucide-react";
import { MainNavigation } from "./MainNavigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import logoIcon from "figma:asset/2963c86375c465a0181ec7f085caa0b02f003590.png";

interface UnifiedHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: any;
  onOpenWalletDialog: () => void;
  onWalletDisconnect: () => void;
  shortenAddress: (address: string) => string;
  onSetPendingNavigation?: (page: string) => void;
  onOpenSettings?: () => void;
  onOpenXPInfo?: () => void;
}

export function UnifiedHeader({
  currentPage,
  onNavigate,
  darkMode,
  onToggleDarkMode,
  user,
  onOpenWalletDialog,
  onWalletDisconnect,
  shortenAddress,
  onSetPendingNavigation,
  onOpenSettings,
  onOpenXPInfo,
}: UnifiedHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate("aiAgents")}
            className="flex flex-col hover:opacity-80 transition-opacity"
          >
            <h1 className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <span className="text-2xl">🔮</span>
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-[rgb(255,255,255)] font-bold">Dehouse of Predictions</span>
            </h1>

          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <MainNavigation 
            currentPage={currentPage}
            onNavigate={onNavigate}
            user={user}
            onOpenWalletDialog={onOpenWalletDialog}
            onSetPendingNavigation={onSetPendingNavigation}
          />
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* How XP Works - Always visible */}
          {onOpenXPInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenXPInfo}
              className="hidden sm:flex gap-2 text-blue-400 hover:text-blue-300"
              title="How XP Works"
            >
              <Sparkles className="h-4 w-4" />
              How XP Works
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            className="hidden sm:flex"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onWalletDisconnect}
                className="gap-2"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                {user.walletAddress && shortenAddress(user.walletAddress)}
                {user.socialProvider && `${user.socialProvider}`}
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onOpenWalletDialog}
              className="hidden sm:flex gap-2"
            >
              Sign In
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            <div className="flex flex-col gap-1">
              <MainNavigation 
                currentPage={currentPage}
                onNavigate={(page) => {
                  onNavigate(page);
                  setMobileMenuOpen(false);
                }}
                user={user}
                mobile={true}
                onOpenWalletDialog={onOpenWalletDialog}
                onSetPendingNavigation={onSetPendingNavigation}
              />
            </div>
            
            <div className="border-t border-border pt-4 mt-4 space-y-2">
              {/* How XP Works - Mobile */}
              {onOpenXPInfo && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-blue-400 hover:text-blue-300"
                  onClick={() => {
                    onOpenXPInfo();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  How XP Works
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={onToggleDarkMode}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
            
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{user.username}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.walletAddress && shortenAddress(user.walletAddress)}
                          {user.socialProvider && `Connected via ${user.socialProvider}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      if (onOpenSettings) {
                        onOpenSettings();
                      }
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onWalletDisconnect();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    onOpenWalletDialog();
                    setMobileMenuOpen(false);
                  }}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
