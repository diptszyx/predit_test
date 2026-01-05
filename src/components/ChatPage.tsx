import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  Moon,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DisclaimerDialog } from './DisclaimerDialog';
import { ShareAIAgentDialog } from './ShareAIAgentDialog';
import { SharePredictionDialog } from './SharePredictionDialog';
import { SubscriptionManagementDialog } from './SubscriptionManagementDialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import TextareaAutosize from 'react-textarea-autosize';

import clsx from 'clsx';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { formatTime, timeAgo } from '../lib/date';
import type { User } from '../lib/types';
import { ChatMessage, messageService } from '../services/message.service';
import { News, newsService } from '../services/news.service';
import { OracleEntity, oraclesServices } from '../services/oracles.service';
import useAuthStore from '../store/auth.store';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { InfoAgentDialog } from './InfoAgentDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import HotTakeChatPageList from './hotTake/HotTakeChatPageList';
import { generateSuggestedQuestions, MAX_PREDICTIONS_PER_DAY, questionsByAIAgent } from '../constants/prediction';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MarketList from './market/MarketList';
import { Topic, topicServices } from '../services/topic-admin.service';
import Markdown from './chat/Markdown';
import { Textarea } from './ui/textarea';
import DailyLimitReachDialog from './dialog/DailyLimitReachDialog';

interface ChatPageProps {
  aiAgent: OracleEntity;
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onBetClick?: (betId: string) => void;
  user?: User | null;
  onOpenWalletDialog?: () => void;
  onNavigate?: (page: string) => void;
  totalQuestionsAsked?: number;
  onQuestionAsked?: () => void;
  userCreatedMarkets?: any[];
  onAddMarket?: (market: any) => void;
  currentPage?: string;
  onWalletDisconnect?: () => void;
  shortenAddress?: (address: string) => string;
  updateUser?: (updates: Partial<User>) => void;
  awardXPToUser?: (
    actionKey: string,
    options?: { showToast?: boolean; customMultipliers?: number[] }
  ) => any;
  trackQuestProgress?: (
    questType: 'visitAIAgents' | 'makePredictions' | 'shareContent',
    amount?: number
  ) => void;
  onArticleClick?: (article: News) => void;
  onOpenSettings?: () => void;
  onSetPendingNavigation?: (page: string) => void;
  articleContext?: News | null;
  onArticleContextUsed?: () => void;
  onOpenXPInfo?: () => void;
  initialPrompt?: string | null;
  onInitialPromptUsed?: () => void;
  onReloadAiAgent: (id: string) => void;
}

const tabs = [
  { id: 'chat', label: 'Chat' },
  { id: 'hotTakes', label: 'Hot Takes' },
  { id: 'market', label: 'Market' },
];

const PAGE_SIZE = 10;

