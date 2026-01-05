import { Brain, Sparkles, TrendingUp, Users } from "lucide-react";
import { today } from "../lib/date";
import { OracleEntity } from "../services/oracles.service";

export const MAX_PREDICTIONS_PER_DAY = 30;

export const questionsByAIAgent: Record<string, string[][]> = {
  crypto: [
    [
      "What's your Bitcoin price prediction for 2026?",
      "Which altcoins are undervalued right now?",
      "Should I hold or sell my crypto?",
    ],
    [
      "How will regulation affect crypto markets?",
      "What do you think about Ethereum's future?",
      "Will we see another crypto winter?",
    ],
    [
      "Which Layer 2 solutions will dominate?",
      "Are meme coins still worth it?",
      "What should investors pay attention to right now?",
    ],
    [
      "What's the next big trend in DeFi?",
      "Are NFTs preparing for a comeback?",
      "Best strategy for long-term crypto investing?",
    ],
  ],
  "meme-coins": [
    [
      "What's the next 100x meme coin?",
      "How do you spot early meme coins?",
      "How to avoid rug pulls?",
    ],
    [
      "Will DOGE hit $1 in 2026?",
      "What makes a meme coin successful?",
      "Should I take profits or hold meme coins?",
    ],
    [
      "Are meme coins dead or thriving?",
      "Which meme coin communities are strongest?",
      "Best strategy for meme coin trading?",
    ],
    [
      "Are meme coins back this cycle?",
      "Which meme coin has the strongest momentum?",
      `Meme Coins Up or Down — ${today}, end of day`,
    ],
  ],
  "crypto-crystal": [
    [
      "What's your Bitcoin price prediction for 2026?",
      "Which altcoin sector could outperform next?",
      "Will we see another crypto winter?",
    ],
    [
      "How will regulation affect crypto markets?",
      "What's the next big trend in DeFi?",
      "Which Layer 2 solutions will dominate?",
    ],
    [
      "What do you think about Ethereum's future?",
      "Are NFTs preparing for a comeback?",
      "Best strategy for crypto investing right now?",
    ],
    [
      "Is market sentiment shifting bullish or bearish?",
      "What risk is the market overlooking?",
      `Crypto Market Up or Down — ${today}, end of day`,
    ],
    [
      "What on-chain signal matters most right now?",
      "Is leverage too high in the market?",
      "What should long-term investors ignore right now?",
    ],
  ],
  sports: [
    [
      "Who will win the championship?",
      "Which team is most underrated?",
      "What's your boldest sports prediction?",
    ],
    [
      "Will there be any major upsets?",
      "Which player will break out?",
      "What trends are shaping the sport?",
    ],
    [
      "Who are the top contenders?",
      "Any dark horse teams to watch?",
      "What's the biggest storyline?",
    ],
  ],
  entertainment: [
    [
      "What's the next big entertainment trend?",
      "Which shows will dominate?",
      "Who's the breakout star of 2026?",
    ],
    [
      "Will streaming wars intensify?",
      "What movies will be blockbusters?",
      "Which celebrities are rising?",
    ],
    [
      "What's the future of entertainment?",
      "Any surprise hits coming?",
      "Which franchises will succeed?",
    ],
  ],
  tech: [
    [
      "What's the next big tech breakthrough?",
      "Will AI transform everything?",
      "Which tech stocks look good?",
    ],
    [
      "What are the hottest tech trends?",
      "Is the tech bubble real?",
      "Which startups will succeed?",
    ],
    [
      "How will quantum computing evolve?",
      "What's next for social media?",
      "Will VR/AR finally take off?",
    ],
  ],
  fundamental: [
    [
      "Which stocks are undervalued now?",
      "What sectors will outperform?",
      "Is the market overvalued?",
    ],
    [
      "Best value stocks for 2026?",
      "How to identify quality companies?",
      "What's your market outlook?",
    ],
    [
      "Which industries have strong moats?",
      "Best dividend stocks?",
      "How to analyze cash flow?",
    ],
  ],
  fortune: [
    [
      "What does my financial future hold?",
      "Will I have good luck soon?",
      "What opportunities should I watch for?",
    ],
    [
      "How can I improve my fortune?",
      "What's blocking my success?",
      "When will things turn around?",
    ],
    [
      "Should I take a big risk?",
      "What does the universe say?",
      "Any warnings for me?",
    ],
  ],
};

