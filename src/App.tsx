import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { useXP } from "./lib/useXP";
import { mockUser } from "./lib/mockData";
import type { AIAgent, User } from "./lib/types";
import type {
  WalletType,
  SocialProvider,
} from "./components/WalletConnectDialog";

// Components
import { ChatPage } from "./components/ChatPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { SettingsPage } from "./components/SettingsPage";
import { HotTakesPage } from "./components/HotTakesPage";
import { SharedPredictionPage } from "./components/SharedPredictionPage";
import {
  ArticleDetailPage,
  type HotTakeArticle,
} from "./components/ArticleDetailPage";
import { Sidebar } from "./components/Sidebar";
import { WalletConnectDialog } from "./components/WalletConnectDialog";
import { XPInfoDialog } from "./components/XPInfoDialog";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfUse } from "./components/TermsOfUse";
import { AIAgentCard } from "./components/AIAgentCard";

// Constants
const AI_AGENT_IMAGES = {
  crypto:
    "https://images.unsplash.com/photo-1672071673701-4c9a564c8046?w=800&q=80",
  tech: "https://images.unsplash.com/photo-1643962579365-3a9222e923b8?w=800&q=80",
  politics:
    "https://images.unsplash.com/photo-1567619863607-cb9e8f595a95?w=800&q=80",
  sports:
    "https://images.unsplash.com/photo-1744782211816-c5224434614f?w=800&q=80",
  entertainment:
    "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&q=80",
  fortune:
    "https://images.unsplash.com/photo-1618071264149-da6cfa159cfd?w=800&q=80",
  gaming:
    "https://images.unsplash.com/photo-1719937075989-795943caad2a?w=800&q=80",
  general:
    "https://images.unsplash.com/photo-1676410205325-5d01d0107039?w=800&q=80",
};

// Hot Takes Articles Data
const HOT_TAKE_ARTICLES: HotTakeArticle[] = [
  {
    id: "art-1",
    title: "Bitcoin's Next Move: Why $100K Is Just The Beginning",
    source: "Crypto AI Agent",
    url: "#",
    publishedAt: "2 hours ago",
    relevance: "High",
    image:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
    aiAgentAvatar: AI_AGENT_IMAGES.crypto,
    likes: 342,
    comments: 87,
    shares: 156,
    aiAgentId: "crypto",
  },
  {
    id: "art-2",
    title: "The AI Revolution: What Most Investors Are Missing",
    source: "Tech Prophet",
    url: "#",
    publishedAt: "5 hours ago",
    relevance: "High",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    aiAgentAvatar: AI_AGENT_IMAGES.tech,
    likes: 521,
    comments: 143,
    shares: 234,
    aiAgentId: "technical-analysis",
  },
  {
    id: "art-3",
    title: "Election 2024: The Prediction Markets Were Right All Along",
    source: "Political Sage",
    url: "#",
    publishedAt: "1 day ago",
    relevance: "Medium",
    image:
      "https://images.unsplash.com/photo-1569690784119-2bcf528a2663?w=800&q=80",
    aiAgentAvatar: AI_AGENT_IMAGES.fortune,
    likes: 289,
    comments: 92,
    shares: 178,
    aiAgentId: "crypto-crystal",
  },
  {
    id: "art-4",
    title: "Ethereum's Layer 2 Explosion: The Silent Revolution",
    source: "Crypto AI Agent",
    url: "#",
    publishedAt: "1 day ago",
    relevance: "High",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    aiAgentAvatar: AI_AGENT_IMAGES.crypto,
    likes: 467,
    comments: 124,
    shares: 201,
    aiAgentId: "crypto",
  },
];

