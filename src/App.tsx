import { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
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
import MarketDetail from './components/market/MarketDetail';
import MarketDetailAdmin from './components/market/MarketDetailAdmin';
import MarketPage from './components/MarketPage';
import PolymarketPage from './components/PolymarketPage';
import PolymarketDetail from './components/polymarket/PolymarketDetail';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { SettingsPage } from './components/SettingsPage';
import { SharedPredictionPage } from './components/SharedPredictionPage';
import { Sidebar } from './components/Sidebar';
import { SubscriptionPage } from './components/SubscriptionPage';
import { TermsOfUse } from './components/TermsOfUse';
import TopicPage from './components/topic/TopicPage';
import UserProfileDialog from './components/UserProfileDialog';
import { WalletConnectDialog } from './components/WalletConnectDialog';
import { XPInfoDialog } from './components/XPInfoDialog';
import { ADMIN_EMAILS, ADMIN_IDS } from './constants/admin';
import { shortenAddress } from './lib/address';
import { News } from './services/news.service';
import { OracleEntity, oraclesServices } from './services/oracles.service';
import { inviteCodeService } from './services/invite-code.service';
import useAuthStore from './store/auth.store';
import InviteCodePage from './pages/InviteCodePage';
import InviteCodeGuard from './components/guard/InviteCodeGuard';

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
    if (path === '/market') return 'market';
    if (path === '/polymarket') return 'polymarket';
    if (path === '/topic') return 'topic';
    if (path === '/invites') return 'invites';
    if (path.match(/^\/market\/[^/]+$/)) return 'market-detail';
    if (path.match(/^\/polymarket\/[^/]+$/)) return 'polymarket-detail';
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
      case 'market':
        navigate('/market');
        break;
      case 'polymarket':
        navigate('/polymarket');
        break;
      case 'topic':
        navigate('/topic');
        break;
      case 'invites':
        navigate('/invites');
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

  // Check for invite code, invite code or OAuth token in URL
  useEffect(() => {
    const inviteCodeFromUrl = searchParams.get('invitecode');
    const oauthToken = searchParams.get('token');
    const isNewUser = searchParams.get('isNew') === 'true';
    const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

    if (inviteCodeFromUrl && !isAdmin) {
      sessionStorage.setItem('pendingInviteCode', inviteCodeFromUrl);
      if (user?.id) {
        handleInviteCodeAutoApply();
      } else {
        toast.info('Invite code detected! Sign up to get your bonus.', {
          description: "You'll earn 300 XP when you create your account!",
        });
      }
    }

    // Handle OAuth token
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
          handleInviteCodeAutoApply();

          toast.success(
            isNewUser ? 'Welcome to Predit Market!' : 'Signed in successfully.',
            {
              description: isNewUser
                ? "Your Google account is now linked. Let's get started."
                : "You're back in. Pick up where you left off.",
            }
          );

          if (pendingNavigation) {
            handleNavigate(pendingNavigation);
            setPendingNavigation(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleWalletConnect = (walletType: WalletType, user: User) => {
    setWalletDialogOpen(false);

    handleInviteCodeAutoApply();

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
    // handleInviteCodeAutoApply();
  };

  const handleInviteCodeAutoApply = async () => {
    const inviteCode = sessionStorage.getItem('pendingInviteCode');
    if (!inviteCode) return;

    try {
      if (user?.appliedInviteCode) {
        return toast.success(`You're applied code before`, {
          description: 'Welcome to Predict Market of Predictions!',
        });
      }
      await inviteCodeService.applyCode(inviteCode);

      toast.success('🎉 Bonus applied! +300 XP', {
        description: 'Welcome to Predict Market of Predictions!',
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? 'Failed to apply invite code'
      );
    } finally {
      sessionStorage.removeItem('pendingInviteCode');
      fetchCurrentUser();
      navigate('/');
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
    isAdmin: user && user.email ? ADMIN_EMAILS.includes(user.email) : false,
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
              <title>
                AI-Powered Market Predictions | Predit Market AI Oracles
                Platform
              </title>
              <meta
                name="description"
                content="AI-powered market predictions and expert insights from specialized AI oracles. Get predictions for crypto, tech, politics, sports, and financial markets with our AI agents platform."
              />
              <meta
                name="keywords"
                content="AI-powered predictions, AI oracles, market predictions, cryptocurrency predictions, tech predictions, sports predictions, AI agents, financial market analysis"
              />
              <meta
                property="og:title"
                content="AI-Powered Market Predictions | Predit Market AI Oracles Platform"
              />
              <meta
                property="og:description"
                content="AI-powered market predictions and expert insights from specialized AI oracles. Get predictions for crypto, tech, politics, and financial markets."
              />
              <meta property="og:type" content="website" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta
                name="twitter:title"
                content="AI-Powered Market Predictions | Predit Market AI Oracles Platform"
              />
              <meta
                name="twitter:description"
                content="AI-powered market predictions and expert insights from specialized AI oracles. Get predictions for crypto, tech, politics, and financial markets."
              />
              <link rel="canonical" href={window.location.origin} />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <div className="flex-1 overflow-y-auto">
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
              <title>
                Chat with AI Oracle Agents | Expert Market Predictions
              </title>
              <meta
                name="description"
                content="Chat with specialized AI oracle agents for expert market predictions. Choose from crypto, tech, politics, and financial market AI oracles to get personalized predictions and insights."
              />
              <meta
                name="keywords"
                content="AI oracle chat, AI agents, market predictions, crypto oracle, tech oracle, financial predictions, AI chat, expert predictions"
              />
              <meta
                property="og:title"
                content="Chat with AI Oracle Agents | Expert Market Predictions"
              />
              <meta
                property="og:description"
                content="Chat with specialized AI oracle agents for expert market predictions and insights."
              />
              <link rel="canonical" href={`${window.location.origin}/chat`} />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              <div className="flex-1 overflow-y-auto">
                <main className="container mx-auto px-4 py-8">
                  <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl mb-2">
                      Choose Your AI Oracle Agent
                    </h1>
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
                          localStorage.setItem(
                            'deor-currentOracle',
                            aiAgent.id
                          );
                          setSelectedAIAgent(aiAgent);
                          navigate(`/chat/${aiAgent.id}`);
                        }}
                      />
                    ))}
                  </div>
                </main>
              </div>
            </InviteCodeGuard>
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
              <title>
                Hot Takes & Market News | AI Oracle Analysis & Predictions
              </title>
              <meta
                name="description"
                content="Explore hot takes and trending market news analyzed by AI oracles. Get predictions and expert analysis on crypto, tech, and financial market news from our AI prediction platform."
              />
              <meta
                name="keywords"
                content="hot takes, market news, AI analysis, oracle predictions, crypto news, tech news, financial news analysis, AI predictions"
              />
              <meta
                property="og:title"
                content="Hot Takes & Market News | AI Oracle Analysis & Predictions"
              />
              <meta
                property="og:description"
                content="Explore trending market news and hot takes analyzed by AI oracles with expert predictions."
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
                navigate(`/hot-takes/${article.slug}`);
              }}
              onBack={() => navigate('/')}
            />
            {commonDialogProps}
          </div>
        }
      />

      {/* Hot Take Detail Page */}
      <Route
        path="/hot-takes/:slug"
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
              <title>
                Prediction Leaderboard | Top AI Oracle Users & Rankings
              </title>
              <meta
                name="description"
                content="View the prediction leaderboard and top AI oracle users. Compete with other predictors, track your rankings, earn XP, and climb the leaderboard on our AI predictions platform."
              />
              <meta
                name="keywords"
                content="prediction leaderboard, top predictors, AI oracle rankings, user rankings, XP leaderboard, prediction competition, AI platform rankings"
              />
              <meta
                property="og:title"
                content="Prediction Leaderboard | Top AI Oracle Users & Rankings"
              />
              <meta
                property="og:description"
                content="View top predictors and compete on the prediction leaderboard. Track rankings and earn XP."
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/leaderboard`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-6">
                  <LeaderboardPage user={user !== null ? user : undefined} />
                </div>
              </div>
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
      />

      {/* Subscription Page */}
      <Route
        path="/subscription"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>
                Subscription Plans & Pricing | Unlimited AI Predictions
              </title>
              <meta
                name="description"
                content="Subscription plans and pricing for AI oracle predictions. Upgrade to Pro for unlimited predictions, 2x XP rewards, and exclusive AI market analysis features on our prediction platform."
              />
              <meta
                name="keywords"
                content="subscription plans, pricing, unlimited predictions, pro subscription, AI predictions pricing, oracle subscription, premium features"
              />
              <meta
                property="og:title"
                content="Subscription Plans & Pricing | Unlimited AI Predictions"
              />
              <meta
                property="og:description"
                content="Upgrade to Pro for unlimited AI oracle predictions and exclusive features."
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/subscription`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
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
            </InviteCodeGuard>
          </div>
        }
      />

      {/* Settings Page */}
      <Route
        path="/settings"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Account Settings | AI Oracle Predictions Platform</title>
              <meta
                name="description"
                content="Manage your account settings and preferences for the AI oracle predictions platform. Update profile, manage subscription, and customize your prediction experience."
              />
              <meta
                name="keywords"
                content="account settings, user preferences, profile settings, subscription management, AI oracle settings, prediction platform settings"
              />
              <meta
                property="og:title"
                content="Account Settings | AI Oracle Predictions Platform"
              />
              <meta
                property="og:description"
                content="Manage your account settings and preferences for AI oracle predictions."
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/settings`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              {user && (
                <div className="flex-1 overflow-y-auto">
                  <SettingsPage onBack={() => navigate('/chat')} user={user} />
                </div>
              )}
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
      />

      {/* Oracles Listing Page */}
      <Route
        path="/oracles"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>
                Browse AI Oracle Agents | Expert Market Prediction Tools
              </title>
              <meta
                name="description"
                content="Browse and select from specialized AI oracle agents for expert market predictions. Access crypto oracles, tech oracles, political prediction agents, and financial market analysis tools."
              />
              <meta
                name="keywords"
                content="AI oracles, oracle agents, crypto oracle, tech oracle, market prediction tools, AI prediction agents, financial oracles, expert AI agents"
              />
              <meta
                property="og:title"
                content="Browse AI Oracle Agents | Expert Market Prediction Tools"
              />
              <meta
                property="og:description"
                content="Browse specialized AI oracle agents for expert market predictions and analysis."
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/oracles`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              <div className="flex-1 overflow-y-auto">
                <main className="container mx-auto px-4 py-8">
                  <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl mb-2">
                      AI Oracle Agents - Expert Market Predictions
                    </h1>
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
                          localStorage.setItem(
                            'deor-currentOracle',
                            aiAgent.id
                          );
                          setSelectedAIAgent(aiAgent);
                          navigate('/chat');
                        }}
                      />
                    ))}
                  </div>
                </main>
              </div>
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
      />

      {/* Market List Page */}
      <Route
        path="/market"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Market - Predit Market AI Oracles</title>
              <meta
                name="description"
                content="Create and manage prediction markets powered by AI Oracles."
              />
              <link rel="canonical" href={`${window.location.origin}/market`} />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              {user && (
                <div className="flex-1 overflow-y-auto">
                  <MarketPage />
                </div>
              )}
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
      />
      {/* Topics Page */}
      <Route
        path="/topic"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Topic - Predit Market AI Oracles</title>
              <meta
                name="description"
                content="Create and manage topics powered by AI Oracles."
              />
              <link rel="canonical" href={`${window.location.origin}/topic`} />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              {user && (
                <div className="flex-1 overflow-y-auto">
                  <TopicPage />
                </div>
              )}
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
      />

      {/* Market Detail Page */}
      <Route
        path="/market/:marketId"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Market Detail - Predit Market AI Oracles</title>
              <meta
                name="description"
                content="View and manage prediction market details."
              />
              <link rel="canonical" href={`${window.location.origin}/market`} />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              {user && (
                <div className="flex-1 overflow-y-auto">
                  {user.email && ADMIN_EMAILS.includes(user.email) ? (
                    <MarketDetailAdmin />
                  ) : (
                    <MarketDetail />
                  )}
                </div>
              )}
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
      />

      {/* Polymarket List Page */}
      <Route
        path="/polymarket"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Polymarket - Real-World Prediction Markets</title>
              <meta
                name="description"
                content="Trade on real-world events with Polymarket markets. Get the best odds on politics, crypto, sports and more."
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/polymarket`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              {user && (
                <div className="flex-1 overflow-y-auto">
                  <PolymarketPage />
                </div>
              )}
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
      />

      {/* Polymarket Detail Page */}
      <Route
        path="/polymarket/:id"
        element={
          <div className="flex h-screen bg-background overflow-hidden">
            <Helmet>
              <title>Market Details - Polymarket</title>
              <meta
                name="description"
                content="View market details and place trades on Polymarket."
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/polymarket`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              {user && (
                <div className="flex-1 overflow-y-auto">
                  <PolymarketDetail />
                </div>
              )}
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
      />

      {/* Shared Prediction Page */}
      <Route
        path="/prediction/:predictionId"
        element={<SharedPredictionWrapper />}
      />

      <Route
        path="/invites"
        element={
          <div className="flex h-dvh bg-background overflow-hidden">
            <Helmet>
              <title>
                Invite with AI Oracle Agents | Expert Market Predictions
              </title>
              <meta
                name="description"
                content="Invite with specialized AI oracle agents for expert market predictions. Choose from crypto, tech, politics, and financial market AI oracles to get personalized predictions and insights."
              />
              <meta
                name="keywords"
                content="AI oracle chat, AI agents, market predictions, crypto oracle, tech oracle, financial predictions, AI chat, expert predictions"
              />
              <meta
                property="og:title"
                content="Invite with AI Oracle Agents | Expert Market Predictions"
              />
              <meta
                property="og:description"
                content="Invite with specialized AI oracle agents for expert market predictions and insights."
              />
              <link
                rel="canonical"
                href={`${window.location.origin}/invites`}
              />
            </Helmet>
            <Sidebar {...commonSidebarProps} />
            <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
              <div className="flex-1 overflow-y-auto">
                <main className="container mx-auto px-4 py-8">
                  <InviteCodePage />
                </main>
              </div>
              {commonDialogProps}
            </InviteCodeGuard>
          </div>
        }
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
  const { slug } = useParams();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar {...commonSidebarProps} />
      <div className="flex-1 overflow-y-auto">
        <ArticleDetailPage
          hotTake={selectedArticle}
          onSelectRelated={setSelectedArticle}
          previousPage={previousPage}
          onBack={() => {
            if (previousPage === 'chat' && selectedAIAgent) {
              setPreviousPage(null);
              navigate(`/chat/${selectedAIAgent}`);
            } else if (previousPage === 'hotTakes') {
              setPreviousPage(null);
              navigate('/hot-takes');
            } else if (previousPage === 'home') {
              setPreviousPage(null);
              navigate('/');
            } else {
              setPreviousPage(null);
              navigate(-1);
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
        <title>
          Chat with {selectedAIAgent.name} | {selectedAIAgent.type} Oracle
          Predictions
        </title>
        <meta
          name="description"
          content={`Chat with ${selectedAIAgent.name} AI oracle for expert ${selectedAIAgent.type} predictions. Get personalized market insights, analysis, and predictions from our specialized AI agent.`}
        />
        <meta
          name="keywords"
          content={`${selectedAIAgent.name}, ${selectedAIAgent.type} oracle, AI predictions, chat with AI oracle, market predictions, AI analysis, expert predictions`}
        />
        <meta
          property="og:title"
          content={`Chat with ${selectedAIAgent.name} | ${selectedAIAgent.type} Oracle Predictions`}
        />
        <meta
          property="og:description"
          content={`Get expert ${selectedAIAgent.type} predictions from ${selectedAIAgent.name} AI oracle.`}
        />
        <link
          rel="canonical"
          href={`${window.location.origin}/chat/${oracleId}`}
        />
      </Helmet>
      <Sidebar {...commonSidebarProps} />
      <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
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
      </InviteCodeGuard>
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
        <title>Shared AI Prediction | Market Oracle Analysis</title>
        <meta
          name="description"
          content="View shared AI oracle prediction and market analysis. Explore expert predictions, insights, and market forecasts from our AI prediction platform."
        />
        <meta
          name="keywords"
          content="shared prediction, AI oracle prediction, market analysis, prediction sharing, AI forecast, oracle insights, market prediction"
        />
        <meta
          property="og:title"
          content="Shared AI Prediction | Market Oracle Analysis"
        />
        <meta
          property="og:description"
          content="View shared AI oracle prediction and market analysis from our expert prediction platform."
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
