import {
  BookType,
  ChevronDown,
  ChevronsLeftRight,
  ChevronUp,
  Crown,
  Flame,
  Home,
  LogOut,
  MessageCircle,
  MessageSquare,
  Moon,
  Send,
  Settings,
  ShoppingCart,
  Sparkles,
  Sun,
  Trophy,
  Twitter,
  User,
  Zap,
} from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { truncateName } from '../lib/truncateName';
import { User as UserType } from '../lib/types';
import { OracleEntity, oraclesServices } from '../services/oracles.service';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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
  selectedAIAgent: OracleEntity | null;
  setSelectedAIAgent: Dispatch<SetStateAction<OracleEntity | null>>;
  isAdmin?: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
  isExternalLink?: boolean;
  href?: string;
  children?: OracleEntity[];
}

const getBaseNavigationItems = (isAdmin: boolean): NavigationItem[] => [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    requiresAuth: false,
  },
  {
    id: 'chat',
    label: 'Predictions',
    icon: MessageSquare,
    requiresAuth: false,
    children: [],
  },
  {
    id: 'hotTakes',
    label: 'Hot Takes',
    icon: Flame,
    requiresAuth: false,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    requiresAuth: false,
  },
  {
    id: 'subscription',
    label: 'Subscription',
    icon: Crown,
    requiresAuth: false,
  },
  {
    id: 'market',
    label: 'Market',
    icon: ShoppingCart,
    requiresAuth: true,
  },
  ...(isAdmin
    ? [
      {
        id: 'topic',
        label: 'Topic',
        icon: BookType,
        requiresAuth: true,
      },
    ]
    : []),
];

