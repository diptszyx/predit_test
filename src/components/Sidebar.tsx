import { useWallet } from '@solana/wallet-adapter-react';
import {
  BookType,
  ChevronDown,
  ChevronsLeftRight,
  ChevronUp,
  Coins,
  Copy,
  Ellipsis,
  Flame,
  History,
  LineChart,
  LogOut,
  MessageCircle,
  MessageSquare,
  Moon,
  Plus,
  ScrollText,
  Settings,
  ShoppingCart,
  Sparkles,
  Store,
  Sun,
  Trophy,
  User,
  Users,
  Zap
} from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '../hooks/useIsMobile';
import useGetXpToken from '../hooks/xp-token/useGetXpToken';
import { copyToClipboard } from '../lib/clipboardUtils';
import { User as UserType } from '../lib/types';
import { ChatEntity, chatService } from '../services/chat.service';
import { OracleEntity } from '../services/oracles.service';
import useAuthStore from '../store/auth.store';
import { useWalletStore } from '../store/wallet.store';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import BalanceModal from './wallet/BalanceModal';
import Usdc from './wallet/icon/Usdc';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: UserType | null;
  onOpenWalletDialog: () => void;
  onWalletDisconnect: () => void;
  shortenAddress: (address: string) => string;
  onSetPendingNavigation: (page: string | null) => void;
  onOpenSettings: () => void;
  onOpenXPHistory: () => void;
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
  children?: any[];
}

