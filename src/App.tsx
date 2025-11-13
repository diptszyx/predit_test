import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import type {
  WalletType
} from './components/WalletConnectDialog';
import { useUserPhotoRefresh } from './hooks';
import type { User } from './lib/types';
import { useXP } from './lib/useXP';

// Components
import { AIAgentCard } from './components/AIAgentCard';
import {
  ArticleDetailPage,
  type HotTakeArticle,
} from './components/ArticleDetailPage';
import { ChatPage } from './components/ChatPage';
import { HomePage } from './components/HomePage';
import { HotTakesPage } from './components/HotTakesPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { SettingsPage } from './components/SettingsPage';
import { SharedPredictionPage } from './components/SharedPredictionPage';
import { Sidebar } from './components/Sidebar';
import { SubscriptionPage } from './components/SubscriptionPage';
import { TermsOfUse } from './components/TermsOfUse';
import UserProfileDialog from './components/UserProfileDialog';
import { WalletConnectDialog } from './components/WalletConnectDialog';
import { XPInfoDialog } from './components/XPInfoDialog';
import { shortenAddress } from './lib/address';
import apiClient from './lib/axios';
import { OracleEntity, oraclesServices } from './services/oracles.service';
import useAuthStore from './store/auth.store';

// Constants
const AI_AGENT_IMAGES = {
  crypto:
    'https://images.unsplash.com/photo-1672071673701-4c9a564c8046?w=800&q=80',
  tech: 'https://images.unsplash.com/photo-1643962579365-3a9222e923b8?w=800&q=80',
  politics:
    'https://images.unsplash.com/photo-1567619863607-cb9e8f595a95?w=800&q=80',
  sports:
    'https://images.unsplash.com/photo-1744782211816-c5224434614f?w=800&q=80',
  entertainment:
    'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&q=80',
  fortune:
    'https://images.unsplash.com/photo-1618071264149-da6cfa159cfd?w=800&q=80',
  gaming:
    'https://images.unsplash.com/photo-1719937075989-795943caad2a?w=800&q=80',
  general:
    'https://images.unsplash.com/photo-1676410205325-5d01d0107039?w=800&q=80',
};

// Hot Takes Articles Data
const HOT_TAKE_ARTICLES: HotTakeArticle[] = [
  {
    id: 'art-1',
    title: "Bitcoin's Next Move: Why $100K Is Just The Beginning",
    source: 'Crypto AI Agent',
    url: '#',
    publishedAt: '2 hours ago',
    relevance: 'High',
    image:
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
    aiAgentAvatar: AI_AGENT_IMAGES.crypto,
    likes: 342,
    comments: 87,
    shares: 156,
    aiAgentId: 'crypto',
  },
  {
    id: 'art-2',
    title: 'The AI Revolution: What Most Investors Are Missing',
    source: 'Tech Prophet',
    url: '#',
    publishedAt: '5 hours ago',
    relevance: 'High',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    aiAgentAvatar: AI_AGENT_IMAGES.tech,
    likes: 521,
    comments: 143,
    shares: 234,
    aiAgentId: 'technical-analysis',
  },
  {
    id: 'art-3',
    title: 'Election 2024: The Prediction Markets Were Right All Along',
    source: 'Political Sage',
    url: '#',
    publishedAt: '1 day ago',
    relevance: 'Medium',
    image:
      'https://images.unsplash.com/photo-1569690784119-2bcf528a2663?w=800&q=80',
    aiAgentAvatar: AI_AGENT_IMAGES.fortune,
    likes: 289,
    comments: 92,
    shares: 178,
    aiAgentId: 'crypto-crystal',
  },
  {
    id: 'art-4',
    title: "Ethereum's Layer 2 Explosion: The Silent Revolution",
    source: 'Crypto AI Agent',
    url: '#',
    publishedAt: '1 day ago',
    relevance: 'High',
    image:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    aiAgentAvatar: AI_AGENT_IMAGES.crypto,
    likes: 467,
    comments: 124,
    shares: 201,
    aiAgentId: 'crypto',
  },
];

