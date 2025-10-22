import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft, Send, Sparkles, ExternalLink, Newspaper, X, ThumbsUp, ThumbsDown, Star, Zap, Lock, Crown, Plus, TrendingUp, MessageSquare, Share2, Check } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { PredictionBetCard, getBetsForOracle } from "./PredictionBetCard";
import { UnifiedHeader } from "./UnifiedHeader";
import { SharePredictionDialog } from "./SharePredictionDialog";

import { toast } from "sonner@2.0.3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import type { User } from "../lib/types";

interface Oracle {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  category: string;
  accuracy: string;
  likes: string;
  consultSessions?: string;
  specialty: string;
  tags: string[];
  avatar: string;
  bgColor: string;
  level?: number;
  tier?: 'free' | 'premium' | 'elite';
  house?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isPrediction?: boolean;
}

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  relevance: string;
  image?: string;
}

interface ChatPageProps {
  oracle: Oracle;
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
}

export function ChatPage({ oracle, onBack, darkMode, setDarkMode, onBetClick, user, onOpenWalletDialog, onNavigate, totalQuestionsAsked = 0, onQuestionAsked, userCreatedMarkets = [], onAddMarket, currentPage = "chat", onWalletDisconnect, shortenAddress }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: getWelcomeMessage(oracle),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [deletedArticleIds, setDeletedArticleIds] = useState<Set<string>>(new Set());
  const [articleCounter, setArticleCounter] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationContextRef = useRef<string[]>([]);
  
  // Rating and Like states
  const [userRating, setUserRating] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(() => {
    const likesStr = oracle.likes || '0';
    if (likesStr === '∞') return 999999;
    return parseInt(likesStr.replace('K', '000').replace('M', '000000'));
  });
  const [localAccuracy, setLocalAccuracy] = useState(oracle.accuracy);
  
  // Sign-in and subscription tracking
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string>("");
  const [limitReachedDialogOpen, setLimitReachedDialogOpen] = useState(false);
  const [limitReachedType, setLimitReachedType] = useState<'prediction' | 'textline' | null>(null);
  
  // Share functionality
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareFlashing, setShareFlashing] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<{question: string; answer: string} | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send pending message after user signs in or upgrades subscription
  useEffect(() => {
    const shouldSendPending = 
      pendingMessage && 
      !signInDialogOpen && 
      !subscriptionDialogOpen &&
      (
        // Either just signed in
        (user?.walletAddress && !isLoading) ||
        // Or has a paid subscription
        (user?.subscriptionTier && user?.subscriptionTier !== 'free')
      );

    if (shouldSendPending) {
      // User just signed in or upgraded and we have a pending message
      const sendPendingMessage = async () => {
        // Check if this is a prediction question
        const isPrediction = isPredictionQuestion(pendingMessage);
        console.log('Auto-send message:', pendingMessage);
        console.log('Auto-send is prediction:', isPrediction);
        
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: pendingMessage,
          timestamp: new Date(),
          isPrediction,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput(""); // Clear input
        setPendingMessage(""); // Clear pending message
        setIsLoading(true);

        // Track total questions asked
        if (onQuestionAsked) {
          onQuestionAsked();
        }

        // Increment daily line count for free users (for pending messages)
        if (user?.walletAddress && (!user?.subscriptionTier || user?.subscriptionTier === 'free')) {
          const linesInMessage = countLines(pendingMessage);
          incrementDailyLines(linesInMessage);
        }

        // Fetch relevant news
        fetchRelevantNews(pendingMessage);

        try {
          const response = await sendToGrokAPI(pendingMessage, oracle);
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
            isPrediction,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          
          // If this was a prediction, store it and flash the share button
          if (isPrediction) {
            console.log('✓ PREDICTION DETECTED (pending message)!');
            console.log('Question:', pendingMessage);
            console.log('Answer:', response);
            const predictionData = {
              question: pendingMessage,
              answer: response,
            };
            console.log('Storing prediction data:', predictionData);
            setLastPrediction(predictionData);
            setShareFlashing(true);
            
            // Stop flashing after 3 seconds
            setTimeout(() => {
              setShareFlashing(false);
            }, 3000);
          }
        } catch (error) {
          console.error("Error sending message:", error);
        } finally {
          setIsLoading(false);
        }
      };

      sendPendingMessage();
    }
  }, [user?.walletAddress, user?.subscriptionTier, pendingMessage, signInDialogOpen, subscriptionDialogOpen]);

  // Helper function to detect if a message is asking for a prediction
  function isPredictionQuestion(message: string): boolean {
    const predictionKeywords = [
      // Direct prediction words
      'will', 'predict', 'prediction', 'forecast', 'future',
      'what happens', 'what will happen', 'gonna happen',
      'chance', 'likelihood', 'probability', 'odds',
      'expect', 'anticipate', 'foresee', 'outlook',
      'trend', 'estimate', 'projection', 'gonna',
      'going to', 'happen', 'come true', 'think will',
      
      // Time-based future indicators
      'tomorrow', 'next week', 'next month', 'next year',
      'in 2025', 'in 2026', 'in 2027', 'this year', 'next',
      'upcoming', 'soon', 'later', 'eventually', 'by the end',
      
      // Question patterns about future
      'what will', 'where will', 'when will', 'who will', 'how will',
      'what is going to', 'what do you think',
      'what are the chances', 'what is the', 'what price',
      'how much will', 'how high', 'how low', 'could it', 'might it'
    ];
    
    const lowerMessage = message.toLowerCase();
    return predictionKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Helper function to check and reset daily predictions
  function checkDailyPredictionLimit(): { allowed: boolean; remaining: number } {
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
    if (user && updateUser && user.subscriptionTier !== 'master') {
      const today = new Date().toDateString();
      const currentUsed = user.dailyPredictionsUsed || 0;
      updateUser({
        dailyPredictionsUsed: currentUsed + 1,
        dailyPredictionsResetDate: today,
      });
    }
  }

  // Helper function to count lines in text
  function countLines(text: string): number {
    // Split by newlines and count non-empty lines
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return Math.max(1, lines.length); // At minimum, count as 1 line
  }

  // Helper function to check and reset daily line limit
  function checkDailyLineLimit(messageText: string): { allowed: boolean; remaining: number; linesInMessage: number } {
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
      return { allowed: true, remaining: DAILY_LINE_LIMIT - linesInMessage, linesInMessage };
    }

    // Check if limit would be exceeded with this message
    if (dailyUsed + linesInMessage > DAILY_LINE_LIMIT) {
      return { allowed: false, remaining: DAILY_LINE_LIMIT - dailyUsed, linesInMessage };
    }

    return { allowed: true, remaining: DAILY_LINE_LIMIT - dailyUsed - linesInMessage, linesInMessage };
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

  // Generate welcome message based on oracle
  function getWelcomeMessage(oracle: Oracle): string {
    const welcomeMessages: { [key: string]: string } = {
      fortune: "🔮 *peers into snow globe intensely* Ah, another soul seeking answers from the cosmic depths! Welcome, traveler. I sense you have questions... probably about Tuesdays. Everyone always has questions about Tuesdays. What mysteries shall we unravel today?",
      crypto: "₿ GM! *checks 47 different charts simultaneously* Welcome to the blockchain prophecy zone! The vibes are telling me you're here for some alpha. Whether it's Bitcoin, altcoins, or the next 100x, Satoshi's Heir is ready. Remember: WAGMI, but also DYOR. What predictions do you seek, anon?",
      politics: "🎭 *adjusts monocle and checks Twitter drama* Ah, a fellow connoisseur of political chaos! Welcome to the scandal detection chamber. I can already sense the drama in the air today. What political prophecies shall I divine for you? Elections? Policy drama? Who's switching parties this week?",
      "meme-coins": "🐸 *scrolls through Telegram at light speed* Yo yo yo! The Degen Queen has entered the chat! Ready to find the next PEPE? The next SHIB? The next whatever-animal-coin-goes-100x-this-week? Buckle up, anon - we're going full degen mode. Let's find that moonshot! 🚀",
    };
    return welcomeMessages[oracle.id] || `${oracle.emoji} Welcome! I'm ${oracle.name}, ${oracle.title}. ${oracle.description} What would you like to know?`;
  }

  // Mock Grok API call with personality-driven responses
  async function sendToGrokAPI(userMessage: string, oracle: Oracle): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Generate contextual funny responses based on oracle personality
    const responses = getOracleResponses(oracle.id, userMessage.toLowerCase());
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return randomResponse;
  }

  // Oracle-specific response generator
  function getOracleResponses(oracleId: string, userMessage: string): string[] {
    // Crystal Ball Carl (fortune) responses
    if (oracleId === "fortune") {
      if (userMessage.includes("future") || userMessage.includes("what will happen")) {
        return [
          "🔮 *shakes snow globe vigorously* Ah yes, I see it now... the future is cloudy with a chance of... wait, that's just the glitter settling. But seriously, I'm seeing a Tuesday in your near future. Possibly even a Wednesday. Trust the process.",
          "🔮 The mystical orb reveals... *squints* ...that you should probably drink more water. Also, I'm getting strong vibes that something will happen. Or maybe it won't. The cosmos is being cryptic today.",
          "🔮 *gazes deeply into the snow globe* I foresee... a decision you'll need to make. It could go either way. My advice? Trust the cat. There's always a cat involved somehow.",
        ];
      } else if (userMessage.includes("love") || userMessage.includes("relationship")) {
        return [
          "🔮 Ah, matters of the heart! *snow globe intensifies* The cosmic forces suggest that your love life will involve... a person. Possibly multiple persons if you're ambitious. Beware of anyone who doesn't like pizza though. That's a red flag from the universe.",
          "🔮 *mystic humming* I see romance in your future! It may involve awkward first dates, questionable text messages, or someone who quotes The Office too much. The stars are pointing towards... compatibility? Or maybe that's just Jupiter being dramatic again.",
          "🔮 The orb of destiny speaks! Your romantic future involves either great happiness or valuable life lessons. Possibly both. My mystical advice: don't ghost people, the karma is real (I checked).",
        ];
      } else if (userMessage.includes("money") || userMessage.includes("rich") || userMessage.includes("lottery")) {
        return [
          "🔮 *snow globe swirls mysteriously* Financial fortunes, eh? I'm seeing... numbers. Lots of numbers. Some go up, some go down. My cosmic tip: maybe don't bet it all on that 'guaranteed' crypto your cousin mentioned.",
          "🔮 The universe reveals that money flows to those who... *checks notes* ...work for it. I know, I was hoping for something more mystical too. But hey, I also see a potential windfall! Could be $5, could be $5,000. The cosmos doesn't do specifics.",
          "🔮 *peers into the depths* Your financial future is tied to Tuesdays. I keep telling everyone about Tuesdays but nobody listens. Also, avoid pyramid schemes shaped like actual pyramids. The irony is too obvious.",
        ];
      }
      return [
        "🔮 *concentrates on snow globe* The answer you seek is within... or maybe it's outside. Spatial relationships are confusing in the mystical realm. But I'm 73% certain that things will happen, and you'll be there when they do!",
        "🔮 Interesting question! The cosmic forces are telling me that the answer involves either yes, no, or maybe. Possibly all three simultaneously. Quantum mysticism is wild like that.",
        "🔮 *mystical whispers* I'm receiving a message from beyond... it says 'error 404, prophecy not found.' Just kidding! The actual message is: trust your gut, but also maybe Google it just to be safe.",
      ];
    }

    // Crypto Cassandra responses
    if (oracleId === "crypto") {
      if (userMessage.includes("bitcoin") || userMessage.includes("btc")) {
        return [
          "₿ *studies charts intensely* Bitcoin to $100K? $1M? Yes. When? Eventually. This is the way. My TA suggests we're in a definite pattern that will either go up, down, or sideways. Diamond hands, anon! 💎🙌",
          "₿ Ah, the king of crypto! Look, BTC is like that friend who shows up late to everything but somehow makes it worth it. We're still early (we're always early). Just stack sats and trust the 4-year cycle. Not financial advice tho! 🚀",
          "₿ Bitcoin? *50 charts appear* This is either the best or worst time to buy, depending on when you ask me. The blockchain doesn't lie, but it also doesn't give clear signals. HODL and pray to Satoshi. WAGMI! 📈",
        ];
      } else if (userMessage.includes("shitcoin") || userMessage.includes("altcoin") || userMessage.includes("meme")) {
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
    if (oracleId === "meme-coins") {
      if (userMessage.includes("doge") || userMessage.includes("dogecoin")) {
        return [
          "🐸 *checks Elon's tweets obsessively* DOGE is the OG meme coin, the people's crypto! Will it hit $1? Maybe when Elon colonizes Mars and accepts DOGE as payment. Until then, much wow, very moon! 🐕🚀",
          "🐸 Dogecoin: started as a joke, became a movement, stayed a meme. It's basically the internet's favorite currency. My prediction? It'll pump whenever you least expect it. That's the DOGE way! 💎",
          "🐸 The original degen play! DOGE has survived every crypto winter and still has the best community. Do Only Good Everyday, but also buy the dips. Not financial advice, just vibes! 🌙",
        ];
      } else if (userMessage.includes("shib") || userMessage.includes("shiba")) {
        return [
          "🐸 *army of Shiba Inus appears* SHIB! The DOGE killer that became its own legend. Will burning tokens make it moon? Will Shibarium change everything? Will we all get Lambos? Probably not, but the memes are top tier! 🔥",
          "🐸 Shiba Inu: when one dog coin wasn't enough. The community is passionate, the supply is... let's say 'abundant,' and the dream is alive! Just remember: always DYOR before aping in! 🐕",
          "🐸 SHIB to $0.01? *does math on infinity supply* ...yeah, that's gonna need a LOT of burning. But hey, crazier things have happened in crypto! The meme must flow! 🚀",
        ];
      } else if (userMessage.includes("pepe") || userMessage.includes("frog")) {
        return [
          "🐸 *rare Pepe collection intensifies* PEPE, the ultimate meme coin! It's literally a frog, like me! Will it 100x? Will it rug? Who knows! That's the beauty of meme coins - pure, unfiltered chaos and community vibes! 🐸💚",
          "🐸 Meme coins are the purest form of crypto. No utility promises, no fake roadmaps, just vibes and community. PEPE represents this perfectly. Buy the meme, become the meme! 🎭",
          "🐸 When normie coins are boring you with 'fundamentals' and 'use cases,' meme coins are out here making millionaires through sheer willpower and Telegram raids. PEPE is the way! 🌊",
        ];
      }
      return [
        "🐸 *scans 500 Telegram channels* The next 100x is out there, anon. Could be a cat, could be a dog, could be a literal potato. Meme coin season is always one tweet away! Stay degen, stay ready! 💎🙌",
        "🐸 GM fellow degens! Remember: in meme coins, community is EVERYTHING. No community? It's a rug waiting to happen. Strong community? That's your ticket to Valhalla! WAGMI! 🚀",
        "🐸 *checks CT and Reddit simultaneously* My meme coin prediction model is simple: if it makes you laugh AND has good liquidity, it might be the one. If it's being shilled by 100 new accounts, RUN! Trust the vibes! 🎲",
      ];
    }

    // Default responses for other oracles
    return [
      `${oracle.emoji} *channels cosmic energy* Interesting question! My ${oracle.specialty.toLowerCase()} powers are tingling. Based on my extensive research (and vibes), I predict that things will definitely happen. The exact details are still materializing in the prediction realm!`,
      `${oracle.emoji} Ooh, spicy topic! Let me consult my sources... *shuffles imaginary cards* ...and by sources I mean my incredibly tuned intuition and this lucky coin. My ${oracle.accuracy} accurate prediction: expect the unexpected, but also the expected. Balance!`,
      `${oracle.emoji} *activates ${oracle.specialty} mode* You've come to the right oracle! My analysis suggests a 73% chance of something interesting, a 25% chance of something boring, and a 2% chance of something absolutely wild. The math might not add up but neither does reality anymore! 🎲`,
    ];
  }

  // Mock news fetch based on conversation context
  async function fetchRelevantNews(userMessage: string) {
    setIsLoadingNews(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add to conversation context
    conversationContextRef.current = [...conversationContextRef.current, userMessage].slice(-5);

    // Generate mock news articles based on message keywords
    const keywords = extractKeywords(userMessage);
    const mockArticles = generateMockNews(keywords, oracle.category);
    
    setNewsArticles(mockArticles);
    setIsLoadingNews(false);
  }

  function extractKeywords(message: string): string[] {
    const words = message.toLowerCase().split(" ");
    const commonWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "will", "what", "when", "where", "how", "why", "tell", "me", "about", "should", "could", "would"];
    return words.filter(word => word.length > 3 && !commonWords.includes(word));
  }

  function generateMockNews(keywords: string[], category: string): NewsArticle[] {
    const topics = keywords.length > 0 ? keywords : ["future", "prediction", "trends"];
    
    const mockNews: NewsArticle[] = [
      {
        id: "1",
        title: `Breaking: ${topics[0]?.toUpperCase() || "MYSTERY"} Trends Hit All-Time High, Experts Baffled`,
        source: "The Daily Prophet Times",
        url: "#",
        publishedAt: "2 hours ago",
        relevance: "High",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80",
      },
      {
        id: "2",
        title: `Analysts Predict ${category} Will "Definitely Change" in Coming Months`,
        source: "Fortune Cookie Weekly",
        url: "#",
        publishedAt: "5 hours ago",
        relevance: "Medium",
        image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&q=80",
      },
      {
        id: "3",
        title: `Study Shows ${topics[Math.min(1, topics.length - 1)] || "Things"} More Popular Than Ever Among Confused Demographics`,
        source: "Meme News Network",
        url: "#",
        publishedAt: "1 day ago",
        relevance: "Medium",
        image: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=400&q=80",
      },
      {
        id: "4",
        title: `Why Everyone Is Talking About ${topics[0] || "This"} (And Why You Should Too)`,
        source: "Clickbait Central",
        url: "#",
        publishedAt: "2 days ago",
        relevance: "Low",
        image: "https://images.unsplash.com/photo-1586339277861-b0b1cf004b68?w=400&q=80",
      },
    ];

    return mockNews;
  }

  function generateSingleArticle(context: string[]): NewsArticle {
    const allKeywords = context.flatMap(msg => extractKeywords(msg));
    const uniqueKeywords = [...new Set(allKeywords)];
    const topic = uniqueKeywords[Math.floor(Math.random() * uniqueKeywords.length)] || "trending topics";

    const articleTemplates = [
      {
        title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Market Sees Unexpected Surge, Insiders Say "We're Not Surprised"`,
        source: "Contradiction Chronicles",
        relevance: "High",
        image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&q=80",
      },
      {
        title: `New Research Reveals ${topic.charAt(0).toUpperCase() + topic.slice(1)} Could Be The Future (Or Not, Scientists Disagree)`,
        source: "Maybe Science Weekly",
        relevance: "Medium",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
      },
      {
        title: `${oracle.category} Experts Weigh In On ${topic.charAt(0).toUpperCase() + topic.slice(1)}: "It's Complicated"`,
        source: "Expert Opinion Gazette",
        relevance: "Medium",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
      },
      {
        title: `How ${topic.charAt(0).toUpperCase() + topic.slice(1)} Is Changing Everything (And Nothing) Simultaneously`,
        source: "Paradox Press",
        relevance: "Low",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80",
      },
      {
        title: `Is ${topic.charAt(0).toUpperCase() + topic.slice(1)} Over? This Analyst Thinks Maybe, Possibly, Perhaps`,
        source: "Uncertain Times",
        relevance: "Medium",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
      },
      {
        title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Predictions for 2025: More of the Same, But Different`,
        source: "Crystal Ball Quarterly",
        relevance: "High",
        image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=80",
      },
      {
        title: `Local Oracle ${oracle.name} Makes Bold Prediction About ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
        source: "Meta News Network",
        relevance: "High",
        image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
      },
      {
        title: `The ${topic.charAt(0).toUpperCase() + topic.slice(1)} Phenomenon: Why Nobody Knows What's Happening`,
        source: "Confused Correspondent",
        relevance: "Low",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80",
      },
    ];

    const template = articleTemplates[Math.floor(Math.random() * articleTemplates.length)];
    const timeframes = ["30 minutes ago", "1 hour ago", "3 hours ago", "6 hours ago", "12 hours ago", "1 day ago"];

    return {
      id: `article-${articleCounter}`,
      title: template.title,
      source: template.source,
      url: "#",
      publishedAt: timeframes[Math.floor(Math.random() * timeframes.length)],
      relevance: template.relevance,
      image: template.image,
    };
  }

  const handleDeleteArticle = (articleId: string) => {
    // Add to deleted set
    setDeletedArticleIds(prev => new Set([...prev, articleId]));
    
    // Remove the article
    setNewsArticles(prev => prev.filter(article => article.id !== articleId));
    
    // Generate and add a new article
    const newArticle = generateSingleArticle(conversationContextRef.current);
    setArticleCounter(prev => prev + 1);
    
    // Add new article after a brief delay for smooth transition
    setTimeout(() => {
      setNewsArticles(prev => [...prev, newArticle]);
    }, 300);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();
    const isPrediction = isPredictionQuestion(trimmedInput);

    // Increment user message count
    const newMessageCount = userMessageCount + 1;
    setUserMessageCount(newMessageCount);

    // Check if user should sign in (after 3 messages)
    if (!user?.walletAddress && newMessageCount >= 4) {
      setPendingMessage(trimmedInput); // Store the message to send after sign-in
      setInput(""); // Clear input field
      setSignInDialogOpen(true);
      return;
    }

    // Check daily line limit for free users (signed-in users)
    if (user?.walletAddress && (!user?.subscriptionTier || user?.subscriptionTier === 'free')) {
      const { allowed, remaining, linesInMessage } = checkDailyLineLimit(trimmedInput);
      
      if (!allowed) {
        // User has hit their daily line limit - show upgrade dialog
        setLimitReachedType('textline');
        setLimitReachedDialogOpen(true);
        setInput(""); // Clear input
        return;
      }
      
      // Show warning when approaching limit (at 80% usage)
      if (remaining <= 20 && remaining > 0) {
        toast.warning(
          `⚠️ Only ${remaining} text lines remaining today`,
          {
            duration: 3000,
          }
        );
      }
    }

    // Check daily prediction limit for predictions only (signed-in users)
    if (user?.walletAddress && isPrediction) {
      const { allowed, remaining } = checkDailyPredictionLimit();
      
      if (!allowed) {
        // User has hit their daily prediction limit - show upgrade dialog
        setLimitReachedType('prediction');
        setLimitReachedDialogOpen(true);
        setInput(""); // Clear input
        return;
      }
    }

    // Check if user should subscribe (after 5 total questions across all oracles)
    if (user?.walletAddress && (!user?.subscriptionTier || user?.subscriptionTier === 'free') && totalQuestionsAsked >= 5) {
      setPendingMessage(trimmedInput); // Store the message to send after upgrade
      setInput(""); // Clear input field
      setSubscriptionDialogOpen(true);
      return;
    }

    // Track total questions asked
    if (onQuestionAsked) {
      onQuestionAsked();
    }

    // Increment daily prediction count if this is a prediction
    if (isPrediction && user?.walletAddress) {
      incrementDailyPredictions();
    }

    // Increment daily line count for free users
    if (user?.walletAddress && (!user?.subscriptionTier || user?.subscriptionTier === 'free')) {
      const linesInMessage = countLines(trimmedInput);
      incrementDailyLines(linesInMessage);
    }
    
    console.log('Message:', trimmedInput);
    console.log('Is Prediction:', isPrediction);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
      isPrediction,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Fetch relevant news
    fetchRelevantNews(trimmedInput);

    try {
      const response = await sendToGrokAPI(trimmedInput, oracle);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        isPrediction,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // If this was a prediction, store it and flash the share button
      if (isPrediction) {
        console.log('✓ PREDICTION DETECTED!');
        console.log('Question:', trimmedInput);
        console.log('Answer:', response);
        const predictionData = {
          question: trimmedInput,
          answer: response,
        };
        console.log('Storing prediction data:', predictionData);
        setLastPrediction(predictionData);
        setShareFlashing(true);
        
        // Stop flashing after 3 seconds
        setTimeout(() => {
          setShareFlashing(false);
        }, 3000);
      } else {
        console.log('✗ Not a prediction question');
        console.log('Message was:', trimmedInput);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setLocalLikes(prev => prev + 1);
    } else {
      setHasLiked(false);
      setLocalLikes(prev => prev - 1);
    }
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    // In a real app, this would update the oracle's accuracy based on user feedback
  };

  const formatLikes = (likes: number): string => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  const defaultShortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const defaultOnWalletDisconnect = () => {
    console.log("Wallet disconnect");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {onNavigate && shortenAddress && onWalletDisconnect && onOpenWalletDialog ? (
        <UnifiedHeader
          currentPage={currentPage}
          onNavigate={(page) => {
            if (page === "oracles") {
              onBack();
            } else {
              onNavigate(page);
            }
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          user={user}
          onOpenWalletDialog={onOpenWalletDialog}
          onWalletDisconnect={onWalletDisconnect}
          shortenAddress={shortenAddress}
        />
      ) : (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${oracle.gradient} opacity-30`} />
                <img src={oracle.avatar} alt={oracle.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg leading-none">{oracle.name}</h1>
                <p className="text-xs text-muted-foreground">{oracle.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {localAccuracy}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  {formatLikes(localLikes)}
                </Badge>
                {oracle.consultSessions && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-purple-500" />
                    {oracle.consultSessions}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Chat Area */}
      <div className="container px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Chat Section - Left/Main with Background */}
          <div className="lg:col-span-2">
            <div className="relative h-[calc(100vh-12rem)] rounded-xl overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={oracle.avatar} 
                  alt={oracle.name}
                  className="w-full h-full object-cover object-top"
                />
                {/* Subtle gradient overlay for depth */}
                <div className={`absolute inset-0 bg-gradient-to-br ${oracle.gradient} opacity-10`} />
              </div>

              {/* Oracle Badge - Top */}
              <div className="absolute top-6 left-6 right-6 z-10">
                <Card className="border-border bg-background/80 backdrop-blur-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{oracle.emoji}</span>
                        <div>
                          <CardTitle className="text-lg">{oracle.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{oracle.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Share Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-2 transition-all ${
                            shareFlashing 
                              ? 'animate-pulse bg-purple-600/30 hover:bg-purple-600/40 border-2 border-purple-500 shadow-lg shadow-purple-500/50' 
                              : lastPrediction
                              ? 'bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30'
                              : 'hover:bg-secondary opacity-50'
                          }`}
                          onClick={() => {
                            console.log('Share button clicked. Last prediction:', lastPrediction);
                            console.log('Share flashing:', shareFlashing);
                            if (lastPrediction) {
                              setShareDialogOpen(true);
                            } else {
                              toast.info("Ask a prediction question first!");
                            }
                          }}
                        >
                          <Share2 className={`w-4 h-4 ${
                            shareFlashing 
                              ? 'text-purple-400' 
                              : lastPrediction 
                              ? 'text-purple-400' 
                              : 'text-muted-foreground'
                          }`} />
                          <span className="hidden sm:inline text-xs">{lastPrediction ? 'Share' : 'Share'}</span>
                        </Button>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs text-yellow-400">{oracle.accuracy} Accuracy</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Interface - Bottom Half Only */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 flex flex-col pointer-events-none">
                {/* Messages Area - Scrollable with transparent background */}
                <div className="flex-1 overflow-hidden pointer-events-auto">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                              message.role === "user"
                                ? `bg-gradient-to-r ${oracle.gradient} text-white backdrop-blur-sm`
                                : "bg-black/40 dark:bg-white/20 backdrop-blur-md text-white border border-white/30"
                            }`}
                          >
                            {message.role === "assistant" && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{oracle.emoji}</span>
                                <span className="text-xs text-white/90">{oracle.name}</span>
                              </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <span className={`text-xs mt-1 block ${message.role === "user" ? "text-white/70" : "text-white/60"}`}>
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-black/40 dark:bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{oracle.emoji}</span>
                              <span className="text-xs text-white/90">{oracle.name} is typing...</span>
                            </div>
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Input Section - Fixed at bottom with semi-transparent background */}
                <div className="p-4 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xl border-t border-white/10 pointer-events-auto">
                  <div className="max-w-4xl mx-auto">
                    {/* Rating and Like Section */}
                    <div className="mb-4 p-3 bg-black/30 dark:bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-white/80 mb-2">Rate this oracle's accuracy:</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRating(star)}
                                className="transition-all hover:scale-110"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= userRating
                                      ? "fill-yellow-500 text-yellow-500"
                                      : "text-white/40"
                                  }`}
                                />
                              </button>
                            ))}
                            {userRating > 0 && (
                              <span className="text-xs text-white/80 ml-2">
                                {userRating} / 5
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLike}
                            className={`${
                              hasLiked
                                ? `bg-gradient-to-r ${oracle.gradient} text-white border-0`
                                : "border-white/30 text-white/90 hover:bg-white/10"
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-white" : ""}`} />
                          </Button>
                          <span className="text-xs text-white/80">
                            {hasLiked ? "Liked!" : "Like"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Daily Prediction Limit Counter for Free Users */}
                    {user?.walletAddress && user?.subscriptionTier !== 'master' && (() => {
                      const today = new Date().toDateString();
                      const lastResetDate = user?.dailyPredictionsResetDate;
                      const dailyUsed = (lastResetDate === today) ? (user?.dailyPredictionsUsed || 0) : 0;
                      const remaining = 5 - dailyUsed;
                      
                      if (remaining <= 2) {
                        return (
                          <div className="mb-3 p-3 bg-orange-500/20 border border-orange-500/40 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-white/90">
                                <Lock className="w-4 h-4 inline mr-1" />
                                {remaining} prediction{remaining !== 1 ? 's' : ''} remaining today
                              </p>
                              <Button
                                size="sm"
                                onClick={() => onNavigate?.("subscription")}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                              >
                                <Crown className="w-3 h-3 mr-1" />
                                Upgrade
                              </Button>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Daily Line Limit Counter for Free Users */}
                    {user?.walletAddress && user?.subscriptionTier !== 'master' && (() => {
                      const today = new Date().toDateString();
                      const lastResetDate = user?.dailyLinesResetDate;
                      const dailyUsed = (lastResetDate === today) ? (user?.dailyLinesUsed || 0) : 0;
                      const remaining = 100 - dailyUsed;
                      const percentage = (dailyUsed / 100) * 100;
                      
                      if (remaining <= 30) {
                        return (
                          <div className="mb-3 p-3 bg-orange-500/20 border border-orange-500/40 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-white/90">
                                <MessageSquare className="w-4 h-4 inline mr-1" />
                                {remaining} text lines remaining today
                              </p>
                              <Button
                                size="sm"
                                onClick={() => onNavigate?.("subscription")}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                              >
                                <Crown className="w-3 h-3 mr-1" />
                                Upgrade
                              </Button>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-white/70 mt-1">{dailyUsed}/100 lines used</p>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex gap-2">
                      <Input
                        placeholder={`Ask ${oracle.name} anything...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 bg-black/30 dark:bg-white/10 backdrop-blur-md border-white/30 text-white placeholder:text-white/50"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`bg-gradient-to-r ${oracle.gradient} hover:opacity-90 text-white shadow-lg`}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-white/60 mt-2">
                      💡 Powered by mystical AI • Predictions for entertainment only
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* News Feed - Right */}
          <div className="lg:col-span-1">
            {/* News Feed Section - Full Height */}
            <Card className="border-border overflow-hidden h-full">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Newspaper className="w-4 h-4" />
                  <span>Relevant News</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Articles related to your conversation
                </p>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="p-3 space-y-3">
                  {isLoadingNews ? (
                    <>
                      {[1, 2].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-20 w-full rounded-lg" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-2 w-2/3" />
                        </div>
                      ))}
                    </>
                  ) : newsArticles.length > 0 ? (
                    newsArticles.map((article) => (
                      <Card key={article.id} className="overflow-hidden hover:shadow-md transition-all duration-300 group relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 left-1 z-10 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArticle(article.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="relative h-20 overflow-hidden cursor-pointer">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1 right-1">
                            <Badge variant="secondary" className="text-xs h-4 px-1.5">
                              {article.relevance}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <h4 className="text-xs mb-1 line-clamp-2 group-hover:text-purple-400 transition-colors leading-tight">
                            {article.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate text-xs">{article.source}</span>
                            <span className="text-xs">{article.publishedAt}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="w-full mt-1 text-xs h-6 px-2" asChild>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              Read <ExternalLink className="w-2.5 h-2.5 ml-1" />
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Newspaper className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-xs text-muted-foreground">
                        Start chatting to see news
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>

      {/* Sign In Dialog */}
      <AlertDialog open={signInDialogOpen} onOpenChange={setSignInDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-500" />
              Sign In to Continue
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You've reached the free chat limit of 5 messages with {oracle.name}. 
                Sign in to continue your conversation and unlock more features!
              </p>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-sm font-medium mb-2">Sign in to get:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Unlimited chats with all oracles</li>
                  <li>✓ Save your conversation history</li>
                  <li>✓ Join houses and earn XP</li>
                  <li>✓ Place bets and predictions</li>
                  <li>✓ Access to premium features</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSignInDialogOpen(false);
                if (onOpenWalletDialog) {
                  onOpenWalletDialog();
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              Sign In Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription Dialog */}
      <AlertDialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Upgrade to Continue
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You've asked 5 questions across all oracles! 
                Upgrade to a premium subscription to unlock unlimited predictions and exclusive features.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm font-medium mb-1">Oracle Master</p>
                  <p className="text-xs text-muted-foreground">$9.99/mo</p>
                  <ul className="text-xs mt-2 space-y-1">
                    <li>✓ Unlimited predictions</li>
                    <li>✓ 1.5x XP multiplier</li>
                    <li>✓ All premium oracles</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm font-medium mb-1">Oracle Legend</p>
                  <p className="text-xs text-muted-foreground">$29.99/mo</p>
                  <ul className="text-xs mt-2 space-y-1">
                    <li>✓ Everything in Master</li>
                    <li>✓ 2.0x XP multiplier</li>
                    <li>✓ Create custom oracles</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Now</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSubscriptionDialogOpen(false);
                if (onNavigate) {
                  onNavigate('subscription');
                  onBack();
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              View Plans
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Daily Limit Reached Dialog */}
      <AlertDialog open={limitReachedDialogOpen} onOpenChange={setLimitReachedDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Daily Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              {limitReachedType === 'textline' ? (
                <>
                  <p>
                    You've used all <strong>100 free text lines</strong> for today. Your limit resets tomorrow!
                  </p>
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-orange-400" />
                      <p className="text-sm font-medium text-foreground">Current Usage</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Free tier: 100 text lines per day
                    </p>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <p className="text-xs text-orange-400 mt-1 text-center">100/100 lines used</p>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    You've used all <strong>5 free predictions</strong> for today. Your limit resets tomorrow!
                  </p>
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <p className="text-sm font-medium text-foreground">Current Usage</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Free tier: 5 predictions per day
                    </p>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <p className="text-xs text-purple-400 mt-1 text-center">5/5 predictions used</p>
                  </div>
                </>
              )}

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm font-medium text-foreground">Upgrade to Summon Master</p>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span><strong>Unlimited</strong> predictions per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span><strong>Unlimited</strong> text messaging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span><strong>2.0x XP</strong> multiplier (double XP!)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>All premium features unlocked</span>
                  </li>
                </ul>
                <div className="mt-3 pt-3 border-t border-purple-500/20">
                  <p className="text-xs text-center">
                    <span className="line-through text-muted-foreground">$19.99/mo</span>
                    <span className="ml-2 text-lg font-semibold text-purple-400">$9.99/mo</span>
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setLimitReachedDialogOpen(false);
                if (onNavigate) {
                  onNavigate('subscription');
                  onBack();
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
            >
              <Crown className="w-4 h-4 mr-2" />
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
          oracleName={oracle.name}
          oracleAvatar={oracle.avatar}
          oracleEmoji={oracle.emoji}
        />
      )}
    </div>
  );
}
