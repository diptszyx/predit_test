import { Home, BarChart3, Users, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";

interface MainNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  requiresAuth?: boolean;
  user?: any;
  mobile?: boolean;
  onOpenWalletDialog?: () => void;
  onSetPendingNavigation?: (page: string) => void;
}

export function MainNavigation({ currentPage, onNavigate, requiresAuth = false, user, mobile = false, onOpenWalletDialog, onSetPendingNavigation }: MainNavigationProps) {
  const handleNavigate = (page: string, requiresLogin: boolean = false) => {
    if (requiresLogin && !user) {
      toast.info("Please connect your wallet to access Dashboard");
      // Set pending navigation so user goes to dashboard after login
      if (onSetPendingNavigation) {
        onSetPendingNavigation(page);
      }
      if (onOpenWalletDialog) {
        onOpenWalletDialog();
      }
      return;
    }
    onNavigate(page);
  };

  const navItems = [
    {
      id: "oracles",
      label: "Oracles",
      icon: Home,
      requiresLogin: false,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      requiresLogin: true,
    },
    {
      id: "houses",
      label: "Houses",
      icon: Users,
      requiresLogin: false,
    },
    {
      id: "subscription",
      label: "Subscription",
      icon: CreditCard,
      requiresLogin: false,
    },
  ];

  if (mobile) {
    return (
      <>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => handleNavigate(item.id, item.requiresLogin)}
              className={`w-full justify-start gap-2 ${
                isActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {navItems.map((item) => {
        const isActive = currentPage === item.id;
        const Icon = item.icon;

        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => handleNavigate(item.id, item.requiresLogin)}
            className={`gap-2 ${
              isActive
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