export function ChatPage({
  aiAgent,
  onBack,
  darkMode,
  setDarkMode,
  user,
  onOpenWalletDialog,
  onNavigate,
  onQuestionAsked,
  onWalletDisconnect,
  shortenAddress,
  updateUser,
  onArticleClick,
  initialPrompt,
  onInitialPromptUsed,
  onReloadAiAgent,
}: ChatPageProps) {
  const fetchUser = useAuthStore((state) => state.fetchCurrentUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadsExpanded, setThreadsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState<News[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [topicFilter, setTopicFilter] = useState();
  const [isLoadingTopicList, setIsLoadingTopicList] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const isFetchingMoreRef = useRef(false);
  const [deletedArticleIds, setDeletedArticleIds] = useState<Set<string>>(
    new Set()
  );
  const [articleCounter, setArticleCounter] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Streaming states
  const [thinkingTokens, setThinkingTokens] = useState(0);
  const [citations, setCitations] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  // Rating and Like states
  const [userRating, setUserRating] = useState<number | null>(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(aiAgent.likes);
  const [localRating, setLocalRating] = useState(aiAgent.rating);

  // Sign-in and subscription tracking
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [limitReachedDialogOpen, setLimitReachedDialogOpen] = useState(false);
  const [limitReachedType, setLimitReachedType] = useState<
    'prediction' | 'textline' | 'total-predictions' | null
  >(null);

  // Share functionality
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<{
    question: string;
    answer: string;
  } | null>(null);

  // Disclaimer dialog
  const [disclaimerDialogOpen, setDisclaimerDialogOpen] = useState(false);
  const [shareAIAgentDialogOpen, setShareAIAgentDialogOpen] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(
    generateSuggestedQuestions(aiAgent)
  );

  // Rating flash functionality
  const [ratingFlashing, setRatingFlashing] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('chat');

  const navigate = useNavigate();
  const { oracleId } = useParams();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // auto send
  const location = useLocation();
  const autoSend = location.state?.autoSend;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user?.id) {
      setMessages([]);
      setUserMessageCount(0);
    }
  }, [user]);

  // Load messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageService.loadMessages(aiAgent.id);
        if (data) setMessages(data.reverse());
        if (autoSend) {
          const { question } = autoSend;
          handleSend(question);
          navigate(location.pathname, { replace: true, state: null });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (user?.id) {
      fetchMessages();
    }
  }, [user?.id]);

  // Send message from homepage
  useEffect(() => {
    if (initialPrompt && !isLoading) {
      // Set the input field with the prompt
      setInput(initialPrompt);

      // Auto-submit the prompt after a brief delay
      setTimeout(() => {
        handleSend(initialPrompt);

        // Mark initial prompt as used
        if (onInitialPromptUsed) {
          onInitialPromptUsed();
        }
      }, 2300);
    }
  }, [initialPrompt]);

  // Load default hot takes on mount
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingTopicList(true);
        const topicList = await topicServices.getAllTopics();
        setTopicList(topicList);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTopicList(false);
      }
    })();
  }, []);

  // Load default hot takes on mount
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingNews(true);
        setPage(0);
        setHasMoreArticles(true);
        isFetchingMoreRef.current = false;

        const initial = await newsService.getNewsList(
          aiAgent.id,
          topicFilter,
          PAGE_SIZE,
          0
        );

        setNewsArticles(initial);
        setHasMoreArticles(initial.length === PAGE_SIZE);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingNews(false);
      }
    })();
  }, [aiAgent.id, topicFilter]);

  // Load next page
  const getMore = async () => {
    if (!hasMoreArticles) return;
    if (isFetchingMoreRef.current) return;

    isFetchingMoreRef.current = true;

    try {
      const nextPage = page + 1;
      const offset = nextPage * PAGE_SIZE;

      const more = await newsService.getNewsList(
        aiAgent.id,
        topicFilter,
        PAGE_SIZE,
        offset
      );

      setNewsArticles((prev) => [...prev, ...more]);
      setPage(nextPage);

      if (more.length < PAGE_SIZE) {
        setHasMoreArticles(false); // reached end
      }
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingMoreRef.current = false;
    }
  };

  // Load user status to oracle
  useEffect(() => {
    if (user?.id) {
      (async () => {
        try {
          const data = await oraclesServices.getOracleUserStatus(aiAgent.id);
          if (data) {
            setHasLiked(data.hasLiked);
            setUserRating(data?.userRating || 0);
          }
        } catch (error) {
          console.log('Failed to fetch oracles user status: ', error);
        }
      })();
    }
  }, [user]);

  // Auto-send pending message after user signs in or upgrades subscription
  // useEffect(() => {
  //   const shouldSendPending =
  //     pendingMessage &&
  //     !signInDialogOpen &&
  //     !subscriptionDialogOpen &&
  //     // Either just signed in
  //     ((user?.walletAddress && !isLoading) ||
  //       // Or has a paid subscription
  //       (user?.subscriptionTier && user?.subscriptionTier !== "free"));

  //   if (shouldSendPending) {
  //     // User just signed in or upgraded and we have a pending message
  //     const sendPendingMessage = async () => {
  //       // Check if this is a prediction question
  //       const isPrediction = isPredictionQuestion(pendingMessage);
  //       console.log("Auto-send message:", pendingMessage);
  //       console.log("Auto-send is prediction:", isPrediction);

  //       const userMessage: Message = {
  //         id: Date.now().toString(),
  //         role: "user",
  //         content: `I want a prediction on: ${pendingMessage}`,
  //         timestamp: new Date(),
  //         isPrediction,
  //       };

  //       setMessages((prev) => [...prev, userMessage]);
  //       setInput(""); // Clear input
  //       setPendingMessage(""); // Clear pending message
  //       setIsLoading(true);

  //       // Track total questions asked
  //       if (onQuestionAsked) {
  //         onQuestionAsked();
  //       }

  //       // Increment daily line count for free users (for pending messages)
  //       if (
  //         user?.walletAddress &&
  //         (!user?.subscriptionTier || user?.subscriptionTier === "free")
  //       ) {
  //         const linesInMessage = countLines(pendingMessage);
  //         incrementDailyLines(linesInMessage);
  //       }

  //       // Fetch relevant news
  //       fetchRelevantNews(pendingMessage);

  //       try {
  //         const response = await sendToGrokAPI(pendingMessage, aiAgent);
  //         const assistantMessage: Message = {
  //           id: (Date.now() + 1).toString(),
  //           role: "assistant",
  //           content: response,
  //           timestamp: new Date(),
  //           isPrediction,
  //           suggestedQuestions: generateSuggestedQuestions(
  //             aiAgent,
  //             pendingMessage
  //           ),
  //         };
  //         setMessages((prev) => [...prev, assistantMessage]);

  //         // If this was a prediction, store it and flash the share button
  //         if (isPrediction) {
  //           console.log("✓ PREDICTION DETECTED (pending message)!");
  //           console.log("Question:", pendingMessage);
  //           console.log("Answer:", response);
  //           const predictionData = {
  //             question: pendingMessage,
  //             answer: response,
  //           };
  //           console.log("Storing prediction data:", predictionData);
  //           setLastPrediction(predictionData);
  //           setShareFlashing(true);

  //           // Stop flashing after 3 seconds
  //           setTimeout(() => {
  //             setShareFlashing(false);
  //           }, 3000);
  //         }
  //       } catch (error) {
  //         console.error("Error sending message:", error);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //     sendPendingMessage();
  //   }
  // }, [
  //   user?.walletAddress,
  //   user?.subscriptionTier,
  //   pendingMessage,
  //   signInDialogOpen,
  //   subscriptionDialogOpen,
  // ]);

  // Increment daily prediction count
  function incrementDailyPredictions() {
    if (user && updateUser && !user.isPro) {
      const currentUsed = user.totalPredictions || 0;
      const remaining = user.restTodayPredictionCount || 0;
      updateUser({
        totalPredictions: currentUsed + 1,
        restTodayPredictionCount: remaining - 1,
      });
    }
  }

  const handleArticleClick = async (slug: string) => {
    navigate(`/hot-takes/${slug}`);
  };

  const handleSend = async (messageToSend?: string) => {
    const messageText = messageToSend || input.trim();
    if (!messageText || isLoading) return;

    const trimmedInput = messageText;

    // Check if user is signed in - required to send any message
    if (!user) {
      setPendingMessage(trimmedInput);
      setInput('');
      setSignInDialogOpen(true);
      return;
    }

    // Increment user message count
    const newMessageCount = userMessageCount + 1;
    setUserMessageCount(newMessageCount);

    if (
      user?.id &&
      !user?.isPro &&
      (user?.restTodayPredictionCount || 0) <= 0
    ) {
      setLimitReachedType('total-predictions');
      setLimitReachedDialogOpen(true);
      setInput('');
      return;
    }

    // Track total questions asked
    if (onQuestionAsked) {
      onQuestionAsked();
    }

    // Increment daily prediction count if this is a prediction
    if (!user.isPro) {
      incrementDailyPredictions();

      // Increment total predictions and award XP with exponential curve
      const restTodayPredictionCount = (user.restTodayPredictionCount || 0) - 1;

      // Show subscription popup after 5th prediction
      if (restTodayPredictionCount === 0 && !user.isPro) {
        // Delay showing the dialog to allow the prediction to complete
        setTimeout(() => {
          setLimitReachedType('total-predictions');
          setLimitReachedDialogOpen(true);
        }, 2000); // Show after 2 seconds
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: `${trimmedInput}`,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setThinkingTokens(0);
    setCitations([]);

    setSuggestedQuestions(generateSuggestedQuestions(aiAgent));

    // Prepare assistant message ID but don't create message yet
    const assistantMessageId = (Date.now() + 1).toString();
    let messageCreated = false;

    try {
      await messageService.sendMessageStream(trimmedInput, aiAgent.id, {
        onMetadata: (metadata) => {
          // Handle metadata (userMessage and xpReward)
          if (metadata.xpReward.milestone) {
            toast.success(
              `🎯 Prediction Milestone Reached! +${metadata.xpReward.milestone?.xp} XP earned.`
            );
          }
        },
        onSession: (id) => {
          setSessionId(id);
          console.log('Session ID:', id);
        },
        onThinking: (tokens) => {
          setThinkingTokens(tokens);
        },
        onContent: (content) => {
          // Hide thinking indicator when content starts
          setThinkingTokens(0);

          // Create assistant message only on first content chunk
          if (!messageCreated) {
            messageCreated = true;
            const assistantMessage: ChatMessage = {
              id: assistantMessageId,
              sender: 'assistant',
              content: content,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } else {
            // Append content to existing message
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + content }
                  : msg
              )
            );
          }
        },
        onComplete: (data) => {
          // Handle completion with usage stats and citations
          if (data.citations && data.citations.length > 0) {
            setCitations(data.citations);
          }
          console.log('Stream complete. Usage:', data.usage);
        },
        onDone: () => {
          // Handle stream done
          setIsLoading(false);
          setThinkingTokens(0);
          fetchUser();
          onReloadAiAgent?.(aiAgent.id);
        },
        onError: (error) => {
          // Handle error
          console.error('Error streaming message:', error);
          toast.error('Failed to send message. Please try again.');
          setIsLoading(false);
          setThinkingTokens(0);
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setIsLoading(false);
      setThinkingTokens(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleLike = async () => {
    if (!hasLiked) {
      try {
        const data = await oraclesServices.handleLike(aiAgent.id);
        if (data) {
          setHasLiked(true);
          setLocalLikes(data.likes);
          onReloadAiAgent?.(aiAgent.id);
        }
      } catch (error) {
        console.log('Failed to like oracle: ', error);
      }
    } else {
      try {
        const data = await oraclesServices.handleDislike(aiAgent.id);
        if (data) {
          setHasLiked(false);
          setLocalLikes(data.likes);
          onReloadAiAgent?.(aiAgent.id);
        }
      } catch (error) {
        console.log('Failed to dislike oracle: ', error);
      }
    }
  };

  const handleRating = async (rating: number) => {
    // In a real app, this would update the oracle's rating based on user feedback
    try {
      const data = await oraclesServices.handleRating(aiAgent.id, rating);
      if (data) {
        setUserRating(rating);
        onReloadAiAgent?.(aiAgent.id);
      }
      console.log('data rating', data);
    } catch (error) {
      console.log('Failed to rate oracle: ', error);
    }
  };

  const formatLikes = (likes: number): string => {
    // if (likes >= 1000) {
    //   return `${(likes / 1000).toFixed(1)}K`;
    // }
    return likes.toString();
  };

  return (
    <div
      className={
        onNavigate && shortenAddress && onWalletDisconnect && onOpenWalletDialog
          ? 'flex h-dvh bg-background overflow-hidden'
          : 'min-h-dvh bg-background'
      }
    >
      {/* Main Content */}
      <div
        className={
          onNavigate &&
            shortenAddress &&
            onWalletDisconnect &&
            onOpenWalletDialog
            ? 'flex-1 overflow-y-auto'
            : ''
        }
      >
        {/* Oracle Header Bar */}
        {!(
          onNavigate &&
          shortenAddress &&
          onWalletDisconnect &&
          onOpenWalletDialog
        ) && (
            <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
              <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
                <div className="flex items-center gap-3 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={aiAgent.image}
                      alt={aiAgent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm sm:text-base leading-none truncate">
                      {aiAgent.name}
                    </h1>
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">
                      {aiAgent.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-xs text-muted-foreground">
                  <div className="hidden sm:flex items-center gap-3">
                    <span>{localRating} rating</span>
                    <span>{formatLikes(localLikes)} likes</span>
                    {aiAgent.consultSessions && (
                      <span className="hidden md:inline">
                        {aiAgent.consultSessions} sessions
                      </span>
                    )}
                  </div>
                  <div className="flex sm:hidden">
                    <span>{localRating}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDarkMode(!darkMode)}
                    className="h-8 w-8"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </header>
          )}

        {/* Main Chat Area */}
        <div className="w-full h-full">
          <div className="h-full flex flex-col lg:flex-row max-w-7xl m-[0px] gap-4 w-full">
            {/* Chat Section - Center with max width */}
            <div className="w-full h-full lg:flex-1 space-y-0 flex flex-col">
              {/* Oracle mobile header tab */}
              <div className="lg:hidden fixed top-0 left-0 right-0 z-[10]">
                <Card
                  className="border-border bg-background/80 backdrop-blur-md"
                  style={{
                    borderRadius: '0px',
                  }}
                >
                  <CardContent
                    className="p-2 sm:p-3 md:p-4 border-b border-border bg-card/80 backdrop-blur-md rounded-xl"
                    style={{
                      borderRadius: '0px',
                      padding: '16px 8px',
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-blue-500/30 flex-shrink-0">
                        <ImageWithFallback
                          src={aiAgent.image}
                          alt={aiAgent.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base md:text-lg truncate">
                          {aiAgent.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {aiAgent.type}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInfoDialogOpen(true)}
                        className="lg:hidden text-white hover:text-white flex-shrink-0 bg-blue-600 hover:bg-blue-700! h-8 sm:h-9 px-2 sm:px-3 cursor-pointer"
                      >
                        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="ml-1.5 hidden sm:inline text-xs sm:text-sm">
                          Info
                        </span>
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        // onClick={() => setShareOracleDialogOpen(true)}
                        className="text-white hover:text-white flex-shrink-0 bg-blue-600 hover:bg-blue-700 h-8 sm:h-9 px-2 sm:px-3 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="ml-1.5 hidden sm:inline text-xs sm:text-sm">
                          Share
                        </span>
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={clsx(
                    'border-border bg-background/80 backdrop-blur-md'
                  )}
                  style={{
                    borderRadius: '0px',
                  }}
                >
                  <CardContent
                    className="border-b border-border bg-card/80 backdrop-blur-md rounded-xl flex items-center"
                    style={{
                      borderRadius: '0px',
                      padding: 0,
                    }}
                  >
                    {tabs.map((tab) => (
                      <div
                        key={tab.id}
                        className={clsx(
                          'relative flex-1 p-2 py-4 sm:p-3 flex items-center justify-center text-base font-medium cursor-pointer transition-opacity',
                          currentTab === tab.id
                            ? 'opacity-100'
                            : 'opacity-50 hover:opacity-80'
                        )}
                        onClick={() => setCurrentTab(tab.id)}
                      >
                        {tab.label}

                        {currentTab === tab.id && (
                          <motion.div
                            layoutId="underline"
                            className="absolute bottom-0 h-[2px] dark:bg-white bg-black w-full"
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              {currentTab === 'chat' && (
                <>
                  {/* Oracle Header - Above conversation box */}
                  <Card
                    className="border-border bg-background/80 backdrop-blur-md hidden md:block!"
                    style={{
                      borderRadius: '0px',
                    }}
                  >
                    <CardContent
                      className="p-2 sm:p-3 md:p-4 border-b border-border bg-card/80 backdrop-blur-md rounded-xl"
                      style={{
                        borderRadius: '0px',
                        padding: '14px 8px',
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-blue-500/30 flex-shrink-0">
                          <ImageWithFallback
                            src={aiAgent.image}
                            alt={aiAgent.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm sm:text-base md:text-lg truncate">
                            {aiAgent.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {aiAgent.type}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInfoDialogOpen(true)}
                          className="text-white hover:text-white flex-shrink-0 bg-blue-600 hover:bg-blue-700! h-8 sm:h-9 px-2 sm:px-3 cursor-pointer"
                        >
                          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          // onClick={() => setShareOracleDialogOpen(true)}
                          className="text-white hover:text-white flex-shrink-0 bg-blue-600 hover:bg-blue-700 h-8 sm:h-9 px-2 sm:px-3 cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="ml-1.5 hidden sm:inline text-xs sm:text-sm">
                            Share
                          </span>
                        </Button> */}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chat Container with Background */}
                  <div className="relative sm:h-[calc(100vh-16rem)] flex-1 overflow-hidden mt-[130px] md:mt-0!">
                    {/* Background Color */}
                    <div className="absolute inset-0 bg-card/50" />

                    {/* Chat Interface - Full Height */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                      {/* Messages Area - Scrollable with transparent background */}
                      <div className="flex-1 overflow-hidden pointer-events-auto rounded-none border-r">
                        <ScrollArea className="h-full p-2 sm:p-3 md:p-4 bg-muted/80">
                          {(!user || messages.length === 0) && (
                            <div className="flex flex-col items-center justify-center my-12 px-4 text-center">
                              <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">
                                Start a New Conversation
                              </h3>
                              <p className="text-sm text-muted-foreground max-w-md">
                                Ask {aiAgent.name} anything. Get predictions,
                                insights, and expert analysis on{' '}
                                {aiAgent.type.split(' ')[0]}.
                              </p>
                            </div>
                          )}
                          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
                            {messages.map((message, index) => {
                              const isLastMessage = index === messages.length - 1;

                              return (
                                <div key={message.id}>
                                  <div
                                    className={`flex ${message.sender === 'user'
                                      ? 'justify-end max-w-[94vw]'
                                      : 'justify-start'
                                      }`}
                                  >
                                    <div
                                      className={`max-w-[80%] sm:max-w-[75%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg ${message.sender === 'user'
                                        ? 'bg-blue-600 text-white backdrop-blur-sm'
                                        : `backdrop-blur-md border border-border`
                                        }`}
                                    >
                                      {message.sender === 'assistant' ? (
                                        <div className="text-xs sm:text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-2 prose-code:text-xs">
                                          <Markdown
                                            text={message.content}
                                            showCharts={!isLoading || !isLastMessage}
                                          />
                                        </div>
                                      ) : (
                                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                          {message.content}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span
                                    className={`text-xs mt-2 block text-muted-foreground ${message.sender === 'user'
                                      ? 'text-right max-w-[94vw]'
                                      : 'text-left'
                                      }`}
                                  >
                                    {formatTime(message.createdAt)}
                                  </span>

                                  {/* Suggested Questions for assistant messages (only show for the last message and if not loading) */}
                                  {/* {message.sender === "assistant"
                              && message.suggestedQuestions && index === messages.length - 1 && !isLoading &&
                              (
                              <div className="flex justify-start mt-2 sm:mt-3">
                                <div className="max-w-[85%] sm:max-w-[75%] flex flex-col gap-1.5 sm:gap-2">
                                  {message.suggestedQuestions.map((question, qIndex) => (
                                    <button
                                      key={qIndex}
                                      onClick={() => handleSend(question)}
                                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 hover:border-blue-500/60 rounded-full text-foreground hover:text-foreground transition-all backdrop-blur-sm text-left"
                                    >
                                      {question}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )} */}
                                  {message.sender === 'assistant' &&
                                    suggestedQuestions &&
                                    index === messages.length - 1 &&
                                    !isLoading && (
                                      <div className="flex justify-start mt-2 sm:mt-3">
                                        <div className="max-w-[85%] sm:max-w-[75%] flex flex-col gap-1.5 sm:gap-2">
                                          {suggestedQuestions.map(
                                            (question, qIndex) => (
                                              <button
                                                key={qIndex}
                                                onClick={() =>
                                                  handleSend(question)
                                                }
                                                className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 hover:border-blue-500/60 rounded-full text-foreground hover:text-foreground transition-all backdrop-blur-sm text-left cursor-pointer"
                                              >
                                                {question}
                                              </button>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                            {isLoading && thinkingTokens > 0 && (
                              <div className="flex justify-start">
                                <div className="max-w-[85%] sm:max-w-[75%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 bg-muted/80 backdrop-blur-md border border-border shadow-lg">
                                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-border flex-shrink-0">
                                      <ImageWithFallback
                                        src={aiAgent.image}
                                        alt={aiAgent.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="text-xs text-foreground">
                                      {aiAgent.name} is thinking... ({thinkingTokens} tokens)
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <div
                                      className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                                      style={{ animationDelay: '0ms' }}
                                    />
                                    <div
                                      className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                                      style={{ animationDelay: '150ms' }}
                                    />
                                    <div
                                      className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                                      style={{ animationDelay: '300ms' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Input Section - Fixed at top with semi-transparent background */}
                      <div className="p-2 sm:p-3 md:p-4 backdrop-blur-xl pointer-events-auto bg-card/90 border-r">
                        <div className="max-w-4xl mx-auto">
                          {/* Daily Prediction Limit Counter for Free Users */}
                          {user?.id &&
                            !user?.isPro &&
                            (() => {
                              // const today = new Date().toDateString();
                              // const lastResetDate = user?.dailyMessagesResetDate;
                              // const dailyUsed = (lastResetDate === today) ? (user?.dailyMessagesUsed || 0) : 0;
                              // const remaining = 5 - dailyUsed;

                              return (
                                <div className="mb-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <MessageSquare className="w-4 h-4" />
                                      <span>
                                        {user.restTodayPredictionCount}/{MAX_PREDICTIONS_PER_DAY} {' '}
                                        messages remaining today
                                      </span>
                                    </div>
                                    {user.restTodayPredictionCount <= 2 && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          setSubscriptionDialogOpen(true)
                                        }
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90 h-7 px-3 text-xs flex-shrink-0 cursor-pointer"
                                      >
                                        <Crown className="w-3 h-3 mr-1" />
                                        Upgrade
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                          {/* Daily Line Limit Counter for Free Users */}
                          {user?.walletAddress &&
                            user?.subscriptionTier !== 'master' &&
                            (() => {
                              const today = new Date().toDateString();
                              const lastResetDate = user?.dailyLinesResetDate;
                              const dailyUsed =
                                lastResetDate === today
                                  ? user?.dailyLinesUsed || 0
                                  : 0;
                              const remaining = 100 - dailyUsed;
                              const percentage = (dailyUsed / 100) * 100;

                              if (remaining <= 30) {
                                return (
                                  <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-orange-500/20 border border-orange-500/40 rounded-lg backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-2 gap-2">
                                      <p className="text-xs sm:text-sm text-foreground truncate">
                                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                        {remaining} lines left
                                      </p>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          setSubscriptionDialogOpen(true)
                                        }
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90 h-7 sm:h-8 px-2 sm:px-3 flex-shrink-0"
                                      >
                                        <Crown className="w-3 h-3 mr-0.5 sm:mr-1" />
                                        <span className="text-xs">Upgrade</span>
                                      </Button>
                                    </div>
                                    <div className="w-full bg-black/30 rounded-full h-1.5">
                                      <div
                                        className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {dailyUsed}/100 lines used
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                          <div className="flex gap-1.5 sm:gap-2">
                            <div
                              className="flex-1 flex items-center gap-2 bg-muted/50 backdrop-blur-md border border-border rounded-full px-6 h-14 sm:h-16 cursor-pointer relative"
                              onClick={() => {
                                if (!user) {
                                  setSignInDialogOpen(true);
                                }
                              }}
                            >
                              {/* Input Field */}
                              {!user ? (
                                <span className="flex-1 text-muted-foreground text-sm">
                                  Sign in to chat
                                </span>
                              ) : (
                                <TextareaAutosize
                                  value={input}
                                  onChange={(e) => setInput(e.target.value)}
                                  onKeyDown={handleKeyPress}
                                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-[16px] sm:text-sm
                                  leading-normal mr-9 resize-none"
                                  placeholder="I want a prediction on..."
                                  disabled={isLoading}
                                  maxRows={2}
                                  minRows={1}
                                />
                              )}

                              {/* Circular Submit Button - Matching Home Page */}
                              <button
                                onClick={() => handleSend(input)}
                                disabled={!input.trim() || isLoading || !user}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group flex-shrink-0 shadow-sm cursor-pointer hover:scale-105"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  background: 'rgba(59, 130, 246, 0.25)',
                                  backdropFilter: 'blur(4px)',
                                  border: '1px solid rgba(59, 130, 246, 0.25)',
                                  boxShadow:
                                    '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
                                }}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-5 h-5 mx-auto animate-spin text-blue-500" />
                                ) : (
                                  <ArrowRight
                                    className="w-5 h-5 mx-auto text-blue-500 transition-transform duration-150 group-hover:translate-x-0.5"
                                    style={{
                                      filter:
                                        'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25))',
                                    }}
                                  />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1.5 sm:mt-2 text-center mx-auto">
                          AI agents can make mistakes. Check{' '}
                          <button
                            onClick={() => setDisclaimerDialogOpen(true)}
                            className="text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer"
                          >
                            Disclaimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {currentTab === 'hotTakes' && (
                <div className="lg:hidden w-full space-y-3 pt-[130px]">
                  {/* Hot Takes Section */}
                  <Card
                    className="border-border"
                    style={{ borderRadius: 0 }}
                  >
                    <CardHeader className="border-b border-border pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="w-4 h-4" />
                        <span>Hot Takes</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Latest insights from {aiAgent.name}
                      </p>
                    </CardHeader>

                    <HotTakeChatPageList
                      topicFilter={topicFilter}
                      setTopicFilter={setTopicFilter}
                      topicList={topicList}
                      isLoadingTopicList={isLoadingTopicList}
                      newsArticles={newsArticles}
                      isLoadingNews={isLoadingNews}
                      getMore={getMore}
                      hasMoreArticles={hasMoreArticles}
                      handleArticleClick={handleArticleClick}
                    />
                  </Card>
                </div>
              )}

              {currentTab === 'market' && (
                <div className="lg:hidden w-full space-y-3 pt-[130px] h-full">
                  {/* Market Section */}
                  <Card
                    className="border-border h-full"
                    style={{ borderRadius: 0 }}
                  >
                    <CardHeader className="border-b border-border pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Markets</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Latest market from {aiAgent.name}
                      </p>
                    </CardHeader>

                    <MarketList oracleId={aiAgent.id} />
                  </Card>
                </div>
              )}
            </div>
            {/* News Feed - Right - Hidden on mobile */}
            <div className="hidden lg:block w-full h-full lg:w-80">
              {/* Market */}
              <Card
                className="border-border overflow-hidden mb-3"
                style={{
                  height: 'calc(50vh - 12px)',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  gap: 0,
                }}
              >
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Markets</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Latest market from {aiAgent.name}
                  </p>
                </CardHeader>

                <MarketList oracleId={aiAgent.id} />
              </Card>

              {/* Hot Takes Section */}
              <Card
                className="border-border overflow-hidden"
                style={{
                  height: '50vh',
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  gap: 0,
                }}
              >
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4" />
                    <span>Hot Takes</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Latest insights from {aiAgent.name}
                  </p>
                </CardHeader>
                <HotTakeChatPageList
                  topicFilter={topicFilter}
                  setTopicFilter={setTopicFilter}
                  topicList={topicList}
                  isLoadingTopicList={isLoadingTopicList}
                  newsArticles={newsArticles}
                  isLoadingNews={isLoadingNews}
                  getMore={getMore}
                  hasMoreArticles={hasMoreArticles}
                  handleArticleClick={handleArticleClick}
                />
              </Card>
            </div>
          </div>
        </div>

        {/* Sign In Dialog */}
        <AlertDialog
          open={signInDialogOpen}
          onOpenChange={setSignInDialogOpen}
        >
          <AlertDialogContent className="max-w-md mx-0 sm:mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                Sign In to Continue
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p className="text-sm">
                    Sign in required to chat with {aiAgent.name} and get
                    personalized AI predictions!
                  </p>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm font-medium mb-2">Sign in to get:</p>
                    <ul className="text-xs sm:text-sm space-y-1 text-muted-foreground">
                      <li>✓ Get predictions from all AI agents</li>
                      <li>✓ Save your conversation history</li>
                      <li>✓ Level up and earn XP</li>
                      <li>✓ Share predictions</li>
                      <li>✓ Access to premium features</li>
                    </ul>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">
                Maybe Later
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setSignInDialogOpen(false);
                  if (onOpenWalletDialog) {
                    onOpenWalletDialog();
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white w-full sm:w-auto"
              >
                Sign In Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Subscription Management Dialog */}
        <SubscriptionManagementDialog
          open={subscriptionDialogOpen}
          onOpenChange={setSubscriptionDialogOpen}
          // currentTier={user?.subscriptionTier || "free"}
          isUserPro={user?.isPro}
          onSubscriptionSuccess={() => {
            // if (updateUser) {
            //   updateUser({ subscriptionTier: "master" });
            // }
            // if (awardXPToUser) {
            //   awardXPToUser("SUBSCRIBE_MASTER", { showToast: false });
            // }
            // toast.success("Welcome to Pro! 🎉");
          }}
        />

        <DailyLimitReachDialog
          open={limitReachedDialogOpen}
          onChange={setLimitReachedDialogOpen}
          setSubscriptionDialogOpen={setSubscriptionDialogOpen}
        />

        {/* Share Prediction Dialog */}
        {lastPrediction && (
          <SharePredictionDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            question={lastPrediction.question}
            answer={lastPrediction.answer}
            aiAgentName={aiAgent.name}
            aiAgentAvatar={aiAgent.image}
            aiAgentEmoji={aiAgent.emoji}
          />
        )}

        {/* Share AI Agent Dialog */}
        <ShareAIAgentDialog
          open={shareAIAgentDialogOpen}
          onOpenChange={setShareAIAgentDialogOpen}
          aiAgentName={aiAgent.name}
          aiAgentAvatar={aiAgent.avatar}
          aiAgentTitle={aiAgent.title}
          aiAgentId={aiAgent.id}
        />

        {/* Disclaimer Dialog */}
        <DisclaimerDialog
          open={disclaimerDialogOpen}
          onOpenChange={setDisclaimerDialogOpen}
        />

        <InfoAgentDialog
          open={infoDialogOpen}
          onOpenChange={setInfoDialogOpen}
          aiAgent={aiAgent}
          handleLike={handleLike}
          handleRating={handleRating}
          hasLiked={hasLiked}
          userRating={userRating}
          localLikes={localLikes}
        />
      </div>
    </div>
  );
}