// AI Agents Data
const AI_AGENTS: AIAgent[] = [
  {
    id: "crypto-crystal",
    name: "Crypto Crystal Czar",
    emoji: "💎",
    title: "Cryptocurrency Expert",
    description:
      "Master of blockchain technology and cryptocurrency markets. Analyzes market trends, tokenomics, DeFi protocols, and on-chain data to provide insights on Bitcoin, Ethereum, altcoins, and emerging crypto projects.",
    gradient: "from-cyan-500 via-blue-600 to-blue-700",
    category: "Cryptocurrency",
    rating: "91%",
    likes: "12.3K",
    consultSessions: "58.2K",
    specialty: "Crypto Analysis",
    tags: ["Bitcoin", "DeFi", "Altcoins", "Blockchain"],
    avatar: AI_AGENT_IMAGES.fortune,
    bgColor: "bg-cyan-500/10",
  },
];

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // App state
  const [currentPage, setCurrentPage] = useState<string>("chat");
  const [user, setUser] = useState<User | null>(null);
  const [selectedAIAgent, setSelectedAIAgent] = useState<AIAgent | null>(null);
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

  // Dialog state
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [xpInfoDialogOpen, setXPInfoDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // XP system hook
  const { awardXPToUser, trackQuestProgress } = useXP(user, updateUser);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Set default AI agent
  useEffect(() => {
    if (AI_AGENTS.length > 0 && !selectedAIAgent) {
      setSelectedAIAgent(AI_AGENTS[0]);
    }
  }, [selectedAIAgent]);

  // Check for shared prediction or referral code in URL
  useEffect(() => {
    const path = window.location.pathname;
    const predictionMatch = path.match(/\/prediction\/([^/]+)/);

    if (predictionMatch) {
      setSharedPredictionId(predictionMatch[1]);
      setCurrentPage("shared-prediction");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("ref");

    if (referralCode) {
      sessionStorage.setItem("pendingReferralCode", referralCode);
      toast.info("Referral code detected! Sign up to get your bonus.", {
        description: "You'll earn 100 XP when you create your account!",
      });
    }
  }, []);

  // Utility functions
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const generateMockAddress = (): string => {
    const chars = "0123456789abcdef";
    let address = "0x";
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  };

  const generateMockEmail = (provider: SocialProvider): string => {
    const timestamp = Date.now();
    return provider === "google"
      ? `user${timestamp}@gmail.com`
      : `user${timestamp}@icloud.com`;
  };

  // Auth handlers
  const handleWalletConnect = (walletType: WalletType) => {
    const walletAddress = generateMockAddress();
    const referralCode = sessionStorage.getItem("pendingReferralCode");
    let initialXP = mockUser.xp;

    if (referralCode) {
      initialXP += 100;
      toast.success("🎉 Referral bonus applied! +100 XP", {
        description: "Welcome to Dehouse of Predictions!",
      });
      sessionStorage.removeItem("pendingReferralCode");
    }

    const newUser: User = {
      ...mockUser,
      walletAddress,
      walletType,
      xp: initialXP,
      referredBy: referralCode || undefined,
      referralCode: undefined,
      referredFriends: [],
    };

    setUser(newUser);
    setWalletDialogOpen(false);
    toast.success(`Connected with ${walletType}!`);

    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSocialConnect = (provider: SocialProvider) => {
    const email = generateMockEmail(provider);
    const referralCode = sessionStorage.getItem("pendingReferralCode");
    let initialXP = mockUser.xp;

    if (referralCode) {
      initialXP += 100;
      toast.success("🎉 Referral bonus applied! +100 XP", {
        description: "Welcome to Dehouse of Predictions!",
      });
      sessionStorage.removeItem("pendingReferralCode");
    }

    const newUser: User = {
      ...mockUser,
      email,
      socialProvider: provider,
      xp: initialXP,
      referredBy: referralCode || undefined,
      referralCode: undefined,
      referredFriends: [],
    };

    setUser(newUser);
    setWalletDialogOpen(false);
    toast.success(`Connected with ${provider}!`);

    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleWalletDisconnect = () => {
    setUser(null);
    setCurrentPage("chat");
    toast.info("Wallet disconnected");
  };

  // Common sidebar and dialog props
  const commonSidebarProps = {
    currentPage,
    onNavigate: setCurrentPage,
    user,
    onOpenWalletDialog: () => setWalletDialogOpen(true),
    onWalletDisconnect: handleWalletDisconnect,
    shortenAddress,
    onOpenSettings: () => setCurrentPage("settings"),
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
      <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />
      <Toaster />
    </>
  );

  // Render shared prediction page
  if (currentPage === "shared-prediction" && sharedPredictionId) {
    return (
      <SharedPredictionPage
        predictionId={sharedPredictionId}
        onBack={() => {
          setSharedPredictionId(null);
          setCurrentPage("chat");
          window.history.pushState({}, "", "/");
        }}
      />
    );
  }

  // Render hot takes page
  if (currentPage === "hotTakes") {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar {...commonSidebarProps} />
        <div className="flex-1 overflow-y-auto">
          <HotTakesPage
            articles={HOT_TAKE_ARTICLES}
            onArticleClick={(article) => {
              setSelectedArticle(article);
              setPreviousPage("hotTakes");
              setCurrentPage("articleDetail");
            }}
            onBack={() => setCurrentPage("chat")}
          />
        </div>
        {commonDialogProps}
      </div>
    );
  }

  // Render article detail page
  if (currentPage === "articleDetail" && selectedArticle) {
    return (
      <ArticleDetailPage
        hotTake={selectedArticle}
        onBack={() => {
          setSelectedArticle(null);
          if (previousPage === "chat" && selectedAIAgent) {
            setPreviousPage(null);
            setCurrentPage("chat");
          } else if (previousPage === "hotTakes") {
            setPreviousPage(null);
            setCurrentPage("hotTakes");
          } else {
            setPreviousPage(null);
            setCurrentPage("chat");
          }
        }}
        aiAgentName={selectedAIAgent?.name}
        aiAgentSpecialty={selectedAIAgent?.specialty}
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNavigate={setCurrentPage}
        onOpenWalletDialog={() => setWalletDialogOpen(true)}
        onWalletDisconnect={handleWalletDisconnect}
        shortenAddress={shortenAddress}
        onSetPendingNavigation={setPendingNavigation}
        onOpenSettings={() => setCurrentPage("settings")}
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
            setPreviousPage("articleDetail");
            setCurrentPage("chat");
          }
        }}
      />
    );
  }

  // Render chat page
  if (currentPage === "chat" && selectedAIAgent) {
    return (
      <>
        <ChatPage
          aiAgent={selectedAIAgent}
          onBack={() => {
            if (previousPage === "articleDetail" && selectedArticle) {
              setPreviousPage(null);
              setCurrentPage("articleDetail");
            } else {
              setSelectedAIAgent(null);
              setArticleContext(null);
              setPreviousPage(null);
              setCurrentPage("chat");
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
            setPreviousPage("chat");
            setCurrentPage("articleDetail");
          }}
          onOpenSettings={() => setCurrentPage("settings")}
          onSetPendingNavigation={setPendingNavigation}
          articleContext={articleContext}
          onArticleContextUsed={() => setArticleContext(null)}
          onOpenXPInfo={() => setXPInfoDialogOpen(true)}
        />
        {commonDialogProps}
      </>
    );
  }

  // Render settings page
  if (currentPage === "settings") {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar {...commonSidebarProps} />
        <div className="flex-1 overflow-y-auto">
          <SettingsPage onBack={() => setCurrentPage("chat")} user={user} />
        </div>
        {commonDialogProps}
      </div>
    );
  }

  // Render leaderboard page
  if (currentPage === "leaderboard") {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar {...commonSidebarProps} />
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <LeaderboardPage user={user} />
          </div>
        </div>
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
            {AI_AGENTS.map((aiAgent) => (
              <AIAgentCard
                key={aiAgent.id}
                aiAgent={aiAgent}
                onClick={() => {
                  setSelectedAIAgent(aiAgent);
                  setCurrentPage("chat");
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
