import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  BookmarkPlus,
  Sparkles,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sidebar } from './Sidebar';
import {
  WalletConnectDialog,
  type WalletType,
  type SocialProvider,
} from './WalletConnectDialog';
import { News, newsService } from '../services/news.service';
import { timeAgo } from '../lib/date';
import { Skeleton } from './ui/skeleton';
import { OracleEntity } from '../services/oracles.service';
import { removeBrokenImages } from '../lib/htmlUtil';

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
  hotTake: News;
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
  onSelectRelated: Dispatch<SetStateAction<News | null>>;
  previousPage: string | null;
}

export function ArticleDetailPage({
  hotTake,
  onBack,
  user,
  darkMode = true,
  onToggleDarkMode = () => { },
  onNavigate = () => { },
  onOpenWalletDialog = () => { },
  onWalletDisconnect = () => { },
  shortenAddress = (addr) => addr,
  onSetPendingNavigation = () => { },
  onOpenSettings = () => { },
  currentPage = 'articleDetail',
  previousPage,
  onWalletConnect = () => { },
  onSocialConnect = () => { },
  onOpenPrivacy = () => { },
  onOpenTerms = () => { },
  onSelectRelated,
  onAIAgentClick,
}: ArticleDetailPageProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<News[]>([]);
  const [isLoadingRelatedArticles, setIsLoadingRelatedArticles] =
    useState<boolean>(false);
  const [likesCount, setLikesCount] = useState(
    hotTake.likes || Math.floor(Math.random() * 200 + 50)
  );
  const [sharesCount, setSharesCount] = useState(
    hotTake.shares || Math.floor(Math.random() * 100 + 20)
  );
  const [comments, setComments] = useState<ArticleComment[]>([
    {
      id: 'ac1',
      userId: 'user-2',
      username: 'CryptoWhale',
      avatar:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80',
      content:
        "This analysis is spot on! I've been saying this for weeks. The setup is perfect for early movers.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      level: 18,
      likes: 24,
    },
    {
      id: 'ac2',
      userId: 'user-3',
      username: 'TechGuru42',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      content:
        'Great read! The timing analysis is really interesting. Bookmarking this for later reference.',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      level: 22,
      likes: 18,
    },
    {
      id: 'ac3',
      userId: 'user-4',
      username: 'MarketMaven',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      content:
        "I'm not entirely convinced about the worst case scenario, but the overall thesis makes sense. Thanks for sharing!",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      level: 15,
      likes: 12,
    },
    {
      id: 'ac4',
      userId: 'user-5',
      username: 'PredictionPro',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      content:
        'This oracle always delivers 🔥 Following for more insights like this!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      level: 20,
      likes: 31,
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoadingRelatedArticles(true);
        const data = await newsService.getRelated(hotTake.id);
        setRelatedArticles(data);
      } catch {
      } finally {
        setIsLoadingRelatedArticles(false);
      }
    })();
  }, [hotTake.id]);

  const handlePostComment = () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const comment: ArticleComment = {
      id: `ac${Date.now()}`,
      userId: user?.id || 'user-1',
      username: user?.username || 'OracleSeeker',
      avatar:
        user?.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      content: newComment,
      timestamp: new Date().toISOString(),
      level: user?.level || 12,
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('Comment posted!');
  };

  // const scrollToComments = () => {
  //   commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // };

  // const handleLike = () => {
  //   if (liked) {
  //     setLikesCount((prev) => prev - 1);
  //     setLiked(false);
  //   } else {
  //     setLikesCount((prev) => prev + 1);
  //     setLiked(true);
  //     toast.success('Liked!');
  //   }
  // };

  // const handleShare = () => {
  //   setSharesCount((prev) => prev + 1);
  //   toast.success('Article shared!');
  // };

  const handleAskOracle = () => {
    if (!hotTake.oracle.id) {
      toast.error('Oracle not available');
      return;
    }

    // Navigate to oracle chat with article as context
    if (onAIAgentClick) {
      onAIAgentClick(hotTake.oracle.id);
    }

    // Note: The article content will need to be passed to the chat page
    // This could be done via state management or URL params
    toast.success(`Opening chat with ${hotTake.oracle.name}...`);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Sidebar - Fixed positioning for article detail page */}
      {/* <div className="fixed left-0 top-0 h-screen md:w-64 z-50">
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
      </div> */}
      <div className="">
        <div className="h-screen">
          {/* Article Content */}
          <div className="mx-auto max-w-4xl bg-background">
            <div className="px-6 pt-4 pb-8 md:px-12 md:pt-6 md:pb-10 space-y-6">
              {/* Title */}
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="flex lg:hidden mb-6 -ml-2 hover:bg-blue-500/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {previousPage === 'chat' ? 'chat' : 'hot takes'}
                </Button>
                <div className="flex items-start gap-4">
                  <h1 className="text-4xl leading-tight tracking-tight flex-1">
                    {hotTake.title}
                  </h1>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 py-4 border-y border-border">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30">
                      <ImageWithFallback
                        src={hotTake.oracle.image || ''}
                        alt={hotTake.oracle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {hotTake.oracle.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          Oracle
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{timeAgo(hotTake.createdAt)}</span>
                        <span>•</span>
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* <Button
                      variant="ghost"
                      size="sm"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button> */}
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
                  className="w-full h-full object-cover object-center md:mx-0 md:my-2.5 md:px-10 py-4"
                />
              </div>
            )}

            <div className="px-6 md:px-12 space-y-6">
              {/* Article Body */}
              <div
                className="prose prose-lg max-w-none space-y-6"
                dangerouslySetInnerHTML={{
                  __html: removeBrokenImages(hotTake.content),
                }}
              />

              {/* Engagement Section */}
              {/* <div className="flex items-center justify-between py-4 border-y border-border">
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 200 + 50)}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={scrollToComments}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{comments.length}</span>
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div> */}

              <Separator className="my-8" />

              {/* Oracle Signature */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6 mt-8">
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() =>
                      hotTake.oracle.id &&
                      onAIAgentClick &&
                      onAIAgentClick(hotTake.oracle.id)
                    }
                  >
                    <ImageWithFallback
                      src={hotTake.oracle.image || ''}
                      alt={hotTake.oracle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className="mb-2 cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() =>
                        hotTake.oracle.id &&
                        onAIAgentClick &&
                        onAIAgentClick(hotTake.oracle.id)
                      }
                    >
                      {hotTake.oracle.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {'Expert oracle'} providing insights and predictions on{' '}
                      {hotTake.oracle.name?.toLowerCase() || 'various topics'}.
                    </p>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="text-xs md:text-sm h-8 md:h-9"
                      onClick={() => hotTake.oracle.id && onAIAgentClick && onAIAgentClick(hotTake.oracle.id)}
                    >
                      <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                      <span className="hidden sm:inline ">Get Predictions from {hotTake.oracle.name}</span>
                      <span className="sm:hidden">Get Predictions</span>
                    </Button> */}
                  </div>
                </div>
              </div>

              {/* Related Articles */}
              <div className="mt-12">
                <h3 className="mb-6">More From Our Oracles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {isLoadingRelatedArticles ? (
                    <>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="space-y-2"
                        >
                          <Skeleton className="h-20 w-full rounded-lg" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-2 w-2/3" />
                        </div>
                      ))}
                    </>
                  ) : (
                    relatedArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="border-border hover:border-blue-500/50 transition-all cursor-pointer group overflow-hidden"
                        onClick={() => {
                          onSelectRelated(article);
                          window.scrollTo(0, 0);
                        }}
                      >
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
                                  src={article.oracle.image || ''}
                                  alt={article.oracle.name}
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
                              <span>{article.oracle.name}</span>
                              <span>•</span>
                              <span>{timeAgo(article.createdAt)}</span>
                            </div>
                            {/* <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
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
                          </div> */}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* <Separator className="my-12" /> */}
              {/* TODO: Add comment section */}
              <div className="h-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-40">
        <div className="container mx-auto max-w-4xl px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Like, Comment, Share */}
            <div className="flex items-center gap-6">
              {/* Like */}
              {/* <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${liked ? 'text-blue-500' : ''}`}
                onClick={handleLike}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}
                />
                <span>{likesCount}</span>
              </Button> */}

              {/* Comment */}
              {/* <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={scrollToComments}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length}</span>
              </Button> */}

              {/* Share */}
              {/* <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                <span>{sharesCount}</span>
              </Button> */}
            </div>

            {/* Right side: Ask Oracle */}
            <Button
              className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={handleAskOracle}
            >
              <Sparkles className="w-4 h-4" />
              Ask {hotTake.oracle.name}
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
