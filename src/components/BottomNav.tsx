import { Home, MessageSquare, Trophy, Flame, LogIn, Settings, User } from "lucide-react";
import { Button } from "./ui/button";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: any;
  onOpenWalletDialog?: () => void;
  onOpenSettings?: () => void;
}

export function BottomNav({
  currentPage,
  onNavigate,
  user,
  onOpenWalletDialog,
  onOpenSettings,
}: BottomNavProps) {
  const isActive = (page: string) => currentPage === page;

  if (user?.walletAddress) {
    // Logged in navigation
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Home */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("home")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("home") ? "text-blue-500" : "text-muted-foreground"
              }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>

          {/* Chat */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("chat")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("chat") ? "text-blue-500" : "text-muted-foreground"
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Chat</span>
          </Button>

          {/* Leaderboard */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("leaderboard")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("leaderboard") ? "text-blue-500" : "text-muted-foreground"
              }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Ranks</span>
          </Button>

          {/* Hot Takes */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("hotTakes")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("hotTakes") ? "text-blue-500" : "text-muted-foreground"
              }`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-xs">Hot Takes</span>
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenSettings?.()}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("settings") ? "text-blue-500" : "text-muted-foreground"
              }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    );
  }

  // Not logged in navigation
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("home")}
          className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("home") ? "text-blue-500" : "text-muted-foreground"
            }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Button>

        {/* Chat */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("chat")}
          className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("chat") ? "text-blue-500" : "text-muted-foreground"
            }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs">Chat</span>
        </Button>

        {/* Leaderboard */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("leaderboard")}
          className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("leaderboard") ? "text-blue-500" : "text-muted-foreground"
            }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-xs">Ranks</span>
        </Button>

        {/* Hot Takes */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("hotTakes")}
          className={`flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none ${isActive("hotTakes") ? "text-blue-500" : "text-muted-foreground"
            }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-xs">Hot Takes</span>
        </Button>

        {/* Sign In */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenWalletDialog?.()}
          className="flex-1 flex flex-col items-center justify-center h-full gap-1 rounded-none text-muted-foreground"
        >
          <LogIn className="w-5 h-5" />
          <span className="text-xs">Sign In</span>
        </Button>
      </div>
    </div>
  );
}
