import React, { useState, useEffect, useRef } from "react";
import { Button } from "./components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Twitter,
  MessageCircle,
  Search,
} from "lucide-react";
import { Input } from "./components/ui/input";
import { ChatPage } from "./components/ChatPage";
import { Dashboard } from "./components/Dashboard";
import { SubscriptionPage } from "./components/SubscriptionPage";
import { HousesPage } from "./components/HousesPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { SettingsPage } from "./components/SettingsPage";
import {
  WalletConnectDialog,
  type WalletType,
  type SocialProvider,
} from "./components/WalletConnectDialog";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfUse } from "./components/TermsOfUse";
import { RotatingBanners } from "./components/RotatingBanners";
import { BetDetailPage } from "./components/BetDetailPage";
import { HouseDetailPage } from "./components/HouseDetailPage";
import { OracleCard } from "./components/OracleCard";
import { UnifiedHeader } from "./components/UnifiedHeader";
import { SharedPredictionPage } from "./components/SharedPredictionPage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { mockUser, platformStats, houses, houseMembers } from "./lib/mockData";
import type { Oracle, User } from "./lib/types";
import { useXP } from "./lib/useXP";
import { getLevelTitle } from "./lib/xpSystem";
// Oracle avatar images
import oracleImg1 from "/20250320060028336922.png";
import oracleImg2 from "/20250320060028336922.png";
import oracleImg3 from "/20250320060028336922.png";
import oracleImg4 from "/20250320060028336922.png";
import oracleImg5 from "/20250320060028336922.png";
import oracleImg6 from "/20250320060028336922.png";
import oracleImg7 from "/20250320060028336922.png";
import oracleImg8 from "/20250320060028336922.png";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedOracle, setSelectedOracle] = useState<Oracle | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("oracles");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [selectedBetId, setSelectedBetId] = useState<string | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [totalQuestionsAsked, setTotalQuestionsAsked] = useState(0);
  const [userCreatedMarkets, setUserCreatedMarkets] = useState<any[]>([]);
  const [sharedPredictionId, setSharedPredictionId] = useState<string | null>(
    null
  );
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // XP system hook
  const { awardXPToUser } = useXP(user, updateUser);

  // Market management
  const handleAddMarket = (market: any) => {
    setUserCreatedMarkets((prev) => [...prev, market]);
    awardXPToUser("CREATE_MARKET");
  };

  // House management
  const handleJoinHouse = (houseId: string) => {
    updateUser({ house: houseId });
    awardXPToUser("JOIN_HOUSE");
  };

  const handleSwitchHouse = (houseId: string) => {
    const currentSwitches = user?.houseSwitchesUsed ?? 0;
    updateUser({
      house: houseId,
      houseSwitchesUsed: currentSwitches + 1,
    });
    awardXPToUser("JOIN_HOUSE");
  };

  const handleLeaveHouse = () => {
    updateUser({ house: undefined });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Check if URL is a shared prediction or has referral code
  useEffect(() => {
    const path = window.location.pathname;
    console.log("Current pathname:", path);
    const predictionMatch = path.match(/\/prediction\/([^/]+)/);
    if (predictionMatch) {
      console.log("Shared prediction detected! ID:", predictionMatch[1]);
      setSharedPredictionId(predictionMatch[1]);
      setCurrentPage("shared-prediction");
    }

    // Check for referral code in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("ref");
    if (referralCode) {
      console.log("Referral code detected:", referralCode);
      // Store referral code in session storage for use during onboarding
      sessionStorage.setItem("pendingReferralCode", referralCode);
      toast.info("Referral code detected! Sign up to get your bonus.", {
        description: "You'll earn 100 XP when you create your account!",
      });
    }
  }, []);

  // Oracle data - 8 oracles sorted alphabetically by category
  const oracles: Oracle[] = [
    {
      id: "crypto",
      name: "Satoshi's Heir",
      emoji: "₿",
      title: "Cryptocurrency Visionary",
      description:
        "Specializes in cryptocurrency market analysis, blockchain technology assessment, and digital asset valuation. Monitors on-chain metrics, protocol developments, regulatory landscape, and institutional adoption trends.",
      gradient: "from-orange-600 via-amber-600 to-yellow-700",
      category: "Cryptocurrency",
      accuracy: "92%",
      likes: "12.5K",
      consultSessions: "45.2K",
      specialty: "Crypto Analysis",
      tags: ["Bitcoin", "Ethereum", "DeFi", "Blockchain"],
      avatar: oracleImg1,
      bgColor: "bg-orange-500/10",
    },
    {
      id: "economics",
      name: "The Macro Maestro",
      emoji: "📊",
      title: "Global Economics Expert",
      description:
        "Provides macroeconomic forecasting through central bank policy analysis, inflation tracking, employment data, and GDP growth indicators. Monitors monetary policy impacts, economic cycles, and global financial system dynamics.",
      gradient: "from-slate-600 via-gray-600 to-zinc-700",
      category: "Economics",
      accuracy: "91%",
      likes: "9.8K",
      consultSessions: "32.7K",
      specialty: "Macro Analysis",
      tags: ["GDP", "Inflation", "Policy", "Indicators"],
      avatar: oracleImg3,
      bgColor: "bg-slate-500/10",
    },
    {
      id: "financial-markets",
      name: "The Market Whisperer",
      emoji: "📈",
      title: "Financial Markets Sage",
      description:
        "Provides comprehensive financial market analysis combining technical indicators, fundamental valuations, macroeconomic trends, and quantitative modeling. Specializes in identifying market inefficiencies and high-probability opportunities.",
      gradient: "from-emerald-600 via-green-600 to-teal-700",
      category: "Financial Markets",
      accuracy: "89%",
      likes: "10.3K",
      consultSessions: "38.1K",
      specialty: "Market Analysis",
      tags: ["Stocks", "Bonds", "Commodities", "Forex"],
      avatar: oracleImg2,
      bgColor: "bg-emerald-500/10",
    },
    {
      id: "fortune",
      name: "Madame Destiny",
      emoji: "🔮",
      title: "Mystic Seer of Fates",
      description:
        "Utilizes psychological profiling, behavioral economics, and pattern recognition to forecast personal and professional outcomes. Analyzes decision-making frameworks and life trajectory indicators through mystical insights.",
      gradient: "from-fuchsia-600 via-purple-600 to-pink-700",
      category: "Fortune & Mysticism",
      accuracy: "87%",
      likes: "13.1K",
      consultSessions: "52.9K",
      specialty: "Behavioral Prediction",
      tags: ["Psychology", "Mysticism", "Patterns", "Destiny"],
      avatar: oracleImg7,
      bgColor: "bg-fuchsia-500/10",
    },
    {
      id: "fundamental-analysis",
      name: "The Value Hunter",
      emoji: "📋",
      title: "Deep Value Specialist",
      description:
        "Deep dive into company financials, business models, competitive advantages, and intrinsic value. Analyzes balance sheets, income statements, cash flows, and key financial ratios to identify undervalued opportunities.",
      gradient: "from-blue-600 via-cyan-600 to-sky-700",
      category: "Fundamental Analysis",
      accuracy: "88%",
      likes: "8.7K",
      consultSessions: "28.4K",
      specialty: "Value Analysis",
      tags: ["Valuation", "Financials", "DCF", "Ratios"],
      avatar: oracleImg4,
      bgColor: "bg-blue-500/10",
    },
    {
      id: "meme-coins",
      name: "The Degen Queen",
      emoji: "🐸",
      title: "Meme Coin Specialist",
      description:
        "Expert in meme coin trends, viral token movements, and community-driven crypto projects. Monitors social sentiment, influencer activity, and degen culture to identify the next 100x moonshot opportunities.",
      gradient: "from-lime-600 via-green-600 to-emerald-700",
      category: "Meme Coins",
      accuracy: "83%",
      likes: "15.7K",
      consultSessions: "63.5K",
      specialty: "Meme Analysis",
      tags: ["Dogecoin", "Shiba", "Pepe", "Community"],
      avatar: oracleImg8,
      bgColor: "bg-lime-500/10",
    },
    {
      id: "politics",
      name: "The Policy Prophet",
      emoji: "🎭",
      title: "Political Strategist",
      description:
        "Specializes in political forecasting through advanced analysis of legislative patterns, voting behavior, and policy trends. Leverages comprehensive datasets including social media sentiment, polling data, and historical election outcomes.",
      gradient: "from-violet-600 via-purple-600 to-indigo-700",
      category: "Politics",
      accuracy: "93%",
      likes: "7.4K",
      consultSessions: "41.8K",
      specialty: "Political Analysis",
      tags: ["Elections", "Policy", "Legislation", "Governance"],
      avatar: oracleImg6,
      bgColor: "bg-violet-500/10",
    },
    {
      id: "technical-analysis",
      name: "Chart Master Zhen",
      emoji: "📉",
      title: "Technical Analyst Extraordinaire",
      description:
        "Masters chart patterns, indicators, and price action analysis. Specializes in trend identification, support/resistance levels, momentum indicators, and algorithmic trading signals for precise entry and exit points.",
      gradient: "from-red-600 via-rose-600 to-pink-700",
      category: "Technical Analysis",
      accuracy: "85%",
      likes: "11.2K",
      consultSessions: "36.9K",
      specialty: "Chart Analysis",
      tags: ["Charts", "Patterns", "Indicators", "Trading"],
      avatar: oracleImg5,
      bgColor: "bg-red-500/10",
    },
  ];

  // Categories based on oracle types - alphabetically sorted
  const categories = [
    "all",
    "Cryptocurrency",
    "Economics",
    "Financial Markets",
    "Fortune & Mysticism",
    "Fundamental Analysis",
    "Meme Coins",
    "Politics",
    "Technical Analysis",
  ];

  // Filter oracles
  const filteredOracles = oracles.filter((oracle) => {
    const matchesSearch =
      oracle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oracle.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oracle.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || oracle.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Scroll functions
  const scroll = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === "left"
          ? categoryScrollRef.current.scrollLeft - scrollAmount
          : categoryScrollRef.current.scrollLeft + scrollAmount;

      categoryScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const generateMockAddress = (walletType: WalletType): string => {
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

  const handleWalletConnect = (walletType: WalletType) => {
    const walletAddress = generateMockAddress(walletType);

    // Check for pending referral code
    const referralCode = sessionStorage.getItem("pendingReferralCode");
    let initialXP = mockUser.xp;

    if (referralCode) {
      // Award 100 XP bonus for joining with referral code
      initialXP += 100;
      toast.success("🎉 Referral bonus applied! +100 XP", {
        description: "Welcome to Dehouse of Oracles!",
      });
      sessionStorage.removeItem("pendingReferralCode");
    }

    const newUser: User = {
      ...mockUser,
      walletAddress,
      walletType,
      xp: initialXP,
      referredBy: referralCode || undefined,
      referralCode: undefined, // Will be generated on first use
      referredFriends: [],
    };
    setUser(newUser);
    setWalletDialogOpen(false);
    toast.success(`Connected with ${walletType}!`);

    // Navigate to pending destination if any
    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSocialConnect = (provider: SocialProvider) => {
    const email = generateMockEmail(provider);

    // Check for pending referral code
    const referralCode = sessionStorage.getItem("pendingReferralCode");
    let initialXP = mockUser.xp;

    if (referralCode) {
      // Award 100 XP bonus for joining with referral code
      initialXP += 100;
      toast.success("🎉 Referral bonus applied! +100 XP", {
        description: "Welcome to Dehouse of Oracles!",
      });
      sessionStorage.removeItem("pendingReferralCode");
    }

    const newUser: User = {
      ...mockUser,
      email,
      socialProvider: provider,
      xp: initialXP,
      referredBy: referralCode || undefined,
      referralCode: undefined, // Will be generated on first use
      referredFriends: [],
    };
    setUser(newUser);
    setWalletDialogOpen(false);
    toast.success(`Connected with ${provider}!`);

    // Navigate to pending destination if any
    if (pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleWalletDisconnect = () => {
    setUser(null);
    setCurrentPage("oracles");
    toast.info("Wallet disconnected");
  };

  // Render conditional pages
  if (currentPage === "shared-prediction" && sharedPredictionId) {
    return (
      <SharedPredictionPage
        predictionId={sharedPredictionId}
        onBack={() => {
          setSharedPredictionId(null);
          setCurrentPage("oracles");
          window.history.pushState({}, "", "/");
        }}
      />
    );
  }

  if (currentPage === "chat" && selectedOracle) {
    return (
      <ChatPage
        oracle={selectedOracle}
        onBack={() => {
          setSelectedOracle(null);
          setCurrentPage("oracles");
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        totalQuestionsAsked={totalQuestionsAsked}
        onQuestionAsked={() => setTotalQuestionsAsked((prev) => prev + 1)}
        user={user}
        onOpenWalletDialog={() => setWalletDialogOpen(true)}
        onNavigate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
        onWalletDisconnect={handleWalletDisconnect}
        shortenAddress={shortenAddress}
        updateUser={updateUser}
      />
    );
  }

  if (currentPage === "dashboard" && user) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onWalletDisconnect={handleWalletDisconnect}
          shortenAddress={shortenAddress}
          onSetPendingNavigation={setPendingNavigation}
          onOpenSettings={() => setCurrentPage("settings")}
        />
        <main className="container mx-auto px-4 py-6">
          <Dashboard
            user={user}
            onBackToOracles={() => setCurrentPage("oracles")}
            onNavigate={(page: string) => {
              setCurrentPage(page);
            }}
          />
        </main>

        {/* Wallet Connect Dialog */}
        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          onConnect={handleWalletConnect}
          onSocialConnect={handleSocialConnect}
          onOpenPrivacy={() => setPrivacyDialogOpen(true)}
          onOpenTerms={() => setTermsDialogOpen(true)}
        />

        <PrivacyPolicy
          open={privacyDialogOpen}
          onOpenChange={setPrivacyDialogOpen}
        />

        <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />

        <Toaster />
      </div>
    );
  }

  if (currentPage === "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onWalletDisconnect={handleWalletDisconnect}
          shortenAddress={shortenAddress}
          onSetPendingNavigation={setPendingNavigation}
          onOpenSettings={() => setCurrentPage("settings")}
        />
        <main className="container mx-auto px-4 py-6">
          <Dashboard
            onNavigate={(page) => setCurrentPage(page)}
            user={user ?? mockUser}
            totalOracles={oracles.length}
          />
        </main>

        {/* Wallet Connect Dialog */}
        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          onConnect={handleWalletConnect}
          onSocialConnect={handleSocialConnect}
          onOpenPrivacy={() => setPrivacyDialogOpen(true)}
          onOpenTerms={() => setTermsDialogOpen(true)}
        />

        <PrivacyPolicy
          open={privacyDialogOpen}
          onOpenChange={setPrivacyDialogOpen}
        />

        <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />

        <Toaster />
      </div>
    );
  }

  if (currentPage === "subscription") {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onWalletDisconnect={handleWalletDisconnect}
          shortenAddress={shortenAddress}
          onSetPendingNavigation={setPendingNavigation}
          onOpenSettings={() => setCurrentPage("settings")}
        />
        <main className="container mx-auto px-4 py-6">
          <SubscriptionPage
            onBack={() => setCurrentPage("oracles")}
            user={user}
            updateUser={updateUser}
          />
        </main>

        {/* Wallet Connect Dialog */}
        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          onConnect={handleWalletConnect}
          onSocialConnect={handleSocialConnect}
          onOpenPrivacy={() => setPrivacyDialogOpen(true)}
          onOpenTerms={() => setTermsDialogOpen(true)}
        />

        <PrivacyPolicy
          open={privacyDialogOpen}
          onOpenChange={setPrivacyDialogOpen}
        />

        <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />

        <Toaster />
      </div>
    );
  }

  if (currentPage === "settings") {
    return (
      <div className="min-h-screen bg-background">
        <SettingsPage onBack={() => setCurrentPage("dashboard")} />

        {/* Wallet Connect Dialog */}
        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          onConnect={handleWalletConnect}
          onSocialConnect={handleSocialConnect}
          onOpenPrivacy={() => setPrivacyDialogOpen(true)}
          onOpenTerms={() => setTermsDialogOpen(true)}
        />

        <PrivacyPolicy
          open={privacyDialogOpen}
          onOpenChange={setPrivacyDialogOpen}
        />

        <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />

        <Toaster />
      </div>
    );
  }

  if (currentPage === "houses") {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onWalletDisconnect={handleWalletDisconnect}
          shortenAddress={shortenAddress}
          onSetPendingNavigation={setPendingNavigation}
          onOpenSettings={() => setCurrentPage("settings")}
        />
        <main className="container mx-auto px-4 py-6">
          <HousesPage
            onNavigateBack={() => setCurrentPage("oracles")}
            onNavigate={(page) => setCurrentPage(page)}
            onJoinHouse={handleJoinHouse}
            onSwitchHouse={handleSwitchHouse}
            onLeaveHouse={handleLeaveHouse}
            userHouse={user?.house}
            houseSwitchesUsed={user?.houseSwitchesUsed}
            user={user}
          />
        </main>

        {/* Wallet Connect Dialog */}
        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          onConnect={handleWalletConnect}
          onSocialConnect={handleSocialConnect}
          onOpenPrivacy={() => setPrivacyDialogOpen(true)}
          onOpenTerms={() => setTermsDialogOpen(true)}
        />

        <PrivacyPolicy
          open={privacyDialogOpen}
          onOpenChange={setPrivacyDialogOpen}
        />

        <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />

        <Toaster />
      </div>
    );
  }

  if (currentPage === "leaderboard") {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onWalletDisconnect={handleWalletDisconnect}
          shortenAddress={shortenAddress}
          onSetPendingNavigation={setPendingNavigation}
          onOpenSettings={() => setCurrentPage("settings")}
        />
        <main className="container mx-auto px-4 py-6">
          <LeaderboardPage user={user} />
        </main>

        {/* Wallet Connect Dialog */}
        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          onConnect={handleWalletConnect}
          onSocialConnect={handleSocialConnect}
          onOpenPrivacy={() => setPrivacyDialogOpen(true)}
          onOpenTerms={() => setTermsDialogOpen(true)}
        />

        <PrivacyPolicy
          open={privacyDialogOpen}
          onOpenChange={setPrivacyDialogOpen}
        />

        <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />

        <Toaster />
      </div>
    );
  }

  if (currentPage === "houseDetail" && selectedHouseId) {
    return (
      <HouseDetailPage
        houseId={selectedHouseId}
        onBack={() => {
          setSelectedHouseId(null);
          setCurrentPage("houses");
        }}
        onJoinHouse={handleJoinHouse}
        onSwitchHouse={handleSwitchHouse}
        onLeaveHouse={handleLeaveHouse}
        user={user ?? mockUser}
        houses={houses}
        houseMembers={houseMembers}
      />
    );
  }

  if (currentPage === "betDetail" && selectedBetId) {
    return (
      <BetDetailPage
        betId={selectedBetId}
        onBack={() => {
          setSelectedBetId(null);
          setCurrentPage("oracles");
        }}
        user={user}
        userCreatedMarkets={userCreatedMarkets}
      />
    );
  }

  if (currentPage === "shared-prediction" && sharedPredictionId) {
    return (
      <SharedPredictionPage
        predictionId={sharedPredictionId}
        onBack={() => {
          setSharedPredictionId(null);
          setCurrentPage("oracles");
          // Clear the URL
          window.history.pushState({}, "", "/");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <UnifiedHeader
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        onOpenWalletDialog={() => setWalletDialogOpen(true)}
        onWalletDisconnect={handleWalletDisconnect}
        shortenAddress={shortenAddress}
        onSetPendingNavigation={setPendingNavigation}
        onOpenSettings={() => setCurrentPage("settings")}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <RotatingBanners onNavigate={(page) => setCurrentPage(page)} />

        {/* Hero Section */}
        <div className="mb-12 mt-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h2 className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to the Future of AI-Powered Predictions
            </h2>
            <p className="text-muted-foreground text-lg">
              Harness the collective intelligence of specialized AI oracles,
              each trained to master specific domains. From cryptocurrency to
              politics, technical analysis to fortune telling—our oracles
              deliver insights that combine cutting-edge AI with deep domain
              expertise.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="mb-2">Specialized AI Agents</h3>
                <p className="text-sm text-muted-foreground">
                  Each oracle is fine-tuned for specific expertise, from market
                  analysis to mystical insights
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="mb-2">Real-Time Predictions</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant, actionable insights powered by the latest AI
                  models and data
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur">
                <div className="text-3xl mb-3">🎮</div>
                <h3 className="mb-2">Gamified Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Level up, join houses, complete quests, and earn rewards as
                  you explore
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meet Your Oracles Section */}
        <div className="mb-8">
          <h2 className="text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Meet Your Oracles
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Choose your guide and unlock the power of specialized AI predictions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search oracles by name, category, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter with Scroll */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-10"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category === "all" ? "All Oracles" : category}
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Oracle Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOracles.map((oracle) => (
            <div key={oracle.id}>
              <OracleCard
                oracle={oracle}
                onClick={() => {
                  setSelectedOracle(oracle);
                  setCurrentPage("chat");
                }}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOracles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="mb-2">No oracles found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 pb-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-3">About</h3>
              <p className="text-sm text-muted-foreground">
                Dehouse of Oracles - AI-powered prediction platform with
                specialized oracle agents.
              </p>
            </div>
            <div>
              <h3 className="mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  Total Consult Sessions:{" "}
                  {platformStats.totalConsultSessions.toLocaleString()}
                </li>
                <li>
                  Total Predictions:{" "}
                  {platformStats.totalPredictions.toLocaleString()}
                </li>
                <li>Platform Accuracy: {platformStats.accuracy}%</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  Active Users: {(platformStats.activeUsers / 1000).toFixed(0)}K
                </li>
                <li>Houses: {platformStats.totalHouses}</li>
                <li>Oracle Categories: 8</li>
              </ul>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    window.open("https://twitter.com/dehouseoracles", "_blank")
                  }
                >
                  <Twitter className="w-4 h-4" />X / Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    window.open("https://discord.gg/dehouseoracles", "_blank")
                  }
                >
                  <MessageCircle className="w-4 h-4" />
                  Discord
                </Button>
              </div>
            </div>
            <div>
              <h3 className="mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setPrivacyDialogOpen(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setTermsDialogOpen(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Use
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
                ⚠️ Important Disclaimer
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Do Your Own Research (DYOR).</strong> The information
                provided on this platform is for entertainment and informational
                purposes only and should not be considered financial,
                investment, or professional advice. Always consult with a
                qualified financial expert or professional advisor before making
                any investment decisions. Our platform aims to provide you with
                information, but you are solely responsible for your own
                financial investing decisions. We deny all liabilities for any
                losses, damages, or consequences arising from the use of this
                platform or reliance on any predictions, analyses, or
                information provided by our AI oracles.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Dialogs */}
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={handleWalletConnect}
        onSocialConnect={handleSocialConnect}
        onOpenPrivacy={() => setPrivacyDialogOpen(true)}
        onOpenTerms={() => setTermsDialogOpen(true)}
      />

      <PrivacyPolicy
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
      />

      <TermsOfUse open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />

      <Toaster />
    </div>
  );
}