const getBaseNavigationItems = (isAdmin: boolean): NavigationItem[] => [
  {
    id: 'kalshi',
    label: 'Kalshi Market',
    icon: Store,
    requiresAuth: true,
  },
  {
    id: 'market',
    label: 'Predit Market',
    icon: ShoppingCart,
    requiresAuth: true,
  },
  ...(import.meta.env.VITE_POLYMARKET_ENABLE === 'true'
    ? [
      {
        id: 'polymarket',
        label: 'Polymarket',
        icon: LineChart,
        requiresAuth: true,
      },
    ]
    : []),
  {
    id: 'chat',
    label: 'Predictions',
    icon: MessageSquare,
    requiresAuth: true,
    children: [],
  },
  {
    id: 'quests',
    label: 'Quests',
    icon: ScrollText,
    requiresAuth: true,
  },
  {
    id: 'news',
    label: 'News',
    icon: Flame,
    requiresAuth: false,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    requiresAuth: true,
  },
  {
    id: 'invites',
    label: 'Invites',
    icon: Users,
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
    href: 'https://x.com/preditmarket',
    icon: '/Twitter-X.svg',
    label: 'X (Twitter)',
  },
  {
    href: 'https://discord.com/invite/Qy383ZHH8',
    icon: '/discord-outline.svg',
    label: 'Discord',
  },
  {
    href: 'https://t.me/+7UaHn3GlQqxjYmRl',
    icon: '/telegram.svg',
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
  onOpenXPHistory,
  onOpenXPInfo,
  darkMode = true,
  onToggleDarkMode,
  selectedAIAgent,
  setSelectedAIAgent,
  isAdmin = false,
}: SidebarProps) {
  const navigate = useNavigate();
  const polymarketEnabled = import.meta.env.VITE_POLYMARKET_ENABLE === 'true';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    currentPage === 'chat' ? 'chat' : null,
  );
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(
    getBaseNavigationItems(isAdmin),
  );
  const [chats, setChats] = useState<ChatEntity[]>([]);
  const [showAllChats, setShowAllChats] = useState(false);
  const isMobile = useIsMobile(1024); // Use custom hook with 1024px breakpoint
  const userLevel = user ? user.level : 1;

  const { publicKey, connected, disconnect } = useWallet();

  const { xpToken } = useGetXpToken(user)

  useEffect(() => {
    (async () => {
      try {
        const chatsData = user
          ? await chatService.getChats({ limit: 100 })
          : [];

        if (chatsData?.length > 0) {
          setChats(chatsData);
        }

        const items = getBaseNavigationItems(isAdmin).map((item) => {
          if (item.id === 'chat') {
            return {
              ...item,
              // If user is logged in, show 'chat' section with its children set to chats
              // We'll modify hasChildren check later or ensure children isn't empty if we want to show 'New Chat'
              children: user
                ? !polymarketEnabled
                  ? chatsData.filter((i) => !i.polymarketId)
                  : chatsData
                : [],
            };
          }
          return item;
        });
        setNavigationItems(items);
      } catch (error) {
        console.log('Failed to fetch sidebar data', error);
      }
    })();
  }, [isAdmin, user]);

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

  const handleCopyToClipboard = async (text?: string) => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Wallet address copied to clipboard!');
    } else {
      toast.error('Unable to copy automatically', {
        description: 'Please copy the address manually',
      });
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const newChat = await chatService.createChat();
      if (newChat) {
        setChats((prev) => [newChat, ...prev]);
        navigate(`/chat/${newChat.id}`);
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
    setIsMobileMenuOpen(false);
  };

  // Mobile Sidebar Content (with close button)
  const MobileSidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="relative px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3"
            onClick={() => navigate('/')}
          >
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
          const hasChildren =
            !!item.children?.length || (item.id === 'chat' && !!user);
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
                  {item.id === 'chat' && user && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-[12.5px] mb-1"
                      onClick={handleCreateNewChat}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
                  )}
                  <div
                    className={`${showAllChats && item.id === 'chat' ? 'max-h-[300px] overflow-y-auto pr-2' : ''} flex flex-col gap-2`}
                  >
                    {(
                      (showAllChats && item.id === 'chat'
                        ? item.children
                        : (item.children && item.children.length > 0
                          ? item.children
                          : []
                        )?.slice(0, 5)) || []
                    ).map((child) => {
                      const chat = child as ChatEntity;
                      return (
                        <Button
                          key={chat.id}
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent/50`}
                          onClick={() => {
                            if (chat.polymarketId) {
                              return navigate(
                                `/polymarket/${chat.polymarketId}/chat/${chat.id}`,
                              );
                            } else if (chat.marketId) {
                              return navigate(
                                `/market/${chat.marketId}/chat/${chat.id}`,
                              );
                            } else if (chat.kalshiId) {
                              return navigate(
                                `/kalshi/${chat.kalshiId}/chat/${chat.id}`,
                              );
                            } else {
                              return navigate(`/chat/${chat.id}`);
                            }
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          <span className="truncate">
                            {chat.firstMessage ?? `New Message`}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                  {item.id === 'chat' && (item.children || []).length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary/80 h-7"
                      onClick={() => setShowAllChats(!showAllChats)}
                    >
                      {showAllChats
                        ? 'Show Less'
                        : `View More (${(item.children || []).length - 5} more)`}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div
        className="p-4 border-t border-border space-y-1
      "
      >
        {/* Social Links */}
        <div className="flex items-center justify-center gap-6 pb-1">
          {SOCIAL_LINKS.map((social) => {
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={social.label}
              >
                <ImageWithFallback
                  src={social.icon}
                  alt={social.label}
                  className="w-5 h-5"
                />
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
                    <p className="text-sm font-medium truncate">
                      {user.email && user.email}
                    </p>
                  </p>

                  <p className="text-xs gap-1 mt-0.5 text-muted-foreground flex items-center">
                    <img
                      src="/polygon.png"
                      className="w-3 h-3"
                      alt=""
                    />
                    {shortenAddress(user?.appWallet || '')}
                    <Copy
                      className="w-3 h-3 ml-2 cursor-pointer"
                      onClick={() => handleCopyToClipboard(user?.appWallet)}
                    />
                  </p>
                  <div className="text-xs mt-0.5 flex gap-1 items-center text-muted-foreground">
                    <img
                      src="/solana.png"
                      className="w-3 h-3"
                      alt=""
                    />
                    <p>
                      {!publicKey || !connected
                        ? 'Not connected'
                        : shortenAddress(publicKey?.toBase58())}
                    </p>
                    {publicKey && connected && (
                      <Copy
                        className="w-3 h-3 ml-2 cursor-pointer"
                        onClick={() =>
                          handleCopyToClipboard(publicKey?.toBase58())
                        }
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="flex items-center gap-3 text-xs mb-2">
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

              <div className="flex items-center gap-1 text-xs mb-2 cursor-pointer" onClick={() => navigate('/predit-xp-token')}>
                <Coins className="w-3 h-3 text-primary" />
                <span className="font-medium">
                  {xpToken}
                </span>
                <span className="text-muted-foreground">XP Token</span>
              </div>

              {polymarketEnabled && <Balance />}
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
                onClick={onOpenXPHistory}
              >
                <History className="w-4 h-4 mr-3" />
                XP History
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
          className="fixed p-2 bg-sidebar border border-border rounded-lg shadow-lg hover:bg-accent transition-colors translate-x-[-50%] z-[99]!"
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
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
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
              const hasChildren =
                !!item.children?.length || (item.id === 'chat' && !!user);
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
                      {item.id === 'chat' && user && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-[12.5px] mb-1"
                          onClick={handleCreateNewChat}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Chat
                        </Button>
                      )}
                      <div
                        className={`${item.id === 'chat' ? 'max-h-[100px] overflow-y-auto pr-2 scrollbar-hide' : ''} flex flex-col gap-2`}
                      >
                        {(
                          (showAllChats && item.id === 'chat'
                            ? item.children
                            : (item?.children && item?.children?.length > 0
                              ? item.children
                              : []
                            )?.slice(0, 5)) || []
                        ).map((child) => {
                          const chat = child as ChatEntity;
                          return (
                            <Button
                              key={chat.id}
                              variant="ghost"
                              size="sm"
                              className={`w-full justify-start text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent/50`}
                              onClick={() => {
                                if (chat.polymarketId) {
                                  return navigate(
                                    `/polymarket/${chat.polymarketId}/chat/${chat.id}`,
                                  );
                                } else if (chat.marketId) {
                                  return navigate(
                                    `/market/${chat.marketId}/chat/${chat.id}`,
                                  );
                                } else if (chat.kalshiId) {
                                  return navigate(
                                    `/kalshi/${chat.kalshiId}/chat/${chat.id}`,
                                  );
                                } else {
                                  return navigate(`/chat/${chat.id}`);
                                }
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              <span className="truncate">
                                {chat.firstMessage ?? `New Message`}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                      {item.id === 'chat' &&
                        (item.children || []).length > 5 &&
                        !showAllChats && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground font-bold opacity-80 hover:text-primary/80 h-7"
                            onClick={() => setShowAllChats(!showAllChats)}
                          >
                            {`View More (${(item.children || []).length - 5} more)`}
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-border space-y-1">
            {/* Social Links */}
            <div className="flex items-center justify-center gap-6 pb-2">
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
                    <ImageWithFallback
                      src={social.icon}
                      alt={social.label}
                      className="w-5 h-5"
                    />
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
              <div className="space-y-1">
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
                        {user.email && user.email}
                      </p>

                      <p className="text-xs gap-1 text-muted-foreground flex items-center mt-1">
                        <img
                          src="/polygon.png"
                          className="w-3 h-3"
                          alt=""
                        />
                        {shortenAddress(user?.appWallet || '')}
                        <Copy
                          className="w-3 h-3 ml-2 cursor-pointer"
                          onClick={() => handleCopyToClipboard(user?.appWallet)}
                        />
                      </p>
                      <div className="text-xs mt-0.5 flex gap-1 items-center text-muted-foreground">
                        <img
                          src="/solana.png"
                          className="w-3 h-3"
                          alt=""
                        />
                        <p>
                          {!publicKey || !connected
                            ? 'Not connected'
                            : shortenAddress(publicKey?.toBase58())}
                        </p>
                        {publicKey && connected && (
                          <Copy
                            className="w-3 h-3 ml-2 cursor-pointer"
                            onClick={() =>
                              handleCopyToClipboard(publicKey?.toBase58())
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-medium">
                        {user?.xp?.toLocaleString() || 1}
                      </span>
                      <span className="text-muted-foreground">XP available</span>
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

                  <div className="flex items-center gap-1 text-xs mb-2 cursor-pointer" onClick={() => navigate('/predit-xp-token')}>
                    <Coins className="w-3 h-3 text-primary" />
                    <span className="font-medium">
                      {xpToken}
                    </span>
                    <span className="text-muted-foreground">XP Token</span>
                  </div>

                  {polymarketEnabled && <Balance />}
                </div>

                {/* Action Buttons */}
                <div className="space-y-0.5">
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
                    onClick={onOpenXPHistory}
                  >
                    <History className="w-4 h-4 mr-3" />
                    XP History
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

const Balance = () => {
  const { usdcBalance, fetchUSDCBalance, loadingBalance } = useWalletStore();
  const user = useAuthStore();
  const [isOpenWalletModal, setIsOpenWalletModal] = useState(false);

  useEffect(() => {
    fetchUSDCBalance();
  }, [user]);
  return (
    <div className="flex items-center gap-1">
      <Usdc />
      <div
        className="flex items-center gap-1 hover:opacity-80 cursor-pointer"
        onClick={() => setIsOpenWalletModal(true)}
      >
        <p className="text-green-500 font-medium text-xs">
          {loadingBalance ? '-' : usdcBalance}
        </p>
        <Ellipsis className="size-3" />
      </div>
      <BalanceModal
        onOpenChange={setIsOpenWalletModal}
        open={isOpenWalletModal}
      />
    </div>
  );
};
