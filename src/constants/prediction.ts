import { today } from "../lib/date";
import { OracleEntity } from "../services/oracles.service";

export const MAX_PREDICTIONS_PER_DAY = 30;

export const questionsByAIAgent: Record<string, string[][]> = {
  crypto: [
    [
      "What's your Bitcoin price prediction for 2026?",
      "Which altcoins are undervalued right now?",
      "Will we see another crypto winter?",
    ],
    [
      `What’s the most bullish DeFi signal right now?`,
      `Is DeFi still undervalued this cycle?`,
      `DeFi Tokens Up or Down — ${today}, end of day`,
    ],
    [
      "How will regulation affect crypto markets?",
      "What's the next big trend in DeFi?",
      "Should I hold or sell my crypto?",
    ],
    [
      "Which Layer 2 solutions will dominate?",
      "What do you think about Ethereum's future?",
      "Are meme coins still worth it?",
    ],
  ],
  "meme-coins": [
    [
      "What's the next 100x meme coin?",
      "Is PEPE still a good investment?",
      "How do you spot early meme coins?",
    ],
    [
      "Will DOGE hit $1 in 2026?",
      "What makes a meme coin successful?",
      "Which meme coin communities are strongest?",
    ],
    [
      "Are meme coins dead or thriving?",
      "How to avoid rug pulls?",
      "Best strategy for meme coin trading?",
    ],
    [
      `Are meme coins back this cycle?`,
      `Which meme coin has the strongest momentum?`,
      `Meme Coins Up or Down — ${today}, end of day`,
    ],
  ],
  "crypto-crystal": [
    [
      "What's your Bitcoin price prediction for 2026?",
      "Which altcoins are undervalued right now?",
      "Will we see another crypto winter?",
    ],
    [
      `Which altcoin sector could outperform next?`,
      `What altcoin trend is being overlooked?`,
      `Altcoins Up or Down — ${today}, end of day`,
    ],
    [
      "How will regulation affect crypto markets?",
      "What's the next big trend in DeFi?",
      "Which Layer 2 solutions will dominate?",
    ],
    [
      `Are NFTs preparing for a comeback?`,
      `What’s misunderstood about the NFT market?`,
      `NFT Market Up or Down — ${today}, end of day`,
    ],
    [
      "What do you think about Ethereum's future?",
      "Are NFTs coming back?",
      "Best strategy for crypto investing?",
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
      `Solana price on ${today}?`,
    ],
    [
      `What's your prediction for ${aiAgentData.type.split(" ")[0]}?`,
      `What trends do you see in ${aiAgentData.type.split(" ")[0]}?`,
      `What should I know about ${aiAgentData.type.split(" ")[0]}?`,
    ],
    [
      `Any bold predictions for Bitcoin this week?`,
      `What’s the biggest BTC risk right now?`,
      `Ethereum Up or Down - ${today}, 11:55AM-12:00PM ET`,
    ],
    [
      `Bitcoin Up or Down - ${today}, 11:45AM-12:00PM ET`,
      `What altcoin trend is being overlooked?`,
      `What’s the strongest ETH narrative right now?`,
    ],
    [
      `What does funding say about market sentiment?`,
      `Is leverage too high right now?`,
      `Funding Rates Up or Down — ${today}, next hour`,
    ],
  ];

  // Randomly select one set of 3 questions
  const randomSet =
    aiAgentQuestions[Math.floor(Math.random() * aiAgentQuestions.length)];
  return randomSet;
}
