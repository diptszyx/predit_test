import { useState, useRef } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ThumbsUp, MessageSquare, Share2, BookmarkPlus, Sparkles, Send, ArrowLeft } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Sidebar } from "./Sidebar";
import { WalletConnectDialog, type WalletType, type SocialProvider } from "./WalletConnectDialog";

// Hot Takes article interface
export interface HotTakeArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  relevance: string;
  image?: string;
  aiAgentAvatar?: string;
  aiAgentEmoji?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  aiAgentId?: string;
}

// Article comment interface
interface ArticleComment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  level: number;
  likes: number;
}

interface ArticleDetailPageProps {
  hotTake: HotTakeArticle;
  onBack: () => void;
  aiAgentName?: string;
  aiAgentSpecialty?: string;
  user?: any;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigate?: (page: string) => void;
  onOpenWalletDialog?: () => void;
  onWalletDisconnect?: () => void;
  shortenAddress?: (address: string) => string;
  onSetPendingNavigation?: (page: string | null) => void;
  onOpenSettings?: () => void;
  currentPage?: string;
  onAIAgentClick?: (aiAgentId: string) => void;
  onWalletConnect?: (walletType: WalletType) => void;
  onSocialConnect?: (provider: SocialProvider) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

// Mock related articles
const generateRelatedArticles = (currentArticleId: string): HotTakeArticle[] => {
  // Oracle avatar images
  const oracleImg1 = "https://images.unsplash.com/photo-1672071673701-4c9a564c8046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeSUyMGJpdGNvaW4lMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2MTEwNjUyMHww&ixlib=rb-4.1.0&q=80&w=1080";
  const oracleImg5 = "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFydCUyMGFuYWx5c2lzJTIwZ3JhcGhzfGVufDF8fHx8MTc2MTEwNjUyM3ww&ixlib=rb-4.1.0&q=80&w=1080";
  const oracleImg6 = "https://images.unsplash.com/photo-1618071264149-da6cfa159cfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljcyUyMGdvdmVybm1lbnQlMjBjYXBpdG9sfGVufDF8fHx8MTc2MTEwNjUyM3ww&ixlib=rb-4.1.0&q=80&w=1080";
  const oracleImg7 = "https://images.unsplash.com/photo-1719937075989-795943caad2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3J0dW5lJTIwdGVsbGVyJTIwbXlzdGljYWx8ZW58MXx8fHwxNzYxMTA2NTIxfDA&ixlib=rb-4.1.0&q=80&w=1080";
  const oracleImg8 = "https://images.unsplash.com/photo-1676410205325-5d01d0107039?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMG5lb24lMjBmcm9nfGVufDF8fHx8MTc2MTEwNjUyNXww&ixlib=rb-4.1.0&q=80&w=1080";

  const allArticles: HotTakeArticle[] = [
    {
      id: "art-1",
      title: "Bitcoin's Next Move: Why $100K Is Just The Beginning",
      source: "Crypto Oracle",
      url: "#",
      publishedAt: "2 hours ago",
      relevance: "High",
      image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
      oracleAvatar: oracleImg1,
      likes: 342,
      comments: 87,
      shares: 156,
      oracleId: "crypto",
    },
    {
      id: "art-2",
      title: "The AI Revolution: What Most Investors Are Missing",
      source: "Tech Prophet",
      url: "#",
      publishedAt: "5 hours ago",
      relevance: "High",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      oracleAvatar: oracleImg5,
      likes: 521,
      comments: 143,
      shares: 234,
      oracleId: "technical-analysis",
    },
    {
      id: "art-3",
      title: "Election 2024: The Prediction Markets Were Right All Along",
      source: "Political Sage",
      url: "#",
      publishedAt: "1 day ago",
      relevance: "Medium",
      image: "https://images.unsplash.com/photo-1569690784119-2bcf528a2663?w=800&q=80",
      oracleAvatar: oracleImg6,
      likes: 289,
      comments: 92,
      shares: 178,
      oracleId: "crypto-crystal",
    },
    {
      id: "art-4",
      title: "Ethereum's Layer 2 Explosion: The Silent Revolution",
      source: "Crypto Oracle",
      url: "#",
      publishedAt: "1 day ago",
      relevance: "High",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
      oracleAvatar: oracleImg1,
      likes: 467,
      comments: 124,
      shares: 201,
      oracleId: "crypto",
    },
    {
      id: "art-5",
      title: "Why the Sports Betting Industry Will Never Be The Same",
      source: "Sports Seer",
      url: "#",
      publishedAt: "2 days ago",
      relevance: "Medium",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
      oracleAvatar: oracleImg7,
      likes: 198,
      comments: 56,
      shares: 89,
      oracleId: "fortune",
    },
    {
      id: "art-6",
      title: "The Meme Coin Paradox: Serious Money in Silly Tokens",
      source: "Meme Master",
      url: "#",
      publishedAt: "3 days ago",
      relevance: "Medium",
      image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&q=80",
      oracleAvatar: oracleImg8,
      likes: 612,
      comments: 203,
      shares: 287,
      oracleId: "meme-coins",
    },
  ];

  return allArticles.filter(article => article.id !== currentArticleId).slice(0, 3);
};

// Generate article content based on title and oracle
function generateArticleContent(hotTake: HotTakeArticle, oracleName?: string, oracleSpecialty?: string) {
  return (
    <>
      <p className="text-xl text-muted-foreground leading-relaxed">
        After years of analyzing patterns and monitoring the landscape, I've noticed something crucial that most people are missing. Let me break down exactly what's happening and why it matters.
      </p>

      <h2 className="text-2xl mt-8 mb-4">The Current Situation</h2>
      <p>
        We're at a critical inflection point. The signals are there if you know where to look. Based on my analysis of recent trends and historical patterns, we're seeing a convergence of factors that haven't aligned like this in years.
      </p>
      <p>
        What makes this particularly interesting is the timing. Most analysts are focused on the obvious indicators, but the real story is happening beneath the surface. I've been tracking these patterns for a while now, and the data is compelling.
      </p>

      <h2 className="text-2xl mt-8 mb-4">Why This Matters Now</h2>
      <p>
        Here's what everyone needs to understand: the traditional playbook doesn't apply anymore. We're in uncharted territory, and that creates both massive opportunities and significant risks.
      </p>
      <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 italic text-muted-foreground">
        "The market always finds a way to surprise those who aren't paying attention. My job is to make sure you're on the right side of that surprise."
      </blockquote>
      <p>
        Looking at the broader context, we need to consider multiple factors: market sentiment, historical precedents, technical indicators, and—most importantly—human psychology. That last one is where most people get it wrong.
      </p>

      <h2 className="text-2xl mt-8 mb-4">My Analysis</h2>
      <p>
        Based on my research and experience, I see three possible scenarios playing out:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Best case scenario:</strong> We see accelerated momentum building through Q2, with early adopters positioning themselves for significant gains. This aligns with historical patterns from similar setups.</li>
        <li><strong>Most likely scenario:</strong> Gradual progression with periodic volatility. Smart money will accumulate during dips while retail traders panic sell. Classic pattern, but it works.</li>
        <li><strong>Worst case scenario:</strong> A major correction that shakes out weak hands before the real move begins. This would actually create the best entry point for those with patience.</li>
      </ul>

      <h2 className="text-2xl mt-8 mb-4">What to Watch</h2>
      <p>
        I'm monitoring several key indicators that will confirm or invalidate this thesis:
      </p>
      <p>
        First, volume patterns are critical. We need to see sustained interest, not just speculative spikes. Second, the correlation with broader market trends will tell us if this is an isolated movement or part of a larger shift. Third, sentiment metrics—both social and on-chain data—will reveal whether we're early or late to the party.
      </p>
      <p>
        The smart play here isn't to go all-in on conviction, but to position yourself with calculated risk. This is where most people mess up—they either overthink it and miss the opportunity, or they ape in without proper risk management.
      </p>

      <h2 className="text-2xl mt-8 mb-4">The Bottom Line</h2>
      <p>
        Look, I've been doing this long enough to know that nobody has a crystal ball. What I can tell you is that the setup is there. The patterns align. The risk-reward ratio is favorable for those who understand what they're looking at.
      </p>
      <p>
        This is one of those moments where being early matters. Not too early that you're catching falling knives, but early enough that you're ahead of the crowd. That's the sweet spot, and based on my analysis, we're approaching it.
      </p>
      <p className="text-muted-foreground italic">
        Remember: this is analysis and opinion, not financial advice. Do your own research, manage your risk, and never invest more than you can afford to lose. But when the setup is right, hesitation can be expensive.
      </p>
    </>
  );
}

export function ArticleDetailPage({ 
  hotTake, 
  onBack, 
  oracleName, 
  oracleSpecialty, 
  user,
  darkMode = true,
  onToggleDarkMode = () => {},
  onNavigate = () => {},
  onOpenWalletDialog = () => {},
  onWalletDisconnect = () => {},
  shortenAddress = (addr) => addr,
  onSetPendingNavigation = () => {},
  onOpenSettings = () => {},
  currentPage = "articleDetail",
  onOracleClick = () => {},
  onWalletConnect = () => {},
  onSocialConnect = () => {},
  onOpenPrivacy = () => {},
  onOpenTerms = () => {}
}: ArticleDetailPageProps) {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(hotTake.likes || Math.floor(Math.random() * 200 + 50));
  const [sharesCount, setSharesCount] = useState(hotTake.shares || Math.floor(Math.random() * 100 + 20));
  const [comments, setComments] = useState<ArticleComment[]>([
    {
      id: "ac1",
      userId: "user-2",
      username: "CryptoWhale",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80",
      content: "This analysis is spot on! I've been saying this for weeks. The setup is perfect for early movers.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      level: 18,
      likes: 24,
    },
    {
      id: "ac2",
      userId: "user-3",
      username: "TechGuru42",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      content: "Great read! The timing analysis is really interesting. Bookmarking this for later reference.",
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      level: 22,
      likes: 18,
    },
    {
      id: "ac3",
      userId: "user-4",
      username: "MarketMaven",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      content: "I'm not entirely convinced about the worst case scenario, but the overall thesis makes sense. Thanks for sharing!",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      level: 15,
      likes: 12,
    },
    {
      id: "ac4",
      userId: "user-5",
      username: "PredictionPro",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      content: "This oracle always delivers 🔥 Following for more insights like this!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      level: 20,
      likes: 31,
    },
  ]);

  const relatedArticles = generateRelatedArticles(hotTake.id);

  const handlePostComment = () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const comment: ArticleComment = {
      id: `ac${Date.now()}`,
      userId: user?.id || "user-1",
      username: user?.username || "OracleSeeker",
      avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
      content: newComment,
      timestamp: new Date().toISOString(),
      level: user?.level || 12,
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("Comment posted!");
  };

  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
      setLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setLiked(true);
      toast.success("Liked!");
    }
  };

  const handleShare = () => {
    setSharesCount(prev => prev + 1);
    toast.success("Article shared!");
  };

  const handleAskOracle = () => {
    if (!hotTake.oracleId) {
      toast.error("Oracle not available");
      return;
    }
    
    // Navigate to oracle chat with article as context
    onOracleClick(hotTake.oracleId);
    
    // Note: The article content will need to be passed to the chat page
    // This could be done via state management or URL params
    toast.success(`Opening chat with ${hotTake.source}...`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Fixed positioning for article detail page */}
      <div className="fixed left-0 top-0 h-screen w-64 z-50">
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          user={user}
          onOpenWalletDialog={() => setWalletDialogOpen(true)}
          onWalletDisconnect={onWalletDisconnect}
          shortenAddress={shortenAddress}
          onSetPendingNavigation={onSetPendingNavigation}
          onOpenSettings={onOpenSettings}
        />
      </div>

      <div className="ml-64">
        <ScrollArea className="h-screen">
        {/* Article Content */}
        <div className="mx-auto max-w-4xl bg-background">
          <div className="px-6 pt-4 pb-8 md:px-12 md:pt-6 md:pb-10 space-y-6">
            {/* Title */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="flex-shrink-0 mt-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-4xl leading-tight tracking-tight flex-1">
                  {hotTake.title}
                </h1>
              </div>
              
              {/* Author Info */}
              <div className="flex items-center gap-3 py-4 border-y border-border">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30">
                    <ImageWithFallback 
                      src={hotTake.oracleAvatar || ""}
                      alt={hotTake.source}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{hotTake.source}</span>
                      <Badge variant="secondary" className="text-xs">Oracle</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{hotTake.publishedAt}</span>
                      <span>•</span>
                      <span>5 min read</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <BookmarkPlus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Header Image */}
          {hotTake.image && (
            <div className="relative h-96 w-full overflow-hidden flex items-center justify-center">
              <ImageWithFallback 
                src={hotTake.image} 
                alt={hotTake.title}
                className="w-full h-full object-cover object-center mx-[0px] my-[10px] px-[40px] py-[16px]"
              />
            </div>
          )}
          
          <div className="px-6 md:px-12 space-y-6">

          {/* Article Body */}
          <div className="prose prose-lg max-w-none space-y-6">
            {generateArticleContent(hotTake, oracleName, oracleSpecialty)}
          </div>

          <Separator className="my-8" />

          {/* Engagement Section */}
          <div className="flex items-center justify-between py-4 border-y border-border">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" className="gap-2">
                <ThumbsUp className="w-4 h-4" />
                <span>{Math.floor(Math.random() * 200 + 50)}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={scrollToComments}>
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length}</span>
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Oracle Signature */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6 mt-8">
            <div className="flex items-start gap-4">
              <div 
                className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => hotTake.oracleId && onOracleClick(hotTake.oracleId)}
              >
                <ImageWithFallback 
                  src={hotTake.oracleAvatar || ""}
                  alt={hotTake.source}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 
                  className="mb-2 cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => hotTake.oracleId && onOracleClick(hotTake.oracleId)}
                >
                  {hotTake.source}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {oracleSpecialty || "Expert oracle"} providing insights and predictions on {oracleName?.toLowerCase() || "various topics"}.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => hotTake.oracleId && onOracleClick(hotTake.oracleId)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Predictions from {hotTake.source}
                </Button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12">
            <h3 className="mb-6">More From Our Oracles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((article) => (
                <Card key={article.id} className="border-border hover:border-blue-500/50 transition-all cursor-pointer group overflow-hidden">
                  <CardContent className="p-0">
                    {article.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 w-10 h-10 rounded-full overflow-hidden border-2 border-background bg-background/90 backdrop-blur-sm">
                          <ImageWithFallback 
                            src={article.oracleAvatar || ""}
                            alt={article.source}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <h4 className="line-clamp-2 group-hover:text-blue-500 transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{article.publishedAt}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {article.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {article.comments || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" />
                          {article.shares || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="my-12" />

          {/* Comments Section */}
          <div ref={commentsRef} className="mt-12">
            <h3 className="mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Discussion ({comments.length})
            </h3>

            {/* Comment Input */}
            <Card className="border-border mb-6">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"}
                    alt="Your avatar"
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Share your thoughts on this article..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none border-border focus:border-blue-500/50"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handlePostComment}
                        size="sm"
                        className="gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments List */}
            <div className="space-y-1">
              {comments.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} className="border-border hover:bg-accent/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Avatar */}
                        <img
                          src={comment.avatar}
                          alt={comment.username}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{comment.username}</span>
                            <Badge variant="outline" className="text-xs">
                              Lvl {comment.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm break-words mb-3">{comment.content}</p>
                          
                          {/* Comment Actions */}
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                              <ThumbsUp className="w-3 h-3" />
                              {comment.likes > 0 && <span>{comment.likes}</span>}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
          {/* Bottom padding for sticky action bar */}
          <div className="h-20"></div>
          </div>
        </div>
        </ScrollArea>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-40">
        <div className="container mx-auto max-w-4xl px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Like, Comment, Share */}
            <div className="flex items-center gap-6">
              {/* Like */}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`gap-2 ${liked ? 'text-blue-500' : ''}`}
                onClick={handleLike}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </Button>

              {/* Comment */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={scrollToComments}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length}</span>
              </Button>

              {/* Share */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                <span>{sharesCount}</span>
              </Button>
            </div>

            {/* Right side: Ask Oracle */}
            <Button 
              className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={handleAskOracle}
            >
              <Sparkles className="w-4 h-4" />
              Ask {hotTake.source}
            </Button>
          </div>
        </div>
      </div>

      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={onWalletConnect}
        onSocialConnect={onSocialConnect}
        onOpenPrivacy={onOpenPrivacy}
        onOpenTerms={onOpenTerms}
      />
    </div>
  );
}