// AI Agents Data
const AI_AGENTS: OracleEntity[] = [
  {
    id: "crypto-crystal",
    name: "Crypto Crystal Czar",
    type: "Cryptocurrency Expert",
    description:
      "Master of blockchain technology and cryptocurrency markets. Analyzes market trends, tokenomics, DeFi protocols, and on-chain data to provide insights on Bitcoin, Ethereum, altcoins, and emerging crypto projects.",
    image: AI_AGENT_IMAGES.fortune,
    rating: "91%",
    predictions: 58200,
    likes: 12300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __entity: "OracleEntity",
  },
];

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Auth state from global store
  const user = useAuthStore((state) => state.user);
  const updateUserInStore = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const authenticateWithToken = useAuthStore(
    (state) => state.authenticateWithToken
  );
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  // App state
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem('deorCurrentPage') || 'chat';
  });
  const [listOracles, setListOracles] = useState<OracleEntity[]>([])
  const [selectedAIAgent, setSelectedAIAgent] = useState<OracleEntity | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HotTakeArticle | null>(
    null
  );
  const [articleContext, setArticleContext] = useState<HotTakeArticle | null>(
    null
  );
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [sharedPredictionId, setSharedPredictionId] = useState<string | null>(
    null
  );
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileDialogUser, setProfileDialogUser] = useState<User | null>(null);
  const [profileDialogRequireCompletion, setProfileDialogRequireCompletion] =
    useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  // Dialog state
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [xpInfoDialogOpen, setXPInfoDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  const openProfileDialog = (options?: {
    user?: User | null;
    require?: boolean;
  }) => {
    const storeUser = useAuthStore.getState().user;
    const targetUser = options?.user ?? storeUser ?? user ?? null;
    setProfileDialogUser(targetUser);
    setProfileDialogRequireCompletion(Boolean(options?.require));
    setProfileDialogOpen(true);
  };

  const closeProfileDialog = () => {
    setProfileDialogOpen(false);
    setProfileDialogRequireCompletion(false);
    setProfileDialogUser(null);
  };

  const handleProfileUpdated = (updates?: Partial<User>) => {
    if (updates && Object.keys(updates).length > 0) {
      updateUser(updates);
      setProfileDialogUser((prev) => (prev ? { ...prev, ...updates } : prev));
      setProfileDialogOpen(false);
    }
    setProfileDialogRequireCompletion(false);
  };

  const handleProfileDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeProfileDialog();
    } else {
      setProfileDialogOpen(true);
    }
  };

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    updateUserInStore(updates);
  };

  // XP system hook
  const { awardXPToUser, trackQuestProgress } = useXP(user, updateUser);

  // Auto-refresh user profile to prevent presigned URL expiration
  useUserPhotoRefresh();

  // Get all AI oracles
  useEffect(() => {
    (async () => {
      try {
        const data = await oraclesServices.getAllOracles()

        if (data?.data) setListOracles(data.data)
      } catch (error) {
        console.log("Failed to fetch all oracles", error);
      }
    })()
  }, [user])

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('deorCurrentPage', currentPage);
  }, [currentPage]);

  // Set default AI agent
  useEffect(() => {
    if (listOracles.length > 0 && !selectedAIAgent) {
      setSelectedAIAgent(listOracles[0] || AI_AGENTS[0]);
    }
  }, [selectedAIAgent, listOracles, user]);

  // Check for shared prediction, referral code, or OAuth token in URL
  useEffect(() => {
    const path = window.location.pathname;
    const predictionMatch = path.match(/\/prediction\/([^/]+)/);

    if (predictionMatch) {
      setSharedPredictionId(predictionMatch[1]);
      setCurrentPage('shared-prediction');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    const oauthToken = urlParams.get('token');
    const isNewUser = urlParams.get('isNew') === 'true';

    if (referralCode) {
      sessionStorage.setItem('pendingReferralCode', referralCode);
      toast.info('Referral code detected! Sign up to get your bonus.', {
        description: "You'll earn 100 XP when you create your account!",
      });
    }

    if (oauthToken) {
      const cleanedParams = new URLSearchParams(urlParams);
      cleanedParams.delete('token');
      cleanedParams.delete('isNew');
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const newUrl = cleanedParams.toString()
        ? `${baseUrl}?${cleanedParams.toString()}`
        : baseUrl;
      window.history.replaceState({}, '', newUrl);

      void (async () => {
        try {
          const authenticatedUser = await authenticateWithToken(oauthToken);

          toast.success(
            isNewUser ? 'Welcome to Dehouse!' : 'Signed in successfully.',
            {
              description: isNewUser
                ? "Your Google account is now linked. Let's get started."
                : "You're back in. Pick up where you left off.",
            }
          );

          if (pendingNavigation) {
            setCurrentPage(pendingNavigation);
            setPendingNavigation(null);
          } else {
            setCurrentPage('chat');
          }

          if (isNewUser) {
            openProfileDialog({
              user: authenticatedUser,
              require: true,
            });
          } else if (authenticatedUser) {
            setProfileDialogUser(authenticatedUser);
          }
        } catch {
          toast.error("We couldn't sign you in. Please try again.");
        }
      })();
    }
  }, [authenticateWithToken, pendingNavigation]);

  const handleWalletConnect = (walletType: WalletType, user: User) => {
    setWalletDialogOpen(false);
    toast.success(`Connected with ${walletType}!`);

    handleRefAutoApply();

    const createdAt = new Date(user.createdAt).getTime();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    if (createdAt >= tenMinutesAgo) {
      openProfileDialog({ user, require: true });
    }

    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSocialConnect = () => {
    handleRefAutoApply();
  };

  const handleRefAutoApply = async () => {
    const referralCode = sessionStorage.getItem('pendingReferralCode');
    if (!referralCode) return;

    try {
      await apiClient.post('/auth/redeem-referral', {
        referralCode,
      });

      toast.success('🎉 Referral bonus applied! +300 XP', {
        description: 'Welcome to Dehouse of Predictions!',
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to apply referral');
    } finally {
      sessionStorage.removeItem('pendingReferralCode');
      fetchCurrentUser();
    }
  };

  const handleWalletDisconnect = () => {
    logout();
    closeProfileDialog();
    setCurrentPage('home');
    toast.info('Wallet disconnected');
  };

  const handleReloadOracle = async (oracleId: string) => {
    try {
      const res = await oraclesServices.getOracleById(oracleId);
      if (res) {
        setSelectedAIAgent(res);

        setListOracles((prev) =>
          prev.map((item) => (item.id === oracleId ? res : item))
        );
      }
    } catch (e) {
      console.log("Failed to reload oracle", e);
    }
  };

  // Common sidebar and dialog props
  const commonSidebarProps = {
    currentPage,
    onNavigate: setCurrentPage,
    user,
    onOpenWalletDialog: () => setWalletDialogOpen(true),
    onWalletDisconnect: handleWalletDisconnect,
    shortenAddress,
    onOpenSettings: () => setCurrentPage('settings'),
    onSetPendingNavigation: setPendingNavigation,
    onOpenXPInfo: () => setXPInfoDialogOpen(true),
    darkMode,
    onToggleDarkMode: () => setDarkMode(!darkMode),
  };

  const commonDialogProps = (
    <>
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={handleWalletConnect}
        onSocialConnect={handleSocialConnect}
        onOpenPrivacy={() => setPrivacyDialogOpen(true)}
        onOpenTerms={() => setTermsDialogOpen(true)}
      />
      <XPInfoDialog
        open={xpInfoDialogOpen}
        onOpenChange={setXPInfoDialogOpen}
      />
      <PrivacyPolicy
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
      />
      <TermsOfUse
        open={termsDialogOpen}
        onOpenChange={setTermsDialogOpen}
      />
      <UserProfileDialog
        open={profileDialogOpen}
        onOpenChange={handleProfileDialogOpenChange}
        user={profileDialogUser}
        onProfileUpdated={handleProfileUpdated}
      />
      <Toaster />
    </>
  );

  // Render shared prediction page
  if (currentPage === 'shared-prediction' && sharedPredictionId) {
    return (
      <SharedPredictionPage
        predictionId={sharedPredictionId}
        onBack={() => {
          setSharedPredictionId(null);
          setCurrentPage('chat');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Render hot takes page
  if (currentPage === 'hotTakes') {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar {...commonSidebarProps} />
        <div className="flex-1 overflow-y-auto">
          <HotTakesPage
            articles={HOT_TAKE_ARTICLES}
            onArticleClick={(article) => {
              setSelectedArticle(article);
              setPreviousPage('hotTakes');
              setCurrentPage('articleDetail');
            }}
            onBack={() => setCurrentPage('chat')}
          />
        </div>
        {commonDialogProps}
      </div>
    );
  }

  if (currentPage === 'home') {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar - Desktop only */}
        {/* <div className="hidden md:block"> */}
        <Sidebar {...commonSidebarProps} />
        {/* </div> */}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <HomePage
            onGetStarted={() => setWalletDialogOpen(true)}
            onExplorePredictions={(prompt) => {
              if (prompt) {
                setInitialPrompt(prompt);
              }
              // Set the first AI agent as selected if none is selected
              if (!selectedAIAgent && listOracles.length > 0) {
                // setSelectedAIAgent(listOracles[0] || AI_AGENTS[0]);
                setSelectedAIAgent(listOracles[0]);
              }
              setCurrentPage('chat');
            }}
            onViewHotTakes={() => setCurrentPage('hotTakes')}
            onArticleClick={(article) => {
              setSelectedArticle(article);
              setPreviousPage('home');
              setCurrentPage('articleDetail');
            }}
            articles={HOT_TAKE_ARTICLES}
            user={user}
          />
        </div>

        {/* Bottom Navigation - Mobile only */}
        {/* <BottomNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onOpenSettings={() => setCurrentPage("settings")}
        /> */}

        {commonDialogProps}
      </div>
    );
  }

  // Render article detail page
  if (currentPage === 'articleDetail' && selectedArticle) {
    return (
      <ArticleDetailPage
        hotTake={selectedArticle}
        onBack={() => {
          setSelectedArticle(null);
          if (previousPage === 'chat' && selectedAIAgent) {
            setPreviousPage(null);
            setCurrentPage('chat');
          } else if (previousPage === 'hotTakes') {
            setPreviousPage(null);
            setCurrentPage('hotTakes');
          } else {
            setPreviousPage(null);
            setCurrentPage('chat');
          }
        }}
        aiAgentName={selectedAIAgent?.name}
        aiAgentSpecialty={selectedAIAgent?.type}
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNavigate={setCurrentPage}
        onOpenWalletDialog={() => setWalletDialogOpen(true)}
        onWalletDisconnect={handleWalletDisconnect}
        shortenAddress={shortenAddress}
        onSetPendingNavigation={setPendingNavigation}
        onOpenSettings={() => setCurrentPage('settings')}
        currentPage={currentPage}
        onWalletConnect={handleWalletConnect}
        onSocialConnect={handleSocialConnect}
        onOpenPrivacy={() => setPrivacyDialogOpen(true)}
        onOpenTerms={() => setTermsDialogOpen(true)}
        onAIAgentClick={(aiAgentId) => {
          const aiAgent = AI_AGENTS.find((a) => a.id === aiAgentId);
          if (aiAgent) {
            setSelectedAIAgent(aiAgent);
            setArticleContext(selectedArticle);
            setPreviousPage('articleDetail');
            setCurrentPage('chat');
          }
        }}
      />
    );
  }

  // Render chat page
  if (currentPage === 'chat' && selectedAIAgent) {
    return (
      <>
        <ChatPage
          aiAgent={selectedAIAgent}
          onBack={() => {
            if (previousPage === 'articleDetail' && selectedArticle) {
              setPreviousPage(null);
              setCurrentPage('articleDetail');
            } else {
              setSelectedAIAgent(null);
              setArticleContext(null);
              setPreviousPage(null);
              setCurrentPage('chat');
            }
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onNavigate={setCurrentPage}
          currentPage={currentPage}
          onWalletDisconnect={handleWalletDisconnect}
          shortenAddress={shortenAddress}
          updateUser={updateUser}
          awardXPToUser={awardXPToUser}
          trackQuestProgress={trackQuestProgress}
          onArticleClick={(article) => {
            setSelectedArticle(article);
            setPreviousPage('chat');
            setCurrentPage('articleDetail');
          }}
          onOpenSettings={() => setCurrentPage('settings')}
          onSetPendingNavigation={setPendingNavigation}
          articleContext={articleContext}
          onArticleContextUsed={() => setArticleContext(null)}
          onOpenXPInfo={() => setXPInfoDialogOpen(true)}
          initialPrompt={initialPrompt}
          onInitialPromptUsed={() => setInitialPrompt(null)}
          onReloadAiAgent={handleReloadOracle}
        />
        {commonDialogProps}
      </>
    );
  }

  // Render settings page
  if (currentPage === 'settings') {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar {...commonSidebarProps} />
        {user && (
          <div className="flex-1 overflow-y-auto">
            <SettingsPage
              onBack={() => setCurrentPage('chat')}
              user={user}
            />
          </div>
        )}
        {commonDialogProps}
      </div>
    );
  }

  // Render leaderboard page
  if (currentPage === 'leaderboard') {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar {...commonSidebarProps} />
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <LeaderboardPage user={user !== null ? user : undefined} />
          </div>
        </div>
        {commonDialogProps}
      </div>
    );
  }

  if (currentPage === "subscription") {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar - Desktop only */}
        {/* <div className="hidden md:block"> */}
        <Sidebar {...commonSidebarProps} />
        {/* </div> */}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="container mx-auto px-4 py-6">
            <SubscriptionPage
              user={user}
              onOpenWalletDialog={() => setWalletDialogOpen(true)}
              onSubscriptionSuccess={() => {
                if (user) {
                  // setUser({
                  //   ...user,
                  //   subscriptionTier: 'master',
                  // });
                  awardXPToUser('SUBSCRIBE_MASTER', { showToast: false });
                  toast.success("🎉 Welcome to Pro! You now have unlimited predictions and 2x XP!");
                }
              }}
            />
          </div>
        </div>

        {/* Bottom Navigation - Mobile only */}
        {/* <BottomNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onOpenSettings={() => setCurrentPage("settings")}
        /> */}

        {commonDialogProps}
      </div>
    );
  }

  // Default: Render AI agents listing page
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar {...commonSidebarProps} />
      <div className="flex-1 overflow-y-auto">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2">Choose Your AI Agent</h1>
            <p className="text-muted-foreground">
              Select an AI agent to get expert predictions and insights
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listOracles.map((aiAgent) => (
              <AIAgentCard
                key={aiAgent.id}
                aiAgent={aiAgent}
                onClick={() => {
                  setSelectedAIAgent(aiAgent);
                  setCurrentPage('chat');
                }}
              />
            ))}
          </div>
        </main>
      </div>
      {commonDialogProps}
    </div>
  );
}
