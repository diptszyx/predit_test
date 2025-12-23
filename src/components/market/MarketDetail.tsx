import clsx from 'clsx';
import { ArrowLeft, ArrowRight, Crown, Info, Loader2, MessageSquare, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import { generateSuggestedQuestions, MAX_PREDICTIONS_PER_DAY } from '../../constants/prediction';
import { formatTime } from '../../lib/date';
import { User } from '../../lib/types';
import { getMarketMessages, MarketMessage, sendMarketMessageStream } from '../../services/market-messages.service';
import { getMarketById, Market } from '../../services/market.service';
import { ChatMessage } from '../../services/message.service';
import { OracleEntity } from '../../services/oracles.service';
import useAuthStore from '../../store/auth.store';
import Markdown from '../chat/Markdown';
import DailyLimitReachDialog from '../dialog/DailyLimitReachDialog';
import { DisclaimerDialog } from '../DisclaimerDialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SubscriptionManagementDialog } from '../SubscriptionManagementDialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import MarketInfoModal from './MarketInfoModal';
import MarketList from './MarketList';
import { MarketModal } from './MarketModal';

interface MarketDetailProps {
  updateUser?: (updates: Partial<User>) => void;
}

const tabs = [
  { id: 'chat', label: 'Chat' },
  { id: 'market', label: 'Market' },
];

export default function MarketDetail({ updateUser }: MarketDetailProps) {
  const navigate = useNavigate();
  const fetchUser = useAuthStore((state) => state.fetchCurrentUser);
  const user = useAuthStore((state) => state.user);
  const { marketId } = useParams<{
    marketId: string;
  }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'yes' | 'no' | null>(
    null
  );
  const [aiAgent, setAIAgent] = useState<OracleEntity>()
  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [messages, setMessages] = useState<MarketMessage[]>([]);
  const [userMessageCount, setUserMessageCount] = useState(0);

  const [disclaimerDialogOpen, setDisclaimerDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [limitReachedDialogOpen, setLimitReachedDialogOpen] = useState(false);
  const [marketInfoOpen, setMarketInfoOpen] = useState(false)

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingTokens, setThinkingTokens] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, marketId]);

  const fetchMarket = async () => {
    if (!marketId) return;

    try {
      const data = await getMarketById(marketId);
      setMarket(data);
      setAIAgent(data.oracle)
      setSuggestedQuestions(generateSuggestedQuestions(data.oracle, ''))
    } catch (err) {
      console.error(err);
      setError('Failed to load market details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!marketId) return

    try {
      const data = await getMarketMessages(marketId)
      if (data) {
        setMessages(data.reverse())
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchMarket();
    fetchMessages()
  }, [marketId]);



  const handleBetClick = (choice: 'yes' | 'no') => {
    if (!user) {
      toast.error('Please log in to place a bet');
      return;
    }

    if (market?.isBetted) {
      toast.error('You have already placed a bet on this market');
      return;
    }

    setSelectedChoice(choice);
    setModalOpen(true);
  };

  const handleBetPlaced = async () => {
    // Refetch market data after bet is placed
    if (!marketId) return;

    try {
      const data = await getMarketById(marketId);
      setMarket(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBack = () => {
    navigate('/market');
  };

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

  const bufferRef = useRef("");
  const flushTimer = useRef<number | null>(null);

  const flushBuffer = (assistantMessageId: string) => {
    if (!bufferRef.current) return;

    const chunk = bufferRef.current;
    bufferRef.current = "";

    setMessages(prev =>
      prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: msg.content + chunk }
          : msg
      )
    );
  };

  const onStreamContent = (content: string, assistantMessageId: string) => {
    bufferRef.current += content;

    if (!flushTimer.current) {
      flushTimer.current = window.setTimeout(() => {
        flushTimer.current = null;
        flushBuffer(assistantMessageId);
      }, 100);
    }
  };

  const handleSend = async (messageToSend?: string) => {
    const trimmedInput = messageToSend || input.trim();
    if (!user || !trimmedInput || isLoading) return;

    // Increment user message count
    const newMessageCount = userMessageCount + 1;
    setUserMessageCount(newMessageCount);

    if (
      user?.id &&
      !user?.isPro &&
      (user?.restTodayPredictionCount || 0) <= 0
    ) {
      setLimitReachedDialogOpen(true);
      setInput('');
      return;
    }

    // Increment daily prediction count if this is a prediction
    if (!user.isPro) {
      incrementDailyPredictions();

      const restTodayPredictionCount = (user.restTodayPredictionCount || 0) - 1;

      if (restTodayPredictionCount === 0 && !user.isPro) {
        setTimeout(() => {
          setLimitReachedDialogOpen(true);
        }, 2000);
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

    setSuggestedQuestions(generateSuggestedQuestions(aiAgent));

    const assistantMessageId = (Date.now() + 1).toString();
    let messageCreated = false;

    try {
      await sendMarketMessageStream(trimmedInput, marketId, {
        onMetadata: (metadata) => {
          // Handle metadata (userMessage and xpReward)
          if (metadata.xpReward.milestone) {
            toast.success(
              `🎯 Prediction Milestone Reached! +${metadata.xpReward.milestone?.xp} XP earned.`
            );
          }
        },
        onSession: (id) => { },
        onThinking: (tokens) => {
          setThinkingTokens(tokens);
        },
        onContent: (content) => {
          setThinkingTokens(0);

          if (!messageCreated) {
            messageCreated = true;
            setMessages(prev => [
              ...prev,
              { id: assistantMessageId, sender: 'assistant', content: '', createdAt: new Date().toISOString() }
            ]);
          }

          onStreamContent(content, assistantMessageId);
        },
        onComplete: (data) => {

        },
        onDone: () => {
          setIsLoading(false);
          setThinkingTokens(0);
          fetchUser();
        },
        onError: (error) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex h-dvh overflow-hidden">
        <div className='flex-1'>
          <div className="flex items-start justify-between gap-2">
            <div className="max-w-4xl mx-auto flex-1">
              <Skeleton className="h-64 md:h-96 w-full rounded-none" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                </div>
              </div>
            </div>
            <div className='hidden sm:block w-full h-full lg:w-80'>
              <Skeleton className="h-[98vh] w-full rounded-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !market || !aiAgent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full p-4 lg:p-6 space-y-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <p className="text-red-500 text-center">
                {error || 'Market not found'}
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex h-dvh overflow-hidden">
      <div className='flex-1 overflow-y-auto'>
        <div className="w-full h-full">
          <div className="h-full flex flex-col lg:flex-row max-w-7xl m-0 gap-4 w-full">
            {/* Chat Section - Center with max width */}
            <div className="w-full h-full lg:flex-1 space-y-0 flex flex-col">
              {/* Oracle mobile header tab */}
              <div className="lg:hidden fixed top-0 left-0 right-0 z-10">
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
                      <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-blue-500/30 shrink-0">
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
                        onClick={() => setMarketInfoOpen(true)}
                        className="lg:hidden text-white hover:text-white shrink-0 bg-blue-600 hover:bg-blue-700! h-8 sm:h-9 px-2 sm:px-3 cursor-pointer"
                      >
                        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="ml-1.5 hidden sm:inline text-xs sm:text-sm">
                          Info
                        </span>
                      </Button>
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
                            className="absolute bottom-0 h-0.5 dark:bg-white bg-black w-full"
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
                        <Button variant="ghost" onClick={handleBack}>
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-blue-500/30 shrink-0">
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
                          onClick={() => setMarketInfoOpen(true)}
                          className="text-white hover:text-white shrink-0 bg-blue-600 hover:bg-blue-700! h-8 sm:h-9 px-2 sm:px-3 cursor-pointer"
                        >
                          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
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
                                      className={`max-w-[65%] sm:max-w-[75%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg ${message.sender === 'user'
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
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-border shrink-0">
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
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90 h-7 px-3 text-xs shrink-0 cursor-pointer"
                                      >
                                        <Crown className="w-3 h-3 mr-1" />
                                        Upgrade
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          <div className="flex gap-1.5 sm:gap-2">
                            <div
                              className="flex-1 flex items-center gap-2 bg-muted/50 backdrop-blur-md border border-border rounded-full px-6 h-14 sm:h-16 cursor-pointer relative"
                            >
                              {/* Input Field */}
                              {!user ? (
                                <span className="flex-1 text-muted-foreground text-sm">
                                  Sign in to chat
                                </span>
                              ) : (
                                <TextareaAutosize
                                  value={input}
                                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
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
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group shrink-0 shadow-sm cursor-pointer hover:scale-105"
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

            {/* Market */}
            <div className="hidden lg:block w-full h-full lg:w-80">
              <Card
                className="border-border overflow-hidden mb-3"
                style={{
                  height: '100vh',
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
            </div>
          </div>
        </div>
      </div>

      {/* Betting Modal */}
      <MarketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={market.question}
        choice={selectedChoice}
        marketId={marketId}
        onConfirm={() => setModalOpen(false)}
        onBetPlaced={handleBetPlaced}
      />

      <MarketInfoModal
        open={marketInfoOpen}
        onOpenChange={setMarketInfoOpen}
        market={market}
        handleBetClick={handleBetClick}
        fetchMarket={fetchMarket}
      />

      {/* Disclaimer Dialog */}
      <DisclaimerDialog
        open={disclaimerDialogOpen}
        onOpenChange={setDisclaimerDialogOpen}
      />

      <SubscriptionManagementDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        isUserPro={user?.isPro}
      />

      <DailyLimitReachDialog
        open={limitReachedDialogOpen}
        onChange={setLimitReachedDialogOpen}
        setSubscriptionDialogOpen={setSubscriptionDialogOpen}
      />
    </div>
  );
}
