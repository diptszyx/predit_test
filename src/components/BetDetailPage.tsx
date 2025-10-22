import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, DollarSign, Users, Info, ExternalLink, Share2, Bookmark, BarChart3, Send, MessageSquare } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { oracleBets } from "./PredictionBetCard";

interface User {
  walletAddress?: string;
  username?: string;
}

interface BetDetailPageProps {
  betId: string;
  onBack: () => void;
  user?: User | null;
  userCreatedMarkets?: any[];
}

interface MarketData {
  id: string;
  title: string;
  description: string;
  oracleName: string;
  oracleAvatar: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  liquidity: string;
  deadline: string;
  isOfficial: boolean;
  image: string;
  traders: number;
  created: string;
}

interface Holder {
  address: string;
  side: "yes" | "no";
  amount: number;
  shares: number;
  avgPrice: number;
  timestamp: string;
}

interface Comment {
  id: string;
  address: string;
  message: string;
  timestamp: string;
  side: "yes" | "no";
}

export function BetDetailPage({ betId, onBack, user, userCreatedMarkets = [] }: BetDetailPageProps) {
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [betAmount, setBetAmount] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [activityTab, setActivityTab] = useState("recent");
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [userHoldings, setUserHoldings] = useState<{ yes: number; no: number }>({ yes: 0, no: 0 });

  // Oracle metadata for displaying oracle info
  const oracleMetadata: Record<string, { name: string; avatar: string; category: string }> = {
    politics: {
      name: "Senator Shenanigans",
      avatar: "https://images.unsplash.com/photo-1688198911740-77dde4d0c5d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kc29tZSUyMG1hbiUyMG1vZGVsJTIwc3VpdHxlbnwxfHx8fDE3NjA2MTc4MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Politics",
    },
    entertainment: {
      name: "Madame Memeory",
      avatar: "https://images.unsplash.com/photo-1740487176270-c53ad0c07921?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwY2VsZWJyaXR5JTIwd29tYW4lMjBnbGFtb3VyfGVufDF8fHx8MTc2MDYxNjUxOXww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Entertainment",
    },
    fortune: {
      name: "Crystal Ball Carl",
      avatar: "https://images.unsplash.com/photo-1731088347395-da3d760d56a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kc29tZSUyMGFzaWFuJTIwbWFuJTIwbXVzY3VsYXJ8ZW58MXx8fHwxNzYwNjE2NzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Mystical",
    },
    crypto: {
      name: "Crypto Cassandra",
      avatar: "https://images.unsplash.com/photo-1608130511321-adac1f1ad876?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3JnZW91cyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYwNjE3ODI1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Crypto",
    },
    stocks: {
      name: "Bull Market Betty",
      avatar: "https://images.unsplash.com/photo-1679917104569-1301a9879d42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjB3b21hbiUyMG1vZGVsJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjA2MTc4MjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Finance",
    },
    tech: {
      name: "Silicon Sage",
      avatar: "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdHRyYWN0aXZlJTIwbWFuJTIwYnVzaW5lc3MlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNjE3ODI1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Tech",
    },
  };

  const categoryImages: Record<string, string> = {
    Politics: "https://images.unsplash.com/photo-1618071264149-da6cfa159cfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljcyUyMGdvdmVybm1lbnQlMjBjYXBpdG9sfGVufDF8fHx8MTc2MDYxNjk4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    Entertainment: "https://images.unsplash.com/photo-1584634407036-a403356514cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xseXdvb2QlMjBjZWxlYnJpdHklMjByZWQlMjBjYXJwZXR8ZW58MXx8fHwxNzYwNjE2OTg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    Mystical: "https://images.unsplash.com/photo-1652689994461-d84675640433?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlzdGFsJTIwYmFsbCUyMG15c3RpY2FsfGVufDF8fHx8MTc2MDUzNjc3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    Crypto: "https://images.unsplash.com/photo-1633534415766-165181ffdbb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeSUyMGJpdGNvaW4lMjB0cmFkaW5nfGVufDF8fHx8MTc2MDYxNTg2NHww&ixlib=rb-4.1.0&q=80&w=1080",
    Finance: "https://images.unsplash.com/photo-1723158597314-4760daf1aaae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMHdhbGwlMjBzdHJlZXR8ZW58MXx8fHwxNzYwNjE2OTkwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    Tech: "https://images.unsplash.com/photo-1675557570482-df9926f61d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwYXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZXxlbnwxfHx8fDE3NjA1MzMzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  };

  // Find the market data by betId
  const findMarketData = (): MarketData => {
    // First check user-created markets
    const userMarket = userCreatedMarkets.find(m => m.id === betId);
    if (userMarket) {
      const oracle = oracleMetadata[userMarket.oracleId];
      const price = parseFloat(userMarket.currentPrice.replace('%', ''));
      return {
        id: userMarket.id,
        title: userMarket.title,
        description: userMarket.description || "This market will resolve based on the outcome of the prediction.",
        oracleName: oracle?.name || "Unknown Oracle",
        oracleAvatar: oracle?.avatar || "",
        category: userMarket.category || oracle?.category || "Other",
        yesPrice: price,
        noPrice: 100 - price,
        volume: userMarket.volume,
        liquidity: "$50K", // Default liquidity for user markets
        deadline: userMarket.date,
        isOfficial: userMarket.isOfficial,
        image: categoryImages[userMarket.category] || categoryImages[oracle?.category || "Crypto"],
        traders: 0, // User markets start with 0 traders
        created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    }

    // Then check default oracle bets
    for (const [oracleId, bets] of Object.entries(oracleBets)) {
      const bet = bets.find(b => b.id === betId);
      if (bet) {
        const oracle = oracleMetadata[oracleId];
        const price = parseFloat(bet.currentPrice.replace('%', ''));
        return {
          id: bet.id,
          title: bet.title,
          description: "This market will resolve to Yes if the conditions are met by the deadline. Otherwise, this market will resolve to No.",
          oracleName: oracle?.name || "Unknown Oracle",
          oracleAvatar: oracle?.avatar || "",
          category: oracle?.category || "Other",
          yesPrice: price,
          noPrice: 100 - price,
          volume: bet.volume,
          liquidity: "$125K",
          deadline: bet.date,
          isOfficial: bet.isOfficial,
          image: categoryImages[oracle?.category || "Crypto"],
          traders: Math.floor(Math.random() * 2000) + 500, // Random traders for demo
          created: "Oct 10, 2025",
        };
      }
    }

    // Fallback to default market data if not found
    return {
      id: betId,
      title: "Market Not Found",
      description: "This market could not be found.",
      oracleName: "Unknown Oracle",
      oracleAvatar: "",
      category: "Other",
      yesPrice: 50,
      noPrice: 50,
      volume: "$0",
      liquidity: "$0",
      deadline: "Unknown",
      isOfficial: false,
      image: categoryImages.Crypto,
      traders: 0,
      created: "Unknown",
    };
  };

  const market = findMarketData();

  // Mock holders data
  const holders: Holder[] = [
    { address: "0x7a3f8b2c9d1e4a5f6b8c9d0e1f2a3b4c5d6e7f8a", side: "yes", amount: 5000, shares: 8064.52, avgPrice: 62, timestamp: "2 hours ago" },
    { address: "0x9b4c8e7f2d1a3b5c6d8e9f0a1b2c3d4e5f6a7b8c", side: "yes", amount: 2500, shares: 4032.26, avgPrice: 62, timestamp: "5 hours ago" },
    { address: "0x2f1a9b7c3d4e5f6a8b9c0d1e2f3a4b5c6d7e8f9a", side: "yes", amount: 10000, shares: 16129.03, avgPrice: 62, timestamp: "1 day ago" },
    { address: "0x5c8d4f2a1b3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a", side: "no", amount: 7500, shares: 19736.84, avgPrice: 38, timestamp: "3 hours ago" },
    { address: "0x1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f", side: "no", amount: 3000, shares: 7894.74, avgPrice: 38, timestamp: "6 hours ago" },
    { address: "0x8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a", side: "yes", amount: 1500, shares: 2419.35, avgPrice: 62, timestamp: "12 hours ago" },
    { address: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e", side: "no", amount: 5000, shares: 13157.89, avgPrice: 38, timestamp: "18 hours ago" },
    { address: "0x6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c", side: "yes", amount: 800, shares: 1290.32, avgPrice: 62, timestamp: "1 day ago" },
  ];

  // Generate mock price history and initialize data
  useEffect(() => {
    const history = [];
    let price = 50;
    for (let i = 0; i < 30; i++) {
      price += (Math.random() - 0.5) * 8;
      price = Math.max(20, Math.min(80, price));
      history.push(price);
    }
    setPriceHistory(history);

    // Initialize comments
    const initialComments: Comment[] = [
      { id: "1", address: "0x7a3f8b2c9d1e4a5f6b8c9d0e1f2a3b4c5d6e7f8a", message: "This is looking bullish! The senate has been very supportive lately.", timestamp: "1 hour ago", side: "yes" },
      { id: "2", address: "0x5c8d4f2a1b3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a", message: "I think we're overestimating the chances. Too much political gridlock right now.", timestamp: "3 hours ago", side: "no" },
      { id: "3", address: "0x2f1a9b7c3d4e5f6a8b9c0d1e2f3a4b5c6d7e8f9a", message: "Just loaded up more YES shares. WAGMI 🚀", timestamp: "5 hours ago", side: "yes" },
    ];
    setComments(initialComments);

    // Simulate user holdings (for demo purposes - if user has wallet, give them some holdings)
    if (user?.walletAddress) {
      setUserHoldings({ yes: 2500, no: 0 });
    }
  }, [user?.walletAddress]);

  const handlePlaceBet = () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const side = selectedSide === "yes" ? "Yes" : "No";
    const price = selectedSide === "yes" ? market.yesPrice : market.noPrice;
    
    // Update user holdings
    const amount = parseFloat(betAmount);
    setUserHoldings(prev => ({
      ...prev,
      [selectedSide]: prev[selectedSide] + amount
    }));
    
    toast.success(`Placed ${betAmount} USDC on ${side} at ${price}¢`);
    setBetAmount("");
  };

  const handlePostComment = () => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    // Check if user is a holder
    const isHolder = userHoldings.yes > 0 || userHoldings.no > 0;
    if (!isHolder) {
      toast.error("Only bet holders can post comments");
      return;
    }

    // Determine user's side based on their holdings
    const userSide = userHoldings.yes >= userHoldings.no ? "yes" : "no";

    const newComment: Comment = {
      id: Date.now().toString(),
      address: user?.walletAddress || "0x0000000000000000000000000000000000000000",
      message: commentText,
      timestamp: "Just now",
      side: userSide as "yes" | "no",
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText("");
    toast.success("Comment posted!");
  };

  const potentialReturn = betAmount && parseFloat(betAmount) > 0
    ? (parseFloat(betAmount) * (100 / (selectedSide === "yes" ? market.yesPrice : market.noPrice))).toFixed(2)
    : "0";

  const shares = betAmount && parseFloat(betAmount) > 0
    ? (parseFloat(betAmount) / (selectedSide === "yes" ? market.yesPrice : market.noPrice) * 100).toFixed(2)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{market.category}</Badge>
                {market.isOfficial && (
                  <Badge variant="outline" className="bg-blue-600/20 border-blue-600/30 text-blue-400">
                    <span className="mr-1">✓</span>Official
                  </Badge>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <img
                    src={market.oracleAvatar}
                    alt={market.oracleName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-muted-foreground">{market.oracleName}</span>
                </div>
              </div>
              <h1 className="text-3xl mb-4">{market.title}</h1>
              
              {/* Market Image */}
              <div className="w-full h-64 rounded-lg overflow-hidden mb-4">
                <ImageWithFallback
                  src={market.image}
                  alt={market.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Current Prices - Large Display */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="border-2 border-emerald-600/30 bg-emerald-900/10">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Yes</p>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl text-emerald-400">{market.yesPrice}¢</span>
                    </div>
                    <div className="h-2 bg-emerald-950/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${market.yesPrice}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-red-600/30 bg-red-900/10">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">No</p>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl text-red-400">{market.noPrice}¢</span>
                    </div>
                    <div className="h-2 bg-red-950/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${market.noPrice}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Price Chart */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-1">
                  {priceHistory.map((price, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${price}%` }}
                      title={`${price.toFixed(1)}%`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </CardContent>
            </Card>

            {/* Market Info */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Market Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Volume</p>
                    <p className="text-lg">{market.volume}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Liquidity</p>
                    <p className="text-lg">{market.liquidity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Traders</p>
                    <p className="text-lg">{market.traders.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Created</p>
                    <p className="text-lg">{market.created}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm mb-2">Resolution Details</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {market.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Closes: {market.deadline}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity, Chitchat, and Holders Tabs */}
            <Card className="border-border">
              <CardHeader>
                <Tabs value={activityTab} onValueChange={setActivityTab}>
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                    <TabsTrigger value="chitchat">Chitchat</TabsTrigger>
                    <TabsTrigger value="holders">Holders</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {/* Recent Activity Tab */}
                {activityTab === "recent" && (
                  <div className="space-y-3">
                    {[
                      { user: "0x7a3...f2d1", action: "bought", side: "Yes", amount: "500", price: "62¢", time: "2 min ago" },
                      { user: "0x9b4...c8e3", action: "sold", side: "No", amount: "250", price: "38¢", time: "5 min ago" },
                      { user: "0x2f1...a9b7", action: "bought", side: "Yes", amount: "1000", price: "61¢", time: "12 min ago" },
                      { user: "0x5c8...d4f2", action: "bought", side: "No", amount: "750", price: "39¢", time: "18 min ago" },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xs">
                            {activity.user.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="text-muted-foreground">{activity.user}</span>
                              {" "}{activity.action}{" "}
                              <span className={activity.side === "Yes" ? "text-emerald-400" : "text-red-400"}>
                                {activity.side}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">${activity.amount}</p>
                          <p className="text-xs text-muted-foreground">@ {activity.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chitchat Tab */}
                {activityTab === "chitchat" && (
                  <div className="space-y-4">
                    {/* Comment Input */}
                    {user?.walletAddress && (userHoldings.yes > 0 || userHoldings.no > 0) ? (
                      <div className="space-y-2 pb-4 border-b border-border">
                        <Textarea
                          placeholder="Share your thoughts... (Only holders can comment)"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button
                          onClick={handlePostComment}
                          disabled={!commentText.trim()}
                          className="w-full"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Post Comment
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-accent rounded-lg border border-border mb-4">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm mb-1">Only holders can comment</p>
                            <p className="text-xs text-muted-foreground">
                              {user?.walletAddress 
                                ? "Place a bet to join the conversation!"
                                : "Connect your wallet and place a bet to join the conversation!"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="space-y-2 pb-4 border-b border-border last:border-0">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs ${
                                comment.side === "yes" 
                                  ? "bg-gradient-to-br from-emerald-600 to-emerald-700" 
                                  : "bg-gradient-to-br from-red-600 to-red-700"
                              }`}>
                                {comment.address.slice(0, 4)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm text-muted-foreground font-mono">
                                    {comment.address.slice(0, 6)}...{comment.address.slice(-4)}
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      comment.side === "yes"
                                        ? "border-emerald-600/30 bg-emerald-900/20 text-emerald-400"
                                        : "border-red-600/30 bg-red-900/20 text-red-400"
                                    }`}
                                  >
                                    {comment.side.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm leading-relaxed">{comment.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Holders Tab */}
                {activityTab === "holders" && (
                  <div className="space-y-3">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-accent rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">YES Holders</p>
                        <p className="text-lg text-emerald-400">
                          {holders.filter(h => h.side === "yes").length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">NO Holders</p>
                        <p className="text-lg text-red-400">
                          {holders.filter(h => h.side === "no").length}
                        </p>
                      </div>
                    </div>

                    {/* Holders List */}
                    <div className="space-y-2">
                      {holders.map((holder, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                              holder.side === "yes" 
                                ? "bg-gradient-to-br from-emerald-600 to-emerald-700" 
                                : "bg-gradient-to-br from-red-600 to-red-700"
                            }`}>
                              {holder.address.slice(0, 4)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-mono truncate">
                                  {holder.address.slice(0, 8)}...{holder.address.slice(-6)}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs flex-shrink-0 ${
                                    holder.side === "yes"
                                      ? "border-emerald-600/30 bg-emerald-900/20 text-emerald-400"
                                      : "border-red-600/30 bg-red-900/20 text-red-400"
                                  }`}
                                >
                                  {holder.side.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{holder.timestamp}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p className="text-sm mb-1">${holder.amount.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {holder.shares.toLocaleString(undefined, { maximumFractionDigits: 2 })} shares
                            </p>
                            <p className="text-xs text-muted-foreground">@ {holder.avgPrice}¢</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trading Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-border">
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="buy">Buy</TabsTrigger>
                      <TabsTrigger value="sell">Sell</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Outcome Selection */}
                  <div className="space-y-2">
                    <label className="text-sm">Outcome</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedSide === "yes" ? "default" : "outline"}
                        onClick={() => setSelectedSide("yes")}
                        className={
                          selectedSide === "yes"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "border-emerald-600/30 hover:bg-emerald-900/20"
                        }
                      >
                        Yes {market.yesPrice}¢
                      </Button>
                      <Button
                        variant={selectedSide === "no" ? "default" : "outline"}
                        onClick={() => setSelectedSide("no")}
                        className={
                          selectedSide === "no"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "border-red-600/30 hover:bg-red-900/20"
                        }
                      >
                        No {market.noPrice}¢
                      </Button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-sm">Amount (USDC)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="text-lg h-12"
                    />
                    <div className="flex gap-2">
                      {["10", "50", "100", "500"].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(amount)}
                          className="flex-1 text-xs"
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {betAmount && parseFloat(betAmount) > 0 && (
                    <div className="space-y-2 p-4 bg-accent rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avg price</span>
                        <span>{selectedSide === "yes" ? market.yesPrice : market.noPrice}¢</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Shares</span>
                        <span>{shares}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Potential return</span>
                        <span className="text-green-500">${potentialReturn}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                        <span className="text-muted-foreground">Max payout</span>
                        <span>${(parseFloat(shares)).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={handlePlaceBet}
                    disabled={!betAmount || parseFloat(betAmount) <= 0}
                    className={`w-full h-12 ${
                      selectedSide === "yes"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white`}
                  >
                    {activeTab === "buy" ? "Place Order" : "Sell Shares"}
                  </Button>

                  {/* Disclaimer */}
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="flex gap-2">
                      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Prices are in cents. You'll receive shares that pay $1.00 if your outcome is correct.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Stats */}
              <Card className="border-border mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">24h volume</span>
                    <span>{market.volume}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">24h traders</span>
                    <span>342</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total volume</span>
                    <span>{market.volume}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total traders</span>
                    <span>{market.traders.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
