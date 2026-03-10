import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Separator } from './ui/separator';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  WalletConnectDialog,
  type WalletType,
  type SocialProvider,
} from './WalletConnectDialog';
import { News, newsService } from '../services/news.service';
import { timeAgo } from '../lib/date';
import { Skeleton } from './ui/skeleton';
import { sanitizeArticleHtml } from '../lib/htmlUtil';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

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
  hotTake?: News; // no longer used after fix, but kept for compatibility
  onBack: () => void;
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
  previousPage: string | null;

  onAIAgentClick?: (aiAgentId: string) => void;
  onWalletConnect?: (walletType: WalletType) => void;
  onSocialConnect?: (provider: SocialProvider) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;

  onSelectRelated: Dispatch<SetStateAction<News | null>>;
}

export function ArticleDetailPage({
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
  const navigate = useNavigate();
  const { slug } = useParams();

  const [article, setArticle] = useState<News | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  const commentsRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState('');

  const [relatedArticles, setRelatedArticles] = useState<News[]>([]);
  const [isLoadingRelatedArticles, setIsLoadingRelatedArticles] =
    useState<boolean>(false);

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
      if (!slug) return;
      setLoadingArticle(true);
      try {
        const data = await newsService.getBySlug(slug);
        setArticle(data);
      } catch (err) {
        toast.error('Failed to load article');
      } finally {
        setLoadingArticle(false);
      }
    })();
  }, [slug]);

  //
  // ────────────────────────────────
  //    LOAD RELATED ARTICLES
  // ────────────────────────────────
  //
  useEffect(() => {
    if (!article?.id) return;
    (async () => {
      try {
        setIsLoadingRelatedArticles(true);
        const data = await newsService.getRelated(article.id);
        setRelatedArticles(data);
      } catch {
      } finally {
        setIsLoadingRelatedArticles(false);
      }
    })();
  }, [article?.id]);

  //
  // ────────────────────────────────
  //    COMMENT HANDLER
  // ────────────────────────────────
  //
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

  const handleAskOracle = () => {
    if (!article?.oracle.id) {
      toast.error('Oracle not available');
      return;
    }
    onAIAgentClick?.(article.oracle.id);
    toast.success(`Opening chat with ${article.oracle.name}...`);
  };

  //
  // ────────────────────────────────
  //              LOADING
  // ────────────────────────────────
  //
  if (loadingArticle || !article) {
    return (
      <div className="p-10 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  //
  // ────────────────────────────────
  //              RENDER
  // ────────────────────────────────
  //
  return (
    <>
      <Helmet>
        <title>{article?.title} - Predit Market AI</title>
        <meta
          name="description"
          content={'Read detailed analysis and predictions from our AI oracles'}
        />
        <meta
          property="og:title"
          content={`${article?.title} - Predit Market AI`}
        />
        <meta
          property="og:description"
          content={'AI-powered analysis and predictions'}
        />
        <link
          rel="canonical"
          href={`${window.location.origin}/news/${slug}`}
        />
      </Helmet>
      <div className="min-h-screen bg-background relative">
        <div className="">
          <div className="h-screen">
            <div className="mx-auto max-w-4xl bg-background">
              <div className="px-6 pt-4 pb-8 md:px-12 md:pt-6 md:pb-10 space-y-6">
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={onBack}
                    className="flex lg:hidden mb-6 -ml-2 hover:bg-blue-500/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to {previousPage === 'chat' ? 'chat' : 'news'}
                  </Button>

                  <div className="flex items-start gap-4">
                    <h1 className="text-4xl leading-tight tracking-tight flex-1">
                      {article.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-3 py-4 border-y border-border">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30">
                        <ImageWithFallback
                          src={article.oracle.image || ''}
                          alt={article.oracle.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {article.oracle.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            Oracle
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{timeAgo(article.createdAt)}</span>
                          <span>•</span>
                          <span>5 min read</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {article.image && (
                <div className="relative h-72 sm:h-96 w-[90%] mx-auto rounded overflow-hidden flex items-center justify-center mb-5">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="px-6 md:px-12 space-y-6">
                <div
                  className="prose prose-lg max-w-none space-y-6"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeArticleHtml(article.content),
                  }}
                />

                <Separator className="my-8" />

                {/* Oracle signature */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6 mt-8">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => onAIAgentClick?.(article.oracle.id)}
                    >
                      <ImageWithFallback
                        src={article.oracle.image || ''}
                        alt={article.oracle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h4
                        className="mb-2 cursor-pointer hover:text-blue-400"
                        onClick={() => onAIAgentClick?.(article.oracle.id)}
                      >
                        {article.oracle.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Expert oracle providing insights and predictions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related articles */}
                <div className="mt-12">
                  <h3 className="mb-6">More From Our Oracles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoadingRelatedArticles ? (
                      <>
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="space-y-2"
                          >
                            <Skeleton className="h-20 w-full rounded-lg" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        ))}
                      </>
                    ) : (
                      relatedArticles.map((ra) => (
                        <Card
                          key={ra.id}
                          className="border-border hover:border-blue-500/50 cursor-pointer"
                          onClick={() => {
                            onSelectRelated(ra);
                            navigate(`/news/${ra.slug}`);
                          }}
                        >
                          <CardContent className="p-0">
                            {ra.image && (
                              <div className="relative h-48 overflow-hidden">
                                <img
                                  src={ra.image}
                                  alt={ra.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="p-4 space-y-2">
                              <h4 className="line-clamp-2 hover:text-blue-500">
                                {ra.title}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{ra.oracle.name}</span>
                                <span>•</span>
                                <span>{timeAgo(ra.createdAt)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                <div className="h-10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-40">
          <div className="container mx-auto max-w-4xl px-6 py-3">
            <div className="flex items-center justify-between">
              <Button
                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600"
                onClick={handleAskOracle}
              >
                <Sparkles className="w-4 h-4" />
                Ask {article.oracle.name}
              </Button>
            </div>
          </div>
        </div>

        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          onConnect={onWalletConnect}
          onSocialConnect={onSocialConnect}
          onOpenPrivacy={onOpenPrivacy}
          onOpenTerms={onOpenTerms}
        />
      </div>
    </>
  );
}