export function generateSuggestedQuestions(
  aiAgentData: OracleEntity
): string[] {
  const agentKeys = [aiAgentData.id, "crypto-crystal", "crypto", "meme-coins"];
  const selectedAgentKey =
    agentKeys[Math.floor(Math.random() * agentKeys.length)];

  // Get questions for this AI agent or use defaults
  const aiAgentQuestions = questionsByAIAgent[selectedAgentKey] || [
    [
      "Will SOL close green for the day?",
      "Will BNB outperform BTC today?",
      "What should traders watch in today’s market?",
    ],
    [
      `What's your prediction for ${aiAgentData.type.split(" ")[0]}?`,
      `Is now a good time to be patient or stay active?`,
      `What trends do you see in ${aiAgentData.type.split(" ")[0]}?`,
    ],
    [
      "Any bold predictions for Bitcoin this week?",
      "What’s the biggest market risk right now?",
      `Ethereum Up or Down — ${today}, 11:55AM–12:00PM ET`,
    ],
    [
      `Bitcoin Up or Down — ${today}, 11:45AM–12:00PM ET`,
      "What altcoin trend is being overlooked?",
      "What’s the strongest ETH narrative right now?",
    ],
    [
      "What does funding say about market sentiment?",
      "Is leverage too high right now?",
      "Is the crypto market overheating or cooling off?",
    ],
  ];

  // Randomly select one set of 3 questions
  const randomSet =
    aiAgentQuestions[Math.floor(Math.random() * aiAgentQuestions.length)];
  return randomSet;
}

export const SUGGESTED_PROMPTS_HOMEPAGE = [
  [
    {
      icon: TrendingUp,
      text: `Ethereum Up or Down - ${today}, 5:40AM–5:45AM ET`,
    },
    {
      icon: Users,
      text: "Will Solana surpass Ethereum in daily transactions this month?",
    },
    {
      icon: Sparkles,
      text: "Will ETH burn more than it issues this week?",
    },
    {
      icon: Brain,
      text: "Will Polymarket break its all-time high in daily volume this year?",
    },
  ],
  [
    {
      icon: TrendingUp,
      text: `Bitcoin above $70,000 by end of this month?`,
    },
    {
      icon: Users,
      text: "Will a Layer 2 surpass Ethereum in active users this quarter?",
    },
    {
      icon: Sparkles,
      text: "Will a meme coin enter the top 20 by market cap this cycle?",
    },
    {
      icon: Brain,
      text: "Will a crypto protocol generate over $10M in revenue this month?",
    },
  ],
  [
    {
      icon: TrendingUp,
      text: `SOL higher or lower after US market open today?`,
    },
    {
      icon: Users,
      text: "Will Ethereum staking deposits hit a new ATH this quarter?",
    },
    {
      icon: Sparkles,
      text: "Will any new L2 reach $1B FDV within 30 days of launch?",
    },
    {
      icon: Brain,
      text: "Will a Web3 app reach 1M daily active users in 2026?",
    },
  ],
  [
    {
      icon: TrendingUp,
      text: `ETH volatility above 5% today?`,
    },
    {
      icon: Users,
      text: "Will Solana ecosystem TVL grow faster than Ethereum this month?",
    },
    {
      icon: Sparkles,
      text: "Will ETH supply be net deflationary this week?",
    },
    {
      icon: Brain,
      text: "Will Polymarket exceed $100M in monthly trading volume this year?",
    },
  ],
  [
    {
      icon: TrendingUp,
      text: `Crypto market up or down after US CPI release?`,
    },
    {
      icon: Users,
      text: "Will a new Layer 1 gain meaningful developer traction this year?",
    },
    {
      icon: Sparkles,
      text: "Will meme coins outperform Bitcoin this quarter?",
    },
    {
      icon: Brain,
      text: "Will a crypto exchange launch a profitable prediction market this year?",
    },
  ],
];

export function getRandomPromptHomepage<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
