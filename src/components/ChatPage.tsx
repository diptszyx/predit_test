import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Loader2,
  Lock,
  MessageSquare,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Share2,
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
import { Sidebar } from './Sidebar';
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

import { toast } from 'sonner';
import apiClient from '../lib/axios';
import type { User } from '../lib/types';
import { ChatMessage, messageService } from '../services/message.service';
import { OracleEntity, oraclesServices } from '../services/oracles.service';
import useAuthStore from '../store/auth.store';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
import { News, newsService } from '../services/news.service';
import { timeAgo } from '../lib/date';
import clsx from 'clsx';

interface AIAgent {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  category: string;
  rating: string;
  likes: string;
  consultSessions?: string;
  specialty: string;
  tags: string[];
  avatar: string;
  bgColor: string;
  level?: number;
  tier?: 'free' | 'premium' | 'elite';
}

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

export function ChatPage({
  aiAgent,
  onBack,
  darkMode,
  setDarkMode,
  onBetClick,
  user,
  onOpenWalletDialog,
  onNavigate,
  totalQuestionsAsked = 0,
  onQuestionAsked,
  userCreatedMarkets = [],
  onAddMarket,
  currentPage = 'chat',
  onWalletDisconnect,
  shortenAddress,
  updateUser,
  awardXPToUser,
  trackQuestProgress,
  onArticleClick,
  onOpenSettings,
  onSetPendingNavigation,
  articleContext,
  onArticleContextUsed,
  onOpenXPInfo,
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
  const [deletedArticleIds, setDeletedArticleIds] = useState<Set<string>>(
    new Set()
  );
  const [articleCounter, setArticleCounter] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationContextRef = useRef<string[]>([]);
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
  const [shareFlashing, setShareFlashing] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<{
    question: string;
    answer: string;
  } | null>(null);

  // Disclaimer dialog
  const [disclaimerDialogOpen, setDisclaimerDialogOpen] = useState(false);
  const [shareAIAgentDialogOpen, setShareAIAgentDialogOpen] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(
    generateSuggestedQuestions(aiAgent, '')
  );

  // Rating flash functionality
  const [ratingFlashing, setRatingFlashing] = useState(false);
  const [currentTab, setCurrentTab] = useState<'chat' | 'hotTakes'>('chat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        setIsLoadingNews(true);
        const newsList = await newsService.getNewsList(
          '1e557572-aaa8-4cab-8af6-d86f65613f19'
        );
        setNewsArticles(newsList);
      } catch {
      } finally {
        setIsLoadingNews(false);
      }
    })();
  }, [aiAgent.id]);

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

  // Helper function to detect if a message is asking for a prediction
  function isPredictionQuestion(message: string): boolean {
    const predictionKeywords = [
      // Direct prediction words
      'will',
      'predict',
      'prediction',
      'forecast',
      'future',
      'what happens',
      'what will happen',
      'gonna happen',
      'chance',
      'likelihood',
      'probability',
      'odds',
      'expect',
      'anticipate',
      'foresee',
      'outlook',
      'trend',
      'estimate',
      'projection',
      'gonna',
      'going to',
      'happen',
      'come true',
      'think will',

      // Time-based future indicators
      'tomorrow',
      'next week',
      'next month',
      'next year',
      'in 2025',
      'in 2026',
      'in 2027',
      'this year',
      'next',
      'upcoming',
      'soon',
      'later',
      'eventually',
      'by the end',

      // Question patterns about future
      'what will',
      'where will',
      'when will',
      'who will',
      'how will',
      'what is going to',
      'what do you think',
      'what are the chances',
      'what is the',
      'what price',
      'how much will',
      'how high',
      'how low',
      'could it',
      'might it',
    ];

    const lowerMessage = message.toLowerCase();
    return predictionKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  // Helper function to check and reset daily predictions
  function checkDailyPredictionLimit(): {
    allowed: boolean;
    remaining: number;
  } {
    // Premium users have unlimited predictions
    if (user?.subscriptionTier === 'master') {
      return { allowed: true, remaining: -1 }; // -1 means unlimited
    }

    // Free users get 5 predictions per day
    const DAILY_LIMIT = 5;
    const today = new Date().toDateString();
    const lastResetDate = user?.dailyPredictionsResetDate;
    const dailyUsed = user?.dailyPredictionsUsed || 0;

    // Reset if it's a new day
    if (lastResetDate !== today) {
      if (updateUser) {
        updateUser({
          dailyPredictionsUsed: 0,
          dailyPredictionsResetDate: today,
        });
      }
      return { allowed: true, remaining: DAILY_LIMIT - 1 };
    }

    // Check if limit reached
    if (dailyUsed >= DAILY_LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: DAILY_LIMIT - dailyUsed - 1 };
  }

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

  // Helper function to count lines in text
  function countLines(text: string): number {
    // Split by newlines and count non-empty lines
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    return Math.max(1, lines.length); // At minimum, count as 1 line
  }

  // Helper function to check and reset daily line limit
  function checkDailyLineLimit(messageText: string): {
    allowed: boolean;
    remaining: number;
    linesInMessage: number;
  } {
    // Premium users have unlimited lines
    if (user?.subscriptionTier === 'master') {
      return { allowed: true, remaining: -1, linesInMessage: 0 }; // -1 means unlimited
    }

    // Free users get 100 lines per day
    const DAILY_LINE_LIMIT = 100;
    const today = new Date().toDateString();
    const lastResetDate = user?.dailyLinesResetDate;
    const dailyUsed = user?.dailyLinesUsed || 0;

    // Count lines in the current message
    const linesInMessage = countLines(messageText);

    // Reset if it's a new day
    if (lastResetDate !== today) {
      if (updateUser) {
        updateUser({
          dailyLinesUsed: 0,
          dailyLinesResetDate: today,
        });
      }
      // Check if this message would exceed the limit
      if (linesInMessage > DAILY_LINE_LIMIT) {
        return { allowed: false, remaining: 0, linesInMessage };
      }
      return {
        allowed: true,
        remaining: DAILY_LINE_LIMIT - linesInMessage,
        linesInMessage,
      };
    }

    // Check if limit would be exceeded with this message
    if (dailyUsed + linesInMessage > DAILY_LINE_LIMIT) {
      return {
        allowed: false,
        remaining: DAILY_LINE_LIMIT - dailyUsed,
        linesInMessage,
      };
    }

    return {
      allowed: true,
      remaining: DAILY_LINE_LIMIT - dailyUsed - linesInMessage,
      linesInMessage,
    };
  }

  // Increment daily line count
  function incrementDailyLines(linesCount: number) {
    if (user && updateUser && user.subscriptionTier !== 'master') {
      const today = new Date().toDateString();
      const currentUsed = user.dailyLinesUsed || 0;
      updateUser({
        dailyLinesUsed: currentUsed + linesCount,
        dailyLinesResetDate: today,
      });
    }
  }

  // Generate welcome message based on AI agent
  function getWelcomeMessage(aiAgent: AIAgent): string {
    const welcomeMessages: { [key: string]: string } = {
      fortune:
        '🔮 *peers into snow globe intensely* Ah, another soul seeking answers from the cosmic depths! Welcome, traveler. I sense you have questions... probably about Tuesdays. Everyone always has questions about Tuesdays. What mysteries shall we unravel today?',
      crypto:
        "₿ GM! *checks 47 different charts simultaneously* Welcome to the blockchain prophecy zone! The vibes are telling me you're here for some alpha. Whether it's Bitcoin, altcoins, or the next 100x, Satoshi's Heir is ready. Remember: WAGMI, but also DYOR. What predictions do you seek, anon?",
      politics:
        "🎭 *adjusts monocle and checks Twitter drama* Ah, a fellow connoisseur of political chaos! Welcome to the scandal detection chamber. I can already sense the drama in the air today. What political prophecies shall I divine for you? Elections? Policy drama? Who's switching parties this week?",
      'meme-coins':
        "🐸 *scrolls through Telegram at light speed* Yo yo yo! The Degen Queen has entered the chat! Ready to find the next PEPE? The next SHIB? The next whatever-animal-coin-goes-100x-this-week? Buckle up, anon - we're going full degen mode. Let's find that moonshot! 🚀",
    };
    return (
      welcomeMessages[aiAgent.id] ||
      `${aiAgent.emoji} Welcome! I'm ${aiAgent.name}, ${aiAgent.title}. ${aiAgent.description} What would you like to know?`
    );
  }

  // Mock Grok API call with personality-driven responses
  async function sendToGrokAPI(
    userMessage: string,
    aiAgent: AIAgent
  ): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 1000)
    );

    // Generate contextual funny responses based on AI agent personality
    const responses = getAIAgentResponses(
      aiAgent.id,
      userMessage.toLowerCase()
    );
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    return randomResponse;
  }

  // AI agent-specific response generator
  function getAIAgentResponses(
    aiAgentId: string,
    userMessage: string
  ): string[] {
    // Crystal Ball Carl (fortune) responses
    if (aiAgentId === 'fortune') {
      if (
        userMessage.includes('future') ||
        userMessage.includes('what will happen')
      ) {
        return [
          "🔮 *shakes snow globe vigorously* Ah yes, I see it now... the future is cloudy with a chance of... wait, that's just the glitter settling. But seriously, I'm seeing a Tuesday in your near future. Possibly even a Wednesday. Trust the process.",
          "🔮 The mystical orb reveals... *squints* ...that you should probably drink more water. Also, I'm getting strong vibes that something will happen. Or maybe it won't. The cosmos is being cryptic today.",
          "🔮 *gazes deeply into the snow globe* I foresee... a decision you'll need to make. It could go either way. My advice? Trust the cat. There's always a cat involved somehow.",
        ];
      } else if (
        userMessage.includes('love') ||
        userMessage.includes('relationship')
      ) {
        return [
          "🔮 Ah, matters of the heart! *snow globe intensifies* The cosmic forces suggest that your love life will involve... a person. Possibly multiple persons if you're ambitious. Beware of anyone who doesn't like pizza though. That's a red flag from the universe.",
          "🔮 *mystic humming* I see romance in your future! It may involve awkward first dates, questionable text messages, or someone who quotes The Office too much. The stars are pointing towards... compatibility? Or maybe that's just Jupiter being dramatic again.",
          "🔮 The orb of destiny speaks! Your romantic future involves either great happiness or valuable life lessons. Possibly both. My mystical advice: don't ghost people, the karma is real (I checked).",
        ];
      } else if (
        userMessage.includes('money') ||
        userMessage.includes('rich') ||
        userMessage.includes('lottery')
      ) {
        return [
          "🔮 *snow globe swirls mysteriously* Financial fortunes, eh? I'm seeing... numbers. Lots of numbers. Some go up, some go down. My cosmic tip: maybe don't bet it all on that 'guaranteed' crypto your cousin mentioned.",
          "🔮 The universe reveals that money flows to those who... *checks notes* ...work for it. I know, I was hoping for something more mystical too. But hey, I also see a potential windfall! Could be $5, could be $5,000. The cosmos doesn't do specifics.",
          '🔮 *peers into the depths* Your financial future is tied to Tuesdays. I keep telling everyone about Tuesdays but nobody listens. Also, avoid pyramid schemes shaped like actual pyramids. The irony is too obvious.',
        ];
      }
      return [
        "🔮 *concentrates on snow globe* The answer you seek is within... or maybe it's outside. Spatial relationships are confusing in the mystical realm. But I'm 73% certain that things will happen, and you'll be there when they do!",
        '🔮 Interesting question! The cosmic forces are telling me that the answer involves either yes, no, or maybe. Possibly all three simultaneously. Quantum mysticism is wild like that.',
        "🔮 *mystical whispers* I'm receiving a message from beyond... it says 'error 404, prophecy not found.' Just kidding! The actual message is: trust your gut, but also maybe Google it just to be safe.",
      ];
    }

    // Crypto Cassandra responses
    if (aiAgentId === 'crypto') {
      if (userMessage.includes('bitcoin') || userMessage.includes('btc')) {
        return [
          "₿ *studies charts intensely* Bitcoin to $100K? $1M? Yes. When? Eventually. This is the way. My TA suggests we're in a definite pattern that will either go up, down, or sideways. Diamond hands, anon! 💎🙌",
          "₿ Ah, the king of crypto! Look, BTC is like that friend who shows up late to everything but somehow makes it worth it. We're still early (we're always early). Just stack sats and trust the 4-year cycle. Not financial advice tho! 🚀",
          "₿ Bitcoin? *50 charts appear* This is either the best or worst time to buy, depending on when you ask me. The blockchain doesn't lie, but it also doesn't give clear signals. HODL and pray to Satoshi. WAGMI! 📈",
        ];
      } else if (
        userMessage.includes('shitcoin') ||
        userMessage.includes('altcoin') ||
        userMessage.includes('meme')
      ) {
        return [
          "₿ *sniffs the air* I smell a potential rug pull from 100 blocks away! But also... imagine if this one actually moons? Do your own research means 'yes, buy a small bag and prepare for chaos.' The degen life chose us. 🎲",
          "₿ Meme coins? Those are my specialty! Look, I can't predict which dog/cat/food-themed token will 100x next, but I CAN tell you that you'll definitely check the chart 487 times today. It's basically financial astrology. Love it. 🐕🚀",
          "₿ Shitcoins are like lottery tickets but with better memes. My prediction: 98% will go to zero, but that 2%... *chef's kiss*. Just remember, it's not a loss until you sell! (Copium levels: maximum) 😅",
        ];
      }
      return [
        "₿ *checks 73 different Discord servers* The alpha is out there, anon. My sources (vibes) tell me we're either at the start of a mega pump or right before a face-melting dump. Time in the market beats timing the market! (I think) 📊",
        "₿ GM! Another day of crabbing sideways? My TA suggests this could break out... eventually. In the meantime, stake your coins, touch grass, and remember: we're still early! Probably. Maybe. WAGMI or NGMI, no in-between! 🦀",
        "₿ *analyzes on-chain metrics* The smart money is moving, but so are the dumb money, the medium money, and that weird money that nobody understands. My prediction: volatility incoming! Which means up, down, or stable. You're welcome! 📈📉",
      ];
    }

    // The Degen Queen (meme-coins) responses
    if (aiAgentId === 'meme-coins') {
      if (userMessage.includes('doge') || userMessage.includes('dogecoin')) {
        return [
          "🐸 *checks Elon's tweets obsessively* DOGE is the OG meme coin, the people's crypto! Will it hit $1? Maybe when Elon colonizes Mars and accepts DOGE as payment. Until then, much wow, very moon! 🐕🚀",
          "🐸 Dogecoin: started as a joke, became a movement, stayed a meme. It's basically the internet's favorite currency. My prediction? It'll pump whenever you least expect it. That's the DOGE way! 💎",
          '🐸 The original degen play! DOGE has survived every crypto winter and still has the best community. Do Only Good Everyday, but also buy the dips. Not financial advice, just vibes! 🌙',
        ];
      } else if (
        userMessage.includes('shib') ||
        userMessage.includes('shiba')
      ) {
        return [
          '🐸 *army of Shiba Inus appears* SHIB! The DOGE killer that became its own legend. Will burning tokens make it moon? Will Shibarium change everything? Will we all get Lambos? Probably not, but the memes are top tier! 🔥',
          "🐸 Shiba Inu: when one dog coin wasn't enough. The community is passionate, the supply is... let's say 'abundant,' and the dream is alive! Just remember: always DYOR before aping in! 🐕",
          "🐸 SHIB to $0.01? *does math on infinity supply* ...yeah, that's gonna need a LOT of burning. But hey, crazier things have happened in crypto! The meme must flow! 🚀",
        ];
      } else if (userMessage.includes('pepe') || userMessage.includes('frog')) {
        return [
          "🐸 *rare Pepe collection intensifies* PEPE, the ultimate meme coin! It's literally a frog, like me! Will it 100x? Will it rug? Who knows! That's the beauty of meme coins - pure, unfiltered chaos and community vibes! 🐸💚",
          '🐸 Meme coins are the purest form of crypto. No utility promises, no fake roadmaps, just vibes and community. PEPE represents this perfectly. Buy the meme, become the meme! 🎭',
          "🐸 When normie coins are boring you with 'fundamentals' and 'use cases,' meme coins are out here making millionaires through sheer willpower and Telegram raids. PEPE is the way! 🌊",
        ];
      }
      return [
        '🐸 *scans 500 Telegram channels* The next 100x is out there, anon. Could be a cat, could be a dog, could be a literal potato. Meme coin season is always one tweet away! Stay degen, stay ready! 💎🙌',
        "🐸 GM fellow degens! Remember: in meme coins, community is EVERYTHING. No community? It's a rug waiting to happen. Strong community? That's your ticket to Valhalla! WAGMI! 🚀",
        "🐸 *checks CT and Reddit simultaneously* My meme coin prediction model is simple: if it makes you laugh AND has good liquidity, it might be the one. If it's being shilled by 100 new accounts, RUN! Trust the vibes! 🎲",
      ];
    }

    // Default responses for other AI agents
    return [
      `${
        aiAgent.emoji
      } *channels cosmic energy* Interesting question! My ${aiAgent.specialty.toLowerCase()} powers are tingling. Based on my extensive research (and vibes), I predict that things will definitely happen. The exact details are still materializing in the prediction realm!`,
      `${aiAgent.emoji} Ooh, spicy topic! Let me consult my sources... *shuffles imaginary cards* ...and by sources I mean my incredibly tuned intuition and this lucky coin. My ${aiAgent.rating} rated prediction: expect the unexpected, but also the expected. Balance!`,
      `${aiAgent.emoji} *activates ${aiAgent.specialty} mode* You've come to the right AI agent! My analysis suggests a 73% chance of something interesting, a 25% chance of something boring, and a 2% chance of something absolutely wild. The math might not add up but neither does reality anymore! 🎲`,
    ];
  }

  // Generate suggested follow-up questions based on AI agent specialty
  function generateSuggestedQuestions(
    aiAgentData: OracleEntity,
    userMessage: string
  ): string[] {
    const questionsByAIAgent: Record<string, string[][]> = {
      crypto: [
        [
          "What's your Bitcoin price prediction for 2026?",
          'Which altcoins are undervalued right now?',
          'Will we see another crypto winter?',
        ],
        [
          'How will regulation affect crypto markets?',
          "What's the next big trend in DeFi?",
          'Should I hold or sell my crypto?',
        ],
        [
          'Which Layer 2 solutions will dominate?',
          "What do you think about Ethereum's future?",
          'Are meme coins still worth it?',
        ],
      ],
      'meme-coins': [
        [
          "What's the next 100x meme coin?",
          'Is PEPE still a good investment?',
          'How do you spot early meme coins?',
        ],
        [
          'Will DOGE hit $1 in 2026?',
          'What makes a meme coin successful?',
          'Which meme coin communities are strongest?',
        ],
        [
          'Are meme coins dead or thriving?',
          'How to avoid rug pulls?',
          'Best strategy for meme coin trading?',
        ],
      ],
      'crypto-crystal': [
        [
          "What's your Bitcoin price prediction for 2026?",
          'Which altcoins are undervalued right now?',
          'Will we see another crypto winter?',
        ],
        [
          'How will regulation affect crypto markets?',
          "What's the next big trend in DeFi?",
          'Which Layer 2 solutions will dominate?',
        ],
        [
          "What do you think about Ethereum's future?",
          'Are NFTs coming back?',
          'Best strategy for crypto investing?',
        ],
      ],
      sports: [
        [
          'Who will win the championship?',
          'Which team is most underrated?',
          "What's your boldest sports prediction?",
        ],
        [
          'Will there be any major upsets?',
          'Which player will break out?',
          'What trends are shaping the sport?',
        ],
        [
          'Who are the top contenders?',
          'Any dark horse teams to watch?',
          "What's the biggest storyline?",
        ],
      ],
      entertainment: [
        [
          "What's the next big entertainment trend?",
          'Which shows will dominate?',
          "Who's the breakout star of 2026?",
        ],
        [
          'Will streaming wars intensify?',
          'What movies will be blockbusters?',
          'Which celebrities are rising?',
        ],
        [
          "What's the future of entertainment?",
          'Any surprise hits coming?',
          'Which franchises will succeed?',
        ],
      ],
      tech: [
        [
          "What's the next big tech breakthrough?",
          'Will AI transform everything?',
          'Which tech stocks look good?',
        ],
        [
          'What are the hottest tech trends?',
          'Is the tech bubble real?',
          'Which startups will succeed?',
        ],
        [
          'How will quantum computing evolve?',
          "What's next for social media?",
          'Will VR/AR finally take off?',
        ],
      ],
      fundamental: [
        [
          'Which stocks are undervalued now?',
          'What sectors will outperform?',
          'Is the market overvalued?',
        ],
        [
          'Best value stocks for 2026?',
          'How to identify quality companies?',
          "What's your market outlook?",
        ],
        [
          'Which industries have strong moats?',
          'Best dividend stocks?',
          'How to analyze cash flow?',
        ],
      ],
      fortune: [
        [
          'What does my financial future hold?',
          'Will I have good luck soon?',
          'What opportunities should I watch for?',
        ],
        [
          'How can I improve my fortune?',
          "What's blocking my success?",
          'When will things turn around?',
        ],
        [
          'Should I take a big risk?',
          'What does the universe say?',
          'Any warnings for me?',
        ],
      ],
    };

    const agentKeys = [aiAgentData.id, 'crypto-crystal', 'crypto'];
    const selectedAgentKey =
      agentKeys[Math.floor(Math.random() * agentKeys.length)];

    // Get questions for this AI agent or use defaults
    const aiAgentQuestions = questionsByAIAgent[selectedAgentKey] || [
      [
        `What's your prediction for ${aiAgentData.type.split(' ')[0]}?`,
        `What trends do you see in ${aiAgentData.type.split(' ')[0]}?`,
        `What should I know about ${aiAgentData.type.split(' ')[0]}?`,
      ],
      [
        `Any bold predictions for this year?`,
        `What's your hot take?`,
        `What are you most excited about?`,
      ],
      [
        `What's the biggest risk right now?`,
        `What's being overlooked?`,
        `What should people pay attention to?`,
      ],
    ];

    // Randomly select one set of 3 questions
    const randomSet =
      aiAgentQuestions[Math.floor(Math.random() * aiAgentQuestions.length)];
    return randomSet;
  }

  const handleArticleClick = async (articleId: string) => {
    const data = await newsService.getNewsDetail(articleId);

    if (onArticleClick) {
      onArticleClick(data);
    }
  };

  const handleSend = async (messageToSend?: string) => {
    const messageText = messageToSend || input.trim();
    if (!messageText || isLoading) return;

    const trimmedInput = messageText;
    const isPrediction = isPredictionQuestion(trimmedInput);

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

    setSuggestedQuestions(generateSuggestedQuestions(aiAgent, trimmedInput));

    try {
      // const response = await sendToGrokAPI(trimmedInput, aiAgent);
      const data = await messageService.sendMessage(trimmedInput, aiAgent.id);
      if (data) {
        setMessages((prev) => [...prev, data.assistantMessage]);
        fetchUser();
        onReloadAiAgent?.(aiAgent.id);
        if (data.xpReward.milestone) {
          toast.success(
            `🎯 Prediction Milestone Reached! +${data.xpReward.milestone?.xp} XP earned.`
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  function formatTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }

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
          ? 'flex h-screen bg-background overflow-hidden'
          : 'min-h-screen bg-background'
      }
    >
      {/* Sidebar */}
      {onNavigate &&
        shortenAddress &&
        onWalletDisconnect &&
        onOpenWalletDialog && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => {
              if (page === 'oracles') {
                onBack();
              } else {
                onNavigate(page);
              }
            }}
            user={user}
            onOpenWalletDialog={onOpenWalletDialog}
            onWalletDisconnect={onWalletDisconnect}
            shortenAddress={shortenAddress}
            onOpenSettings={onOpenSettings}
            onSetPendingNavigation={onSetPendingNavigation}
            onOpenXPInfo={onOpenXPInfo}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        )}

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
          <div className="h-full flex flex-col lg:flex-row max-w-7xl m-[0px] gap-4">
            {/* Chat Section - Center with max width */}
            <div className="w-full h-full lg:max-w-3xl space-y-0 flex flex-col">
              {/* Welcome Intro Section - Only show on first load */}
              {/* {messages.length === 1 && (
                <div className="mb-8"> */}
              {/* Call to Action */}
              {/* <div className="py-8">
                    <h2 className="text-2xl sm:text-3xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 pb-1">
                      Gain the Edge with Our Elite AI Agents
                    </h2> */}

              {/* Features Grid */}
              {/* <div className="grid gap-4 mb-6"> */}
              {/* Feature 1 */}
              {/* <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h3 className="text-base sm:text-lg mb-2">
                          ✨ Specialized Expertise for Pinpoint Accuracy
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Fine-tuned on niche data for stocks, cryptos,
                          politics, sports, and more—delivering spot-on
                          predictions that crush the competition.
                        </p>
                      </div> */}

              {/* Feature 2 */}
              {/* <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h3 className="text-base sm:text-lg mb-2">
                          🚀 Supercharge Your Bets and Investments
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Spot trends, minimize risks, and maximize wins with
                          actionable insights tailored just for you.
                        </p>
                      </div>
                    </div>

                    <p className="text-base sm:text-lg text-foreground">
                      Ready to win? Ask our AI for a prediction right now
                    </p>
                  </div>
                </div>
              )} */}
              {/* Oracle mobile header tab */}
              <Card
                className={clsx(
                  'border-border bg-background/80 backdrop-blur-md md:hidden fixed bottom-0 left-0 right-0 z-[9999]!'
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
                  <div
                    className={clsx(
                      'flex-1 p-2 py-4 sm:p-3 flex items-center justify-center border-r text-base font-medium',
                      {
                        '': currentTab === 'chat',
                        'opacity-50 cursor-pointer hover:opacity-80':
                          currentTab !== 'chat',
                      }
                    )}
                    onClick={() => {
                      setCurrentTab('chat');
                    }}
                  >
                    <p>Chat</p>
                  </div>
                  <div
                    className={clsx(
                      'flex-1 p-2 py-4 sm:p-3 flex items-center justify-center text-base font-medium',
                      {
                        '': currentTab === 'hotTakes',
                        'opacity-50 cursor-pointer hover:opacity-80':
                          currentTab !== 'hotTakes',
                      }
                    )}
                    onClick={() => {
                      setCurrentTab('hotTakes');
                    }}
                  >
                    <p>Hot Takes</p>
                  </div>
                </CardContent>
              </Card>
              {currentTab === 'chat' && (
                <>
                  {/* Oracle Header - Above conversation box */}
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
                        padding: '16px 8px'
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
                          // onClick={() => setShareOracleDialogOpen(true)}
                          className="text-white hover:text-white flex-shrink-0 bg-blue-600 hover:bg-blue-700 h-8 sm:h-9 px-2 sm:px-3 cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="ml-1.5 hidden sm:inline text-xs sm:text-sm">
                            Share
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chat Container with Background */}
                  <div className="relative sm:h-[calc(100vh-16rem)] flex-1 overflow-hidden mb-14 md:mb-0!">
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
                            {messages.map((message, index) => (
                              <div key={message.id}>
                                <div
                                  className={`flex ${
                                    message.sender === 'user'
                                      ? 'justify-end'
                                      : 'justify-start'
                                  }`}
                                >
                                  <div
                                    className={`max-w-[85%] sm:max-w-[75%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg ${
                                      message.sender === 'user'
                                        ? 'bg-blue-600 text-white backdrop-blur-sm'
                                        : `backdrop-blur-md border border-border`
                                    }`}
                                  >
                                    {/* Article Attachment Thumbnail */}
                                    {/* {message.articleAttachment && (
                                  <div className="mb-2 rounded-lg overflow-hidden border border-border">
                                    <div className="aspect-video relative bg-muted/20">
                                      <ImageWithFallback
                                        src={message.articleAttachment.image || ''}
                                        alt={message.articleAttachment.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="p-2 bg-muted/30">
                                      <p className="text-xs line-clamp-2">{message.articleAttachment.title}</p>
                                      <p className="text-xs text-muted-foreground mt-1">{message.articleAttachment.source}</p>
                                    </div>
                                  </div>
                                )} */}

                                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                      {message.content}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs mt-2 block text-muted-foreground ${
                                    message.sender === 'user'
                                      ? 'text-right'
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
                            ))}
                            {isLoading && (
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
                                      {aiAgent.name} is typing...
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
                                        {user.restTodayPredictionCount}/5
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
                              className="flex-1 flex items-center gap-2 bg-muted/50 backdrop-blur-md border border-border rounded-full px-6 h-14 sm:h-11 cursor-pointer relative"
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
                                <input
                                  type="text"
                                  value={input}
                                  onChange={(e) => setInput(e.target.value)}
                                  onKeyPress={handleKeyPress}
                                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-[16px] sm:text-sm"
                                  placeholder="I want a prediction on..."
                                  disabled={isLoading}
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
                                    className="w-5 h-5 mx-auto text-blue-500 transition-transform duration-150 group-hover:translate-x-2"
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
                            className="text-blue-400 hover:text-blue-300 underline transition-colors"
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
                <div className="md:hidden w-full space-y-3 pb-14">

                  {/* Hot Takes Section */}
                  <Card className="border-border">
                    <CardHeader className="border-b border-border pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="w-4 h-4" />
                        <span>Hot Takes</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Latest insights from {aiAgent.name}
                      </p>
                    </CardHeader>
                    <div
                      className="h-full"
                      style={{ overflow: 'auto' }}
                    >
                      <div className="p-3 space-y-3">
                        {isLoadingNews ? (
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
                        ) : newsArticles.length > 0 ? (
                          newsArticles.map((article) => (
                            <Card
                              key={article.id}
                              className="overflow-hidden hover:shadow-md transition-all duration-300 group relative cursor-pointer"
                              onClick={() => handleArticleClick(article.id)}
                            >
                              <div className="relative h-32 overflow-hidden">
                                <ImageWithFallback
                                  src={article.image}
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-1 right-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs h-4 px-1.5"
                                  >
                                    {article.relevance}
                                  </Badge>
                                </div>
                              </div>
                              <CardContent className="p-2">
                                <h4 className="text-xs mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                                  {article.title}
                                </h4>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                  <span className="truncate text-xs flex items-center gap-1">
                                    {article.oracle.name}
                                  </span>
                                  <span className="text-xs">
                                    {timeAgo(article.createdAt)}
                                  </span>
                                </div>
                                {/* <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {article.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {article.comments || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                {article.shares || 0}
                              </span>
                            </div> */}
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                            <p className="text-xs text-muted-foreground">
                              No hot takes available
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
            {/* News Feed - Right - Hidden on mobile */}
            <div className="hidden lg:block w-full h-full lg:w-80 space-y-3 pt-2">
              {/* AI Agent Profile Card */}
              <Card className="border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <ImageWithFallback
                        src={aiAgent.image}
                        alt={aiAgent.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate mb-0.5">{aiAgent.name}</h3>
                      <p className="text-xs text-blue-400 mb-2">
                        {aiAgent.type}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {aiAgent.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 py-3 border-t border-b border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-sm">
                          {Number(aiAgent.rating).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm">{aiAgent.predictions}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Predictions
                      </p>
                    </div>
                  </div>

                  {/* Rate section */}
                  <div
                    className={`mt-4 p-3 rounded-lg bg-muted/30 transition-all ${
                      ratingFlashing ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-2">
                      Rate this AI Agent
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className="transition-opacity hover:opacity-70"
                        >
                          <Star
                            className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer ${
                              star <= userRating!
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {userRating! > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        You rated {Math.round(userRating!)}/5
                      </p>
                    )}
                  </div>

                  {/* Like Button */}
                  <Button
                    variant="outline"
                    className={`w-full mt-3 h-9 transition-all cursor-pointer ${
                      hasLiked
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50'
                    }`}
                    onClick={handleLike}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 mr-2 ${
                        hasLiked ? 'fill-current' : ''
                      }`}
                    />
                    {hasLiked ? 'Liked' : 'Like'} • {formatLikes(localLikes)}
                  </Button>
                </CardContent>
              </Card>

              {/* Hot Takes Section */}
              <Card
                className="border-border overflow-hidden"
                style={{
                  height: 'calc(100vh - 25rem)',
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
                <div
                  className="h-full"
                  style={{ overflow: 'auto' }}
                >
                  <div className="p-3 space-y-3">
                    {isLoadingNews ? (
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
                    ) : newsArticles.length > 0 ? (
                      newsArticles.map((article) => (
                        <Card
                          key={article.id}
                          className="overflow-hidden hover:shadow-md transition-all duration-300 group relative cursor-pointer"
                          onClick={() => handleArticleClick(article.id)}
                        >
                          <div className="relative h-20 overflow-hidden">
                            <ImageWithFallback
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-1 right-1">
                              <Badge
                                variant="secondary"
                                className="text-xs h-4 px-1.5"
                              >
                                {article.relevance}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-2">
                            <h4 className="text-xs mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                              {article.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                              <span className="truncate text-xs flex items-center gap-1">
                                {article.oracle.name}
                              </span>
                              <span className="text-xs">
                                {timeAgo(article.createdAt)}
                              </span>
                            </div>
                            {/* <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {article.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {article.comments || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                {article.shares || 0}
                              </span>
                            </div> */}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-xs text-muted-foreground">
                          No hot takes available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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

        {/* Daily Limit Reached Dialog */}
        <AlertDialog
          open={limitReachedDialogOpen}
          onOpenChange={setLimitReachedDialogOpen}
        >
          <AlertDialogContent className="max-w-md sm:mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                Daily Limit Reached
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  {limitReachedType === 'textline' ? (
                    <>
                      <p className="text-sm">
                        You've used all <strong>100 free text lines</strong> for
                        today. Your limit resets tomorrow!
                      </p>
                      <div className="p-3 sm:p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-orange-400" />
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            Current Usage
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Free tier: 100 text lines per day
                        </p>
                        <div className="w-full bg-black/30 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <p className="text-xs text-orange-400 mt-1 text-center">
                          100/100 lines used
                        </p>
                      </div>
                    </>
                  ) : limitReachedType === 'total-predictions' ? (
                    <>
                      <p className="text-sm">
                        You've used all <strong>5 free predictions</strong> on
                        the Basic tier. Upgrade to Pro to continue making
                        unlimited predictions!
                      </p>
                      <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            Free Tier Limit Reached
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Basic tier: 5 total predictions
                        </p>
                        <div className="w-full bg-black/30 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <p className="text-xs text-blue-400 mt-1 text-center">
                          5/5 predictions used
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">
                        You've used all <strong>5 free predictions</strong> for
                        today. Your limit resets tomorrow!
                      </p>
                      <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            Current Usage
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Free tier: 5 predictions per day
                        </p>
                        <div className="w-full bg-black/30 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <p className="text-xs text-blue-400 mt-1 text-center">
                          5/5 predictions used
                        </p>
                      </div>
                    </>
                  )}

                  <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        Upgrade to Pro
                      </p>
                    </div>
                    <ul className="text-xs sm:text-sm space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>
                          <strong>Unlimited</strong> predictions
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>
                          <strong>2x XP</strong> multiplier on all actions
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>
                          <strong className="text-yellow-400">
                            +1,500 XP bonus
                          </strong>{' '}
                          when you subscribe
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>Priority AI responses</span>
                      </li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-blue-500/20">
                      <p className="text-xs text-center">
                        <span className="line-through text-muted-foreground">
                          $19.99/mo
                        </span>
                        <span className="ml-2 text-base sm:text-lg font-semibold text-blue-400">
                          $4.99/mo
                        </span>
                        <span className="ml-2 text-xs text-green-400">
                          75% OFF
                        </span>
                      </p>
                    </div>
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
                  setLimitReachedDialogOpen(false);
                  setSubscriptionDialogOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90 w-full sm:w-auto"
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Upgrade Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
      </div>
    </div>
  );
}
