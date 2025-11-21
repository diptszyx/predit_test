import { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import type { WalletType } from './components/WalletConnectDialog';
import { useUserPhotoRefresh } from './hooks';
import type { User } from './lib/types';
import { useXP } from './lib/useXP';

// Components
import { AIAgentCard } from './components/AIAgentCard';
import { ArticleDetailPage } from './components/ArticleDetailPage';
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
import { News } from './services/news.service';
import { OracleEntity, oraclesServices } from './services/oracles.service';
import useAuthStore from './store/auth.store';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return true;
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
  const [listOracles, setListOracles] = useState<OracleEntity[]>([]);
  const [selectedAIAgent, setSelectedAIAgent] = useState<OracleEntity | null>(
    null
  );
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);
  const [articleContext, setArticleContext] = useState<News | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
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

  // Get current page from route
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/chat' || path.startsWith('/chat/')) return 'chat';
    if (path === '/hot-takes') return 'hotTakes';
    if (path.match(/^\/hot-takes\/[^/]+$/)) return 'hotTakeDetail';
    if (path === '/leaderboard') return 'leaderboard';
    if (path === '/subscription') return 'subscription';
    if (path === '/settings') return 'settings';
    if (path === '/oracles') return 'oracles';
    if (path.startsWith('/prediction/')) return 'shared-prediction';
    return 'home';
  };

  const currentPage = getCurrentPage();

  // Navigation helper that converts page names to routes
  const handleNavigate = (page: string) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'chat':
        // Navigate to chat with oracle if one is selected
        if (selectedAIAgent) {
          navigate(`/chat/${selectedAIAgent.id}`);
        } else {
          const savedOracleId = localStorage.getItem('deor-currentOracle');
          if (savedOracleId) {
            navigate(`/chat/${savedOracleId}`);
          } else {
            navigate('/chat');
          }
        }
        break;
      case 'hotTakes':
        navigate('/hot-takes');
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'subscription':
        navigate('/subscription');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'oracles':
        navigate('/oracles');
        break;
      default:
        navigate('/');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
        const data = await oraclesServices.getAllOracles();

        if (data?.data) setListOracles(data.data);

        if (currentPage === 'chat') {
          const currentOracleId = localStorage.getItem('deor-currentOracle');
          const oracle = data?.data.find((o) => o.id === currentOracleId);
          if (!oracle) return;
          setSelectedAIAgent(oracle);
        }
      } catch (error) {
        console.log('Failed to fetch all oracles', error);
      }
    })();
  }, [user]);

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

  // Check for referral code or OAuth token in URL
  useEffect(() => {
    const referralCode = searchParams.get('ref');
    const oauthToken = searchParams.get('token');
    const isNewUser = searchParams.get('isNew') === 'true';

    if (referralCode) {
      sessionStorage.setItem('pendingReferralCode', referralCode);
      toast.info('Referral code detected! Sign up to get your bonus.', {
        description: "You'll earn 100 XP when you create your account!",
      });
    }

    if (oauthToken) {
      // Clean URL params
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('token');
      newSearchParams.delete('isNew');
      const newUrl = newSearchParams.toString()
        ? `${location.pathname}?${newSearchParams.toString()}`
        : location.pathname;
      window.history.replaceState({}, '', newUrl);

      void (async () => {
        try {
          const authenticatedUser = await authenticateWithToken(oauthToken);

          toast.success(
            isNewUser ? 'Welcome to Predit!' : 'Signed in successfully.',
            {
              description: isNewUser
                ? "Your Google account is now linked. Let's get started."
                : "You're back in. Pick up where you left off.",
            }
          );

          if (pendingNavigation) {
            handleNavigate(pendingNavigation);
            setPendingNavigation(null);
          } else {
            const savedOracleId = localStorage.getItem('deor-currentOracle');
            if (savedOracleId) {
              navigate(`/chat/${savedOracleId}`);
            } else {
              navigate('/chat');
            }
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
  }, [searchParams, authenticateWithToken, pendingNavigation]);

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
      handleNavigate(pendingNavigation);
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
        description: 'Welcome to Predit of Predictions!',
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
    navigate('/');
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
      console.log('Failed to reload oracle', e);
    }
  };

  // Common sidebar and dialog props
  const commonSidebarProps = {
    currentPage,
    onNavigate: handleNavigate,
    user,
    onOpenWalletDialog: () => setWalletDialogOpen(true),
    onWalletDisconnect: handleWalletDisconnect,
    shortenAddress,
    onOpenSettings: () => navigate('/settings'),
    onSetPendingNavigation: setPendingNavigation,
    onOpenXPInfo: () => setXPInfoDialogOpen(true),
    darkMode,
    onToggleDarkMode: () => setDarkMode(!darkMode),
    selectedAIAgent: selectedAIAgent,
    setSelectedAIAgent: setSelectedAIAgent,
  };

  const commonDialogProps = (
    <>
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={handleWalletConnect}
        onSocialConnect={handleSocialConnect}
        onOpenPrivacy={() => {
          setPrivacyDialogOpen(true);
          setWalletDialogOpen(false);
        }}
        onOpenTerms={() => {
          setTermsDialogOpen(true);
          setWalletDialogOpen(false);
        }}
      />
      <XPInfoDialog
        open={xpInfoDialogOpen}
        onOpenChange={setXPInfoDialogOpen}
        onNavigate={handleNavigate}
      />
      <PrivacyPolicy
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
      />
      <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />
      <UserProfileDialog
        open={profileDialogOpen}
        onOpenChange={handleProfileDialogOpenChange}
        user={profileDialogUser}
        onProfileUpdated={handleProfileUpdated}
      />
      <Toaster />
    </>
  );

  return (
    <Routes>
      {/* Home Page */}
      <Route
        path="/"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Predit AI Oracles - AI-Powered Predictions</title>
              <meta
                name="description"
                content="Get expert predictions and insights from specialized AI agents. Chat with AI oracles for crypto, tech, politics, sports, and more."
              />
              <meta
                name="keywords"
                content="AI predictions, AI oracles, cryptocurrency predictions, tech predictions, sports predictions, AI agents"
              />
              <meta
                property="og:title"
                content="Predit AI Oracles - AI-Powered Predictions"
              />
              <meta
                property="og:description"
                content="Get expert predictions and insights from specialized AI agents."
              />
              <meta property="og:type" content="website" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta
                name="twitter:title"
                content="Predit AI Oracles - AI-Powered Predictions"
              />
              <meta
                name="twitter:description"
                content="Get expert predictions and insights from specialized AI agents."
              />
              <link rel="canonical" href={window.location.origin} />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
              <HomePage
                onGetStarted={() => setWalletDialogOpen(true)}
                onExplorePredictions={(prompt) => {
                  if (prompt) {
                    setInitialPrompt(prompt);
                  }
                  if (!selectedAIAgent && listOracles.length > 0) {
                    localStorage.setItem(
                      'deor-currentOracle',
                      listOracles[0].id
                    );
                    setSelectedAIAgent(listOracles[0]);
                    navigate(`/chat/${listOracles[0].id}`);
                  } else if (selectedAIAgent) {
                    navigate(`/chat/${selectedAIAgent.id}`);
                  } else {
                    navigate('/chat');
                  }
                }}
                user={user}
              />
            </div>
            {commonDialogProps}
          </div>
        }
      />

      {/* Chat Page - Oracle Selection */}
      <Route
        path="/chat"
        element={
          <div className="flex h-dvh bg-background overflow-hidden">
            <Helmet>
              <title>Chat - Select AI Oracle - Predit AI</title>
              <meta
                name="description"
                content="Choose an AI oracle to get expert predictions and insights"
              />
              <link rel="canonical" href={`${window.location.origin}/chat`} />
            </Helmet>
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
                        localStorage.setItem('deor-currentOracle', aiAgent.id);
                        setSelectedAIAgent(aiAgent);
                        navigate(`/chat/${aiAgent.id}`);
                      }}
                    />
                  ))}
                </div>
              </main>
            </div>
            {commonDialogProps}
          </div>
        }
      />

      {/* Chat Page - With Oracle */}
      <Route
        path="/chat/:oracleId"
        element={
          <ChatWithOracleWrapper
            selectedAIAgent={selectedAIAgent}
            setSelectedAIAgent={setSelectedAIAgent}
            listOracles={listOracles}
            previousPage={previousPage}
            setPreviousPage={setPreviousPage}
            selectedArticle={selectedArticle}
            setSelectedArticle={setSelectedArticle}
            articleContext={articleContext}
            setArticleContext={setArticleContext}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            user={user}
            commonSidebarProps={commonSidebarProps}
            commonDialogProps={commonDialogProps}
            handleWalletDisconnect={handleWalletDisconnect}
            setWalletDialogOpen={setWalletDialogOpen}
            handleNavigate={handleNavigate}
            currentPage={currentPage}
            updateUser={updateUser}
            awardXPToUser={awardXPToUser}
            trackQuestProgress={trackQuestProgress}
            setPendingNavigation={setPendingNavigation}
            setXPInfoDialogOpen={setXPInfoDialogOpen}
            initialPrompt={initialPrompt}
            setInitialPrompt={setInitialPrompt}
            handleReloadOracle={handleReloadOracle}
          />
        }
      />

      {/* Hot Takes Page */}
      <Route
        path="/hot-takes"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Hot Takes - Predit AI Oracles</title>
              <meta
                name="description"
                content="Explore trending news and articles analyzed by our AI oracles"
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/hot-takes`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <HotTakesPage
              onArticleClick={(article) => {
                setSelectedArticle(article);
                setPreviousPage('hotTakes');
                navigate(`/hot-takes/${article.id}`);
              }}
              onBack={() => navigate('/')}
            />
            {commonDialogProps}
          </div>
        }
      />

      {/* Hot Take Detail Page */}
      <Route
        path="/hot-takes/:hotTakeId"
        element={
          <ArticleDetailWrapper
            selectedArticle={selectedArticle}
            setSelectedArticle={setSelectedArticle}
            previousPage={previousPage}
            setPreviousPage={setPreviousPage}
            selectedAIAgent={selectedAIAgent}
            setSelectedAIAgent={setSelectedAIAgent}
            listOracles={listOracles}
            setArticleContext={setArticleContext}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            user={user}
            commonSidebarProps={commonSidebarProps}
            commonDialogProps={commonDialogProps}
            handleWalletDisconnect={handleWalletDisconnect}
            handleWalletConnect={handleWalletConnect}
            handleSocialConnect={handleSocialConnect}
            setWalletDialogOpen={setWalletDialogOpen}
            setPrivacyDialogOpen={setPrivacyDialogOpen}
            setTermsDialogOpen={setTermsDialogOpen}
            setPendingNavigation={setPendingNavigation}
          />
        }
      />

      {/* Leaderboard Page */}
      <Route
        path="/leaderboard"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Leaderboard - Predit AI Oracles</title>
              <meta
                name="description"
                content="View top predictors and compete with other users on the Predit leaderboard"
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/leaderboard`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-4 py-6">
                <LeaderboardPage user={user !== null ? user : undefined} />
              </div>
            </div>
            {commonDialogProps}
          </div>
        }
      />

      {/* Subscription Page */}
      <Route
        path="/subscription"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Subscription Plans - Predit AI Oracles</title>
              <meta
                name="description"
                content="Upgrade to Pro for unlimited predictions and exclusive features"
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/subscription`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
              <div className="container mx-auto px-4 py-6">
                <SubscriptionPage
                  user={user}
                  onOpenWalletDialog={() => setWalletDialogOpen(true)}
                  onSubscriptionSuccess={() => {
                    if (user) {
                      awardXPToUser('SUBSCRIBE_MASTER', { showToast: false });
                      toast.success(
                        '🎉 Welcome to Pro! You now have unlimited predictions and 2x XP!'
                      );
                    }
                  }}
                />
              </div>
            </div>
            {commonDialogProps}
          </div>
        }
      />

      {/* Settings Page */}
      <Route
        path="/settings"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Settings - Predit AI Oracles</title>
              <meta
                name="description"
                content="Manage your account settings and preferences"
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/settings`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            {user && (
              <div className="flex-1 overflow-y-auto">
                <SettingsPage onBack={() => navigate('/chat')} user={user} />
              </div>
            )}
            {commonDialogProps}
          </div>
        }
      />

      {/* Oracles Listing Page */}
      <Route
        path="/oracles"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>AI Oracles - Predit AI</title>
              <meta
                name="description"
                content="Browse and select from our specialized AI oracles for expert predictions"
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/oracles`}
              />
            </Helmet>
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
                        localStorage.setItem('deor-currentOracle', aiAgent.id);
                        setSelectedAIAgent(aiAgent);
                        navigate('/chat');
                      }}
                    />
                  ))}
                </div>
              </main>
            </div>
            {commonDialogProps}
          </div>
        }
      />

      {/* Shared Prediction Page */}
      <Route
        path="/prediction/:predictionId"
        element={<SharedPredictionWrapper />}
      />
    </Routes>
  );
}

// Wrapper component for Article Detail to handle params
function ArticleDetailWrapper({
  selectedArticle,
  setSelectedArticle,
  previousPage,
  setPreviousPage,
  selectedAIAgent,
  setSelectedAIAgent,
  listOracles,
  setArticleContext,
  darkMode,
  setDarkMode,
  user,
  commonSidebarProps,
  commonDialogProps,
  handleWalletDisconnect,
  handleWalletConnect,
  handleSocialConnect,
  setWalletDialogOpen,
  setPrivacyDialogOpen,
  setTermsDialogOpen,
  setPendingNavigation,
}: any) {
  const navigate = useNavigate();
  const { hotTakeId } = useParams();

  if (!selectedArticle) {
    // If no article is selected, redirect to hot takes
    useEffect(() => {
      navigate('/hot-takes');
    }, []);
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Helmet>
        <title>{selectedArticle.title} - Predit AI</title>
        <meta
          name="description"
          content={
            selectedArticle.summary ||
            'Read detailed analysis and predictions from our AI oracles'
          }
        />
        <meta
          property="og:title"
          content={`${selectedArticle.title} - Predit AI`}
        />
        <meta
          property="og:description"
          content={
            selectedArticle.summary || 'AI-powered analysis and predictions'
          }
        />
        <link
          rel="canonical"
          href={`${window.location.origin}/hot-takes/${hotTakeId}`}
        />
      </Helmet>
      <Sidebar {...commonSidebarProps} />
      <div className="flex-1 overflow-y-auto">
        <ArticleDetailPage
          hotTake={selectedArticle}
          onSelectRelated={setSelectedArticle}
          previousPage={previousPage}
          onBack={() => {
            if (previousPage === 'chat' && selectedAIAgent) {
              setPreviousPage(null);
              navigate('/chat');
            } else if (previousPage === 'hotTakes') {
              setPreviousPage(null);
              navigate('/hot-takes');
            } else if (previousPage === 'home') {
              setPreviousPage(null);
              navigate('/');
            } else {
              setPreviousPage(null);
              navigate('/chat');
            }
            setSelectedArticle(null);
          }}
          aiAgentName={selectedAIAgent?.name}
          aiAgentSpecialty={selectedAIAgent?.type}
          user={user}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onNavigate={(page: string) => {
            switch (page) {
              case 'home':
                navigate('/');
                break;
              case 'chat':
                navigate('/chat');
                break;
              case 'hotTakes':
                navigate('/hot-takes');
                break;
              default:
                navigate('/');
            }
          }}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onWalletDisconnect={handleWalletDisconnect}
          shortenAddress={shortenAddress}
          onSetPendingNavigation={setPendingNavigation}
          onOpenSettings={() => navigate('/settings')}
          currentPage="articleDetail"
          onWalletConnect={handleWalletConnect}
          onSocialConnect={handleSocialConnect}
          onOpenPrivacy={() => setPrivacyDialogOpen(true)}
          onOpenTerms={() => setTermsDialogOpen(true)}
          onAIAgentClick={(aiAgentId: string) => {
            const aiAgent = listOracles.find(
              (a: OracleEntity) => a.id === aiAgentId
            );
            if (aiAgent) {
              setSelectedAIAgent(aiAgent);
              localStorage.setItem('deor-currentOracle', aiAgent.id);
              setArticleContext(selectedArticle);
              setPreviousPage('articleDetail');
              navigate(`/chat/${aiAgent.id}`);
            }
          }}
        />
      </div>
      {commonDialogProps}
    </div>
  );
}

// Wrapper component for Chat with Oracle
function ChatWithOracleWrapper({
  selectedAIAgent,
  setSelectedAIAgent,
  listOracles,
  previousPage,
  setPreviousPage,
  selectedArticle,
  setSelectedArticle,
  articleContext,
  setArticleContext,
  darkMode,
  setDarkMode,
  user,
  commonSidebarProps,
  commonDialogProps,
  handleWalletDisconnect,
  setWalletDialogOpen,
  handleNavigate,
  currentPage,
  updateUser,
  awardXPToUser,
  trackQuestProgress,
  setPendingNavigation,
  setXPInfoDialogOpen,
  initialPrompt,
  setInitialPrompt,
  handleReloadOracle,
}: any) {
  const navigate = useNavigate();
  const { oracleId } = useParams();

  // Load oracle from URL param if not already selected
  useEffect(() => {
    if (oracleId && listOracles.length > 0) {
      const oracle = listOracles.find((o: OracleEntity) => o.id === oracleId);
      if (oracle && (!selectedAIAgent || selectedAIAgent.id !== oracleId)) {
        setSelectedAIAgent(oracle);
        localStorage.setItem('deor-currentOracle', oracleId);
      } else if (!oracle) {
        // Oracle not found, redirect to chat selection
        navigate('/chat');
      }
    }
  }, [oracleId, listOracles, selectedAIAgent]);

  if (!selectedAIAgent) {
    return null; // Wait for oracle to load
  }

  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      <Helmet>
        <title>Chat with {selectedAIAgent.name} - Predit AI</title>
        <meta
          name="description"
          content={`Get expert predictions from ${selectedAIAgent.name}, a ${selectedAIAgent.type}`}
        />
        <link
          rel="canonical"
          href={`${window.location.origin}/chat/${oracleId}`}
        />
      </Helmet>
      <Sidebar {...commonSidebarProps} />
      <div className="flex-1 overflow-y-auto">
        <ChatPage
          aiAgent={selectedAIAgent}
          onBack={() => {
            if (previousPage === 'articleDetail' && selectedArticle) {
              setPreviousPage(null);
              navigate(`/hot-takes/${selectedArticle.id}`);
            } else {
              setSelectedAIAgent(null);
              setArticleContext(null);
              setPreviousPage(null);
              navigate('/chat');
            }
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onWalletDisconnect={handleWalletDisconnect}
          shortenAddress={shortenAddress}
          updateUser={updateUser}
          awardXPToUser={awardXPToUser}
          trackQuestProgress={trackQuestProgress}
          onArticleClick={(article: News) => {
            setSelectedArticle(article);
            setPreviousPage('chat');
            navigate(`/hot-takes/${article.id}`);
          }}
          onOpenSettings={() => navigate('/settings')}
          onSetPendingNavigation={setPendingNavigation}
          articleContext={articleContext}
          onArticleContextUsed={() => setArticleContext(null)}
          onOpenXPInfo={() => setXPInfoDialogOpen(true)}
          initialPrompt={initialPrompt}
          onInitialPromptUsed={() => setInitialPrompt(null)}
          onReloadAiAgent={handleReloadOracle}
        />
      </div>
      {commonDialogProps}
    </div>
  );
}

// Wrapper component for Shared Prediction
function SharedPredictionWrapper() {
  const navigate = useNavigate();
  const { predictionId } = useParams();

  return (
    <>
      <Helmet>
        <title>Shared Prediction - Predit AI Oracles</title>
        <meta
          name="description"
          content="View shared prediction from Predit AI Oracles"
        />
        <link
          rel="canonical"
          href={`${window.location.origin}/prediction/${predictionId}`}
        />
      </Helmet>
      <SharedPredictionPage
        predictionId={predictionId || ''}
        onBack={() => {
          navigate('/chat');
        }}
      />
    </>
  );
}