const SOCIAL_LINKS = [
  {
    href: 'https://twitter.com',
    icon: Twitter,
    label: 'X (Twitter)',
  },
  {
    href: 'https://discord.com',
    icon: MessageCircle,
    label: 'Discord',
  },
  {
    href: 'https://telegram.org',
    icon: Send,
    label: 'Telegram',
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
  selectedAIAgent,
  setSelectedAIAgent,
  isAdmin = false,
}: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    currentPage === 'chat' ? 'chat' : null
  );
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(
    getBaseNavigationItems(isAdmin)
  );
  const isMobile = useIsMobile(1024); // Use custom hook with 1024px breakpoint
  const userLevel = user ? user.level : 1;

  useEffect(() => {
    (async () => {
      try {
        const data = await oraclesServices.getAllOracles();

        if (data?.data) {
          setNavigationItems(
            getBaseNavigationItems(isAdmin).map((item) => {
              if (item.id === 'chat') {
                return {
                  ...item,
                  children: data.data,
                };
              }
              return item;
            })
          );
        }
      } catch (error) {
        console.log('Failed to fetch all oracles', error);
      }
    })();
  }, [isAdmin]);

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
      <div className="relative px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ImageWithFallback
                src={'/logo-MarkWhite.svg'}
                alt={'logo'}
                className="w-5 h-5 text-primary-foreground"
              />
            </div>
            <div>
              <div className="text-lg font-semibold">Predit Market</div>
              <p className="text-xs text-muted-foreground">AI Predictions</p>
            </div>
          </div>
        </div>
        {/* Close button for mobile */}
        <button
          className="absolute -bottom-4 -right-4 lg:hidden p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer border border-border bg-background"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <ChevronsLeftRight className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-1 min-h-[200px] overflow-y-auto scrollbar-hide">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isActiveParent = currentPage === item.id && !hasChildren;

          const handleItemClick = () => {
            if (hasChildren) {
              setOpenSubmenu((prev) => (prev === item.id ? null : item.id));
              return;
            }

            if (item.isExternalLink && item.href) {
              window.open(item.href, '_blank');
            } else {
              handleNavigation(item.id, item.requiresAuth);
            }
          };

          return (
            <div
              key={item.id}
              className="w-full"
            >
              <Button
                variant="ghost"
                className={`w-full justify-start ${isActiveParent
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                onClick={handleItemClick}
              >
                <Icon className="w-4 h-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>

                {hasChildren && (
                  <span className="ml-auto text-xs">
                    {openSubmenu === item.id ? <ChevronUp /> : <ChevronDown />}
                  </span>
                )}
              </Button>

              {/* submenu */}
              {hasChildren && openSubmenu === item.id && (
                <div className="mt-1 ml-3 flex flex-col gap-2">
                  {item.children!.map((child) => {
                    const isActiveChild =
                      currentPage === item.id &&
                      selectedAIAgent?.name === child.name;

                    return (
                      <Button
                        key={child.name}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-[12.5px] ${isActiveChild
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                          }`}
                        onClick={() => {
                          setSelectedAIAgent(child);
                          localStorage.setItem('deor-currentOracle', child.id);
                          onNavigate('chat');
                        }}
                      >
                        {child.image ? (
                          <>
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-blue-500/30 mr-2">
                              <ImageWithFallback
                                src={child.image}
                                alt={child.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                        {truncateName(child.name)}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div
        className="p-4 border-t border-border space-y-2
      "
      >
        {/* Social Links */}
        <div className="flex items-center justify-center gap-4 pb-1">
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
            onClick={() => {
              onOpenXPInfo();
              setIsMobileMenuOpen(false);
            }}
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
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'
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
                    {user.email ? shortenAddress(user.appWallet) : ''}
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
          <Button
            className="w-full"
            onClick={onOpenWalletDialog}
          >
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
          className="fixed p-2 bg-sidebar border border-border rounded-lg shadow-lg hover:bg-accent transition-colors translate-x-[-50%] z-[49]!"
          style={{
            top: '3.2rem',
            left: '0',
            zIndex: 9999,
            opacity: 0.9,
          }}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <ChevronsLeftRight className="w-4 h-4" />
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
          className="fixed top-0 left-0 w-64 border-r border-border bg-sidebar flex flex-col animate-slide-in"
          style={{ zIndex: 99999, height: '100dvh' }}
        >
          <MobileSidebarContent />
        </aside>
      )}

      {/* Desktop Sidebar - Always visible on desktop */}
      {!isMobile && (
        <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen">
          {/* Logo Section */}
          <div className="py-4 px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ImageWithFallback
                  src={'/logo-MarkWhite.svg'}
                  alt={'logo'}
                  className="w-5 h-5 text-primary-foreground"
                />
              </div>
              <div>
                <div className="text-lg font-semibold">Predit Market</div>
                <p className="text-xs text-muted-foreground">AI Predictions</p>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 p-4 space-y-1 min-h-[200px] overflow-y-auto scrollbar-hide">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const isActiveParent = currentPage === item.id && !hasChildren;

              const handleItemClick = () => {
                if (hasChildren) {
                  setOpenSubmenu((prev) => (prev === item.id ? null : item.id));
                  return;
                }

                if (item.isExternalLink && item.href) {
                  window.open(item.href, '_blank');
                } else {
                  handleNavigation(item.id, item.requiresAuth);
                }
              };

              return (
                <div
                  key={item.id}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveParent
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    onClick={handleItemClick}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="flex-1 text-left">{item.label}</span>

                    {hasChildren && (
                      <span className="ml-auto text-xs">
                        {openSubmenu === item.id ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </span>
                    )}
                  </Button>

                  {/* submenu */}
                  {hasChildren && openSubmenu === item.id && (
                    <div className="mt-1 ml-3 flex flex-col gap-2">
                      {item.children!.map((child) => {
                        const isActiveChild =
                          currentPage === item.id &&
                          selectedAIAgent?.name === child.name;

                        return (
                          <Button
                            key={child.name}
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-start text-[12.5px] ${isActiveChild
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                              }`}
                            onClick={() => {
                              setSelectedAIAgent(child);
                              localStorage.setItem(
                                'deor-currentOracle',
                                child.id
                              );
                              onNavigate('chat');
                            }}
                          >
                            {child.image ? (
                              <>
                                <div className="w-3 h-3 md:w-6 md:h-6 rounded-full overflow-hidden border border-blue-500/30 mr-2">
                                  <ImageWithFallback
                                    src={child.image}
                                    alt={child.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            {truncateName(child.name)}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-border space-y-2">
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
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'
                        }
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {/* {user.username.slice(0, 2).toUpperCase()} */}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.email || shortenAddress(user?.appWallet || '')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email
                          ? shortenAddress(user?.appWallet || '')
                          : ''}
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
              <Button
                className="w-full"
                onClick={onOpenWalletDialog}
              >
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
