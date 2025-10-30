import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bitcoin, Zap, Star, Clock, TrendingUp, Trophy, Users, Heart, Music, Plane, Cloud, Home, Cpu, ChefHat, Gamepad2, Shirt, Laugh } from "lucide-react";

interface PredictionBet {
  id: string;
  icon: React.ComponentType<{ className?: string }> | "bitcoin";
  iconColor: string;
  title: string;
  date: string;
  currentPrice: string;
  priceLabel?: string;
  volume: string;
  isOfficial: boolean;
  timeRemaining: number; // in seconds
  yesOdds?: string;
  noOdds?: string;
}

interface PredictionBetCardProps {
  bet: PredictionBet;
  onBuyYes: () => void;
  onBuyNo: () => void;
}

export function PredictionBetCard({ bet, onBuyYes, onBuyNo }: PredictionBetCardProps) {
  const [timeLeft, setTimeLeft] = useState(bet.timeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const IconComponent = bet.icon === "bitcoin" ? Bitcoin : bet.icon;

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-all">
      <CardContent className="p-4">
        {/* Header with Icon and Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl ${bet.iconColor} flex items-center justify-center flex-shrink-0`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm mb-1 leading-tight">
              {bet.title}
            </h4>
            <p className="text-xs text-yellow-500">
              {bet.date}
            </p>
          </div>
        </div>

        {/* Current Price */}
        <div className="text-center mb-4">
          <p className="text-xs text-muted-foreground mb-1">{bet.priceLabel || "Current Price"}</p>
          <p className="text-2xl">{bet.currentPrice}</p>
        </div>

        {/* Buy Yes/No Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={onBuyYes}
            className="bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-400 border border-emerald-800/50"
          >
            Buy Yes
          </Button>
          <Button
            onClick={onBuyNo}
            className="bg-red-900/50 hover:bg-red-800/50 text-red-400 border border-red-800/50"
          >
            Buy No
          </Button>
        </div>

        {/* Bottom Info Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>{bet.volume} Vol.</span>
          </div>
          
          {bet.isOfficial && (
            <Badge 
              variant="outline" 
              className="bg-blue-600/20 border-blue-600/30 text-blue-400 text-xs h-5"
            >
              <span className="mr-1">✓</span> Official
            </Badge>
          )}
          
          <div className="w-6 h-6 rounded bg-amber-900/30 flex items-center justify-center">
            <Zap className="w-3 h-3 text-amber-500" />
          </div>
          
          <div className="w-6 h-6 rounded bg-amber-900/30 flex items-center justify-center">
            <Star className="w-3 h-3 text-amber-500" />
          </div>
          
          <div className="flex items-center gap-1 text-amber-500">
            <Clock className="w-3 h-3" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Oracle-specific bet collections
export const oracleBets: Record<string, PredictionBet[]> = {
  // Politics - Senator Shenanigans
  politics: [
    {
      id: "politics-1",
      icon: Users,
      iconColor: "bg-gradient-to-br from-blue-600 to-indigo-600",
      title: "Will the Senate pass the infrastructure bill by Nov 1?",
      date: "11/01 11:59 PM UTC",
      currentPrice: "62%",
      priceLabel: "Yes Probability",
      volume: "$425K",
      isOfficial: true,
      timeRemaining: 1296000,
    },
    {
      id: "politics-2",
      icon: Users,
      iconColor: "bg-gradient-to-br from-indigo-600 to-violet-600",
      title: "Major political scandal breaks this month?",
      date: "10/31 11:59 PM UTC",
      currentPrice: "73%",
      priceLabel: "Yes Probability",
      volume: "$312K",
      isOfficial: true,
      timeRemaining: 864000,
    },
    {
      id: "politics-3",
      icon: Users,
      iconColor: "bg-gradient-to-br from-blue-600 to-cyan-600",
      title: "GOP nominee announced before December?",
      date: "12/01 12:00 AM UTC",
      currentPrice: "45%",
      priceLabel: "Yes Probability",
      volume: "$589K",
      isOfficial: true,
      timeRemaining: 2592000,
    },
    {
      id: "politics-4",
      icon: Users,
      iconColor: "bg-gradient-to-br from-blue-600 to-cyan-600",
      title: "Supreme Court ruling on abortion by year end?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "56%",
      priceLabel: "Yes Probability",
      volume: "$673K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "politics-5",
      icon: Users,
      iconColor: "bg-gradient-to-br from-blue-600 to-indigo-600",
      title: "Federal minimum wage increase approved?",
      date: "12/15 11:59 PM UTC",
      currentPrice: "38%",
      priceLabel: "Yes Probability",
      volume: "$290K",
      isOfficial: false,
      timeRemaining: 4320000,
    },
    {
      id: "politics-6",
      icon: Users,
      iconColor: "bg-gradient-to-br from-cyan-600 to-blue-600",
      title: "Presidential approval rating above 50% in November?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "41%",
      priceLabel: "Yes Probability",
      volume: "$198K",
      isOfficial: true,
      timeRemaining: 3456000,
    },
  ],

  // Entertainment - Madame Memeory
  entertainment: [
    {
      id: "ent-1",
      icon: Star,
      iconColor: "bg-gradient-to-br from-pink-600 to-rose-600",
      title: "Taylor Swift new album drops by end of year?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "78%",
      priceLabel: "Yes Probability",
      volume: "$892K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "ent-2",
      icon: Star,
      iconColor: "bg-gradient-to-br from-rose-600 to-red-600",
      title: "Will Barbie win Best Picture at Oscars?",
      date: "03/10 8:00 PM PST",
      currentPrice: "34%",
      priceLabel: "Yes Probability",
      volume: "$1.2M",
      isOfficial: true,
      timeRemaining: 10368000,
    },
    {
      id: "ent-3",
      icon: Star,
      iconColor: "bg-gradient-to-br from-pink-600 to-fuchsia-600",
      title: "Celebrity couple announces breakup this week?",
      date: "10/23 11:59 PM UTC",
      currentPrice: "67%",
      priceLabel: "Yes Probability",
      volume: "$234K",
      isOfficial: false,
      timeRemaining: 432000,
    },
    {
      id: "ent-4",
      icon: Star,
      iconColor: "bg-gradient-to-br from-red-600 to-orange-600",
      title: "Marvel announces Phase 6 lineup?",
      date: "11/15 11:59 PM UTC",
      currentPrice: "82%",
      priceLabel: "Yes Probability",
      volume: "$567K",
      isOfficial: true,
      timeRemaining: 2160000,
    },
    {
      id: "ent-5",
      icon: Star,
      iconColor: "bg-gradient-to-br from-pink-600 to-cyan-600",
      title: "Beyoncé Renaissance tour extended to 2026?",
      date: "12/01 11:59 PM UTC",
      currentPrice: "56%",
      priceLabel: "Yes Probability",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 2592000,
    },
    {
      id: "ent-6",
      icon: Star,
      iconColor: "bg-gradient-to-br from-rose-600 to-pink-600",
      title: "Netflix announces price increase?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "71%",
      priceLabel: "Yes Probability",
      volume: "$389K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
  ],

  // Fortune - Crystal Ball Carl
  fortune: [
    {
      id: "fortune-1",
      icon: Star,
      iconColor: "bg-gradient-to-br from-purple-600 to-violet-600",
      title: "Mercury retrograde causes tech chaos?",
      date: "10/25 11:59 PM UTC",
      currentPrice: "88%",
      priceLabel: "Cosmic Certainty",
      volume: "$156K",
      isOfficial: false,
      timeRemaining: 604800,
    },
    {
      id: "fortune-2",
      icon: Star,
      iconColor: "bg-gradient-to-br from-violet-600 to-fuchsia-600",
      title: "Full moon brings major life changes?",
      date: "10/28 11:59 PM UTC",
      currentPrice: "92%",
      priceLabel: "Mystical Probability",
      volume: "$89K",
      isOfficial: false,
      timeRemaining: 864000,
    },
    {
      id: "fortune-3",
      icon: Star,
      iconColor: "bg-gradient-to-br from-purple-600 to-pink-600",
      title: "Lucky number 7 brings fortune this week?",
      date: "10/22 11:59 PM UTC",
      currentPrice: "77%",
      priceLabel: "Destiny Index",
      volume: "$124K",
      isOfficial: false,
      timeRemaining: 345600,
    },
    {
      id: "fortune-4",
      icon: Star,
      iconColor: "bg-gradient-to-br from-fuchsia-600 to-purple-600",
      title: "Tuesday proves to be unlucky?",
      date: "10/17 11:59 PM UTC",
      currentPrice: "95%",
      priceLabel: "Oracle Confidence",
      volume: "$67K",
      isOfficial: false,
      timeRemaining: 86400,
    },
    {
      id: "fortune-5",
      icon: Star,
      iconColor: "bg-gradient-to-br from-violet-600 to-indigo-600",
      title: "Black cat sighting means good luck?",
      date: "10/31 11:59 PM UTC",
      currentPrice: "50%",
      priceLabel: "Superstition Level",
      volume: "$93K",
      isOfficial: false,
      timeRemaining: 1296000,
    },
    {
      id: "fortune-6",
      icon: Star,
      iconColor: "bg-gradient-to-br from-purple-600 to-blue-600",
      title: "Cosmic alignment brings prosperity?",
      date: "11/11 11:11 PM UTC",
      currentPrice: "111%",
      priceLabel: "Vibes Only",
      volume: "$111K",
      isOfficial: false,
      timeRemaining: 2160000,
    },
  ],

  // Stocks - Bull Market Betty
  stocks: [
    {
      id: "stocks-1",
      icon: TrendingUp,
      iconColor: "bg-gradient-to-br from-emerald-600 to-green-600",
      title: "AAPL reaches $200 by end of month?",
      date: "10/31 4:00 PM EST",
      currentPrice: "$178.42",
      priceLabel: "Current Price",
      volume: "$2.1M",
      isOfficial: true,
      timeRemaining: 1296000,
    },
    {
      id: "stocks-2",
      icon: TrendingUp,
      iconColor: "bg-gradient-to-br from-green-600 to-teal-600",
      title: "TSLA above $300 this quarter?",
      date: "12/31 4:00 PM EST",
      currentPrice: "$242.68",
      priceLabel: "Current Price",
      volume: "$1.8M",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "stocks-3",
      icon: TrendingUp,
      iconColor: "bg-gradient-to-br from-emerald-600 to-cyan-600",
      title: "SPY closes above 500 by November?",
      date: "11/30 4:00 PM EST",
      currentPrice: "$457.32",
      priceLabel: "Current Price",
      volume: "$3.2M",
      isOfficial: true,
      timeRemaining: 3456000,
    },
    {
      id: "stocks-4",
      icon: TrendingUp,
      iconColor: "bg-gradient-to-br from-teal-600 to-green-600",
      title: "NVDA hits new ATH this month?",
      date: "10/31 4:00 PM EST",
      currentPrice: "$875.28",
      priceLabel: "Current Price",
      volume: "$2.7M",
      isOfficial: true,
      timeRemaining: 1296000,
    },
    {
      id: "stocks-5",
      icon: TrendingUp,
      iconColor: "bg-gradient-to-br from-green-600 to-emerald-600",
      title: "GME meme rally returns?",
      date: "11/15 4:00 PM EST",
      currentPrice: "$18.92",
      priceLabel: "Current Price",
      volume: "$892K",
      isOfficial: false,
      timeRemaining: 2160000,
    },
    {
      id: "stocks-6",
      icon: TrendingUp,
      iconColor: "bg-gradient-to-br from-cyan-600 to-teal-600",
      title: "VIX spikes above 25 this week?",
      date: "10/20 4:00 PM EST",
      currentPrice: "15.67",
      priceLabel: "Fear Index",
      volume: "$456K",
      isOfficial: true,
      timeRemaining: 259200,
    },
  ],

  // Crypto - Crypto Cassandra
  crypto: [
    {
      id: "btc-1",
      icon: "bitcoin",
      iconColor: "bg-gradient-to-br from-orange-600 to-amber-600",
      title: "BTC above $111,164.65 on 10/16 12:00 PM UTC",
      date: "10/16 12:00 PM UTC",
      currentPrice: "$110,932.73",
      priceLabel: "Current Price",
      volume: "$803.05K",
      isOfficial: true,
      timeRemaining: 2645,
    },
    {
      id: "eth-1",
      icon: "bitcoin",
      iconColor: "bg-gradient-to-br from-blue-600 to-indigo-600",
      title: "ETH above $4,200 on 10/17 8:00 AM UTC",
      date: "10/17 8:00 AM UTC",
      currentPrice: "$4,156.32",
      priceLabel: "Current Price",
      volume: "$532.8K",
      isOfficial: true,
      timeRemaining: 15840,
    },
    {
      id: "btc-2",
      icon: "bitcoin",
      iconColor: "bg-gradient-to-br from-orange-600 to-amber-600",
      title: "BTC reaches $115K by end of October?",
      date: "10/31 11:59 PM UTC",
      currentPrice: "$110,932.73",
      priceLabel: "Current Price",
      volume: "$1.2M",
      isOfficial: true,
      timeRemaining: 1296000,
    },
    {
      id: "sol-1",
      icon: "bitcoin",
      iconColor: "bg-gradient-to-br from-purple-600 to-pink-600",
      title: "SOL above $180 on 10/18 12:00 PM UTC",
      date: "10/18 12:00 PM UTC",
      currentPrice: "$172.45",
      priceLabel: "Current Price",
      volume: "$420.5K",
      isOfficial: true,
      timeRemaining: 73200,
    },
    {
      id: "doge-1",
      icon: "bitcoin",
      iconColor: "bg-gradient-to-br from-yellow-600 to-orange-600",
      title: "DOGE hits $0.15 this week?",
      date: "10/20 11:59 PM UTC",
      currentPrice: "$0.1342",
      priceLabel: "Current Price",
      volume: "$256.9K",
      isOfficial: false,
      timeRemaining: 345600,
    },
    {
      id: "matic-1",
      icon: "bitcoin",
      iconColor: "bg-gradient-to-br from-indigo-600 to-purple-600",
      title: "MATIC above $1.20 on 10/19 6:00 PM UTC",
      date: "10/19 6:00 PM UTC",
      currentPrice: "$1.08",
      priceLabel: "Current Price",
      volume: "$189.3K",
      isOfficial: true,
      timeRemaining: 129600,
    },
  ],

  // Sports - Touchdown Tiffany
  sports: [
    {
      id: "sports-1",
      icon: Trophy,
      iconColor: "bg-gradient-to-br from-red-600 to-orange-600",
      title: "Chiefs win Super Bowl LXI?",
      date: "02/09 6:30 PM EST",
      currentPrice: "35%",
      priceLabel: "Win Probability",
      volume: "$1.5M",
      isOfficial: true,
      timeRemaining: 10368000,
    },
    {
      id: "sports-2",
      icon: Trophy,
      iconColor: "bg-gradient-to-br from-orange-600 to-amber-600",
      title: "Lakers make NBA playoffs this season?",
      date: "04/15 11:59 PM EST",
      currentPrice: "68%",
      priceLabel: "Playoff Odds",
      volume: "$892K",
      isOfficial: true,
      timeRemaining: 15552000,
    },
    {
      id: "sports-3",
      icon: Trophy,
      iconColor: "bg-gradient-to-br from-red-600 to-rose-600",
      title: "Upset happens this NFL Sunday?",
      date: "10/20 11:59 PM EST",
      currentPrice: "73%",
      priceLabel: "Chaos Factor",
      volume: "$345K",
      isOfficial: false,
      timeRemaining: 259200,
    },
    {
      id: "sports-4",
      icon: Trophy,
      iconColor: "bg-gradient-to-br from-amber-600 to-yellow-600",
      title: "Yankees win World Series 2025?",
      date: "10/30 11:59 PM EST",
      currentPrice: "42%",
      priceLabel: "Championship Odds",
      volume: "$678K",
      isOfficial: true,
      timeRemaining: 1209600,
    },
    {
      id: "sports-5",
      icon: Trophy,
      iconColor: "bg-gradient-to-br from-orange-600 to-red-600",
      title: "Mahomes throws 4+ TDs this week?",
      date: "10/20 11:59 PM EST",
      currentPrice: "56%",
      priceLabel: "Performance Odds",
      volume: "$234K",
      isOfficial: true,
      timeRemaining: 259200,
    },
    {
      id: "sports-6",
      icon: Trophy,
      iconColor: "bg-gradient-to-br from-red-600 to-pink-600",
      title: "Premier League: Man City wins title?",
      date: "05/25 11:59 PM GMT",
      currentPrice: "48%",
      priceLabel: "Title Probability",
      volume: "$1.1M",
      isOfficial: true,
      timeRemaining: 18144000,
    },
  ],

  // Tech - Silicon Sage
  tech: [
    {
      id: "tech-1",
      icon: Cpu,
      iconColor: "bg-gradient-to-br from-cyan-600 to-blue-600",
      title: "OpenAI GPT-5 released by year end?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "37%",
      priceLabel: "Launch Probability",
      volume: "$1.3M",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "tech-2",
      icon: Cpu,
      iconColor: "bg-gradient-to-br from-blue-600 to-indigo-600",
      title: "Apple Vision Pro 2 announced in 2026?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "72%",
      priceLabel: "Release Odds",
      volume: "$892K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "tech-3",
      icon: Cpu,
      iconColor: "bg-gradient-to-br from-indigo-600 to-violet-600",
      title: "Meta AI reaches 1B users?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "54%",
      priceLabel: "Growth Probability",
      volume: "$567K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "tech-4",
      icon: Cpu,
      iconColor: "bg-gradient-to-br from-cyan-600 to-teal-600",
      title: "Tesla FSD reaches Level 5 this year?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "18%",
      priceLabel: "Achievement Odds",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "tech-5",
      icon: Cpu,
      iconColor: "bg-gradient-to-br from-blue-600 to-cyan-600",
      title: "Major tech company announces layoffs?",
      date: "11/15 11:59 PM UTC",
      currentPrice: "63%",
      priceLabel: "Likelihood",
      volume: "$298K",
      isOfficial: false,
      timeRemaining: 2160000,
    },
    {
      id: "tech-6",
      icon: Cpu,
      iconColor: "bg-gradient-to-br from-indigo-600 to-blue-600",
      title: "AI startup valued over $10B this quarter?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "81%",
      priceLabel: "Unicorn Odds",
      volume: "$1.1M",
      isOfficial: true,
      timeRemaining: 5184000,
    },
  ],

  // Food - Chef Nostradamus
  food: [
    {
      id: "food-1",
      icon: ChefHat,
      iconColor: "bg-gradient-to-br from-lime-600 to-green-600",
      title: "Pickle juice lattes go viral?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "23%",
      priceLabel: "Trend Probability",
      volume: "$89K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "food-2",
      icon: ChefHat,
      iconColor: "bg-gradient-to-br from-green-600 to-emerald-600",
      title: "Michelin awards new 3-star in NYC?",
      date: "11/15 11:59 PM EST",
      currentPrice: "67%",
      priceLabel: "Award Odds",
      volume: "$234K",
      isOfficial: true,
      timeRemaining: 2160000,
    },
    {
      id: "food-3",
      icon: ChefHat,
      iconColor: "bg-gradient-to-br from-lime-600 to-cyan-600",
      title: "Avocado prices spike this month?",
      date: "10/31 11:59 PM UTC",
      currentPrice: "78%",
      priceLabel: "Price Surge Odds",
      volume: "$156K",
      isOfficial: false,
      timeRemaining: 1296000,
    },
    {
      id: "food-4",
      icon: ChefHat,
      iconColor: "bg-gradient-to-br from-emerald-600 to-teal-600",
      title: "New food trend on TikTok hits 100M views?",
      date: "10/25 11:59 PM UTC",
      currentPrice: "92%",
      priceLabel: "Viral Certainty",
      volume: "$124K",
      isOfficial: false,
      timeRemaining: 604800,
    },
    {
      id: "food-5",
      icon: ChefHat,
      iconColor: "bg-gradient-to-br from-green-600 to-lime-600",
      title: "Celebrity chef opens in LA this year?",
      date: "12/31 11:59 PM PST",
      currentPrice: "58%",
      priceLabel: "Opening Probability",
      volume: "$198K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "food-6",
      icon: ChefHat,
      iconColor: "bg-gradient-to-br from-cyan-600 to-green-600",
      title: "Plant-based meat sales double?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "41%",
      priceLabel: "Growth Probability",
      volume: "$267K",
      isOfficial: false,
      timeRemaining: 5184000,
    },
  ],

  // Weather - Hurricane Hank
  weather: [
    {
      id: "weather-1",
      icon: Cloud,
      iconColor: "bg-gradient-to-br from-sky-600 to-blue-600",
      title: "Major snowstorm hits Northeast by Nov 15?",
      date: "11/15 11:59 PM EST",
      currentPrice: "45%",
      priceLabel: "Storm Probability",
      volume: "$234K",
      isOfficial: true,
      timeRemaining: 2160000,
    },
    {
      id: "weather-2",
      icon: Cloud,
      iconColor: "bg-gradient-to-br from-blue-600 to-cyan-600",
      title: "Hurricane forms in Atlantic this month?",
      date: "10/31 11:59 PM UTC",
      currentPrice: "67%",
      priceLabel: "Formation Odds",
      volume: "$389K",
      isOfficial: true,
      timeRemaining: 1296000,
    },
    {
      id: "weather-3",
      icon: Cloud,
      iconColor: "bg-gradient-to-br from-cyan-600 to-sky-600",
      title: "Record high temps in California?",
      date: "10/31 11:59 PM PST",
      currentPrice: "82%",
      priceLabel: "Heat Wave Odds",
      volume: "$156K",
      isOfficial: false,
      timeRemaining: 1296000,
    },
    {
      id: "weather-4",
      icon: Cloud,
      iconColor: "bg-gradient-to-br from-sky-600 to-indigo-600",
      title: "El Niño declared for winter season?",
      date: "12/01 11:59 PM UTC",
      currentPrice: "73%",
      priceLabel: "Climate Pattern Odds",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 2592000,
    },
    {
      id: "weather-5",
      icon: Cloud,
      iconColor: "bg-gradient-to-br from-blue-600 to-sky-600",
      title: "Tornado outbreak in Midwest this week?",
      date: "10/20 11:59 PM CST",
      currentPrice: "34%",
      priceLabel: "Severe Weather Odds",
      volume: "$198K",
      isOfficial: true,
      timeRemaining: 259200,
    },
    {
      id: "weather-6",
      icon: Cloud,
      iconColor: "bg-gradient-to-br from-cyan-600 to-blue-600",
      title: "White Christmas in NYC this year?",
      date: "12/25 11:59 PM EST",
      currentPrice: "28%",
      priceLabel: "Snow Probability",
      volume: "$312K",
      isOfficial: false,
      timeRemaining: 6048000,
    },
  ],

  // Real Estate - Property Patty
  realestate: [
    {
      id: "realestate-1",
      icon: Home,
      iconColor: "bg-gradient-to-br from-stone-600 to-slate-600",
      title: "30-year mortgage rates drop below 6%?",
      date: "11/30 11:59 PM EST",
      currentPrice: "42%",
      priceLabel: "Rate Drop Odds",
      volume: "$567K",
      isOfficial: true,
      timeRemaining: 3456000,
    },
    {
      id: "realestate-2",
      icon: Home,
      iconColor: "bg-gradient-to-br from-slate-600 to-gray-600",
      title: "NYC median home price hits $1.5M?",
      date: "12/31 11:59 PM EST",
      currentPrice: "$1.34M",
      priceLabel: "Current Median",
      volume: "$892K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "realestate-3",
      icon: Home,
      iconColor: "bg-gradient-to-br from-stone-600 to-zinc-600",
      title: "Housing bubble bursts in Q4?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "31%",
      priceLabel: "Crash Probability",
      volume: "$1.1M",
      isOfficial: false,
      timeRemaining: 5184000,
    },
    {
      id: "realestate-4",
      icon: Home,
      iconColor: "bg-gradient-to-br from-gray-600 to-slate-600",
      title: "Bay Area home sales increase 20%?",
      date: "11/30 11:59 PM PST",
      currentPrice: "54%",
      priceLabel: "Growth Odds",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 3456000,
    },
    {
      id: "realestate-5",
      icon: Home,
      iconColor: "bg-gradient-to-br from-slate-600 to-stone-600",
      title: "Major city announces rent control?",
      date: "12/15 11:59 PM EST",
      currentPrice: "67%",
      priceLabel: "Policy Probability",
      volume: "$298K",
      isOfficial: false,
      timeRemaining: 4320000,
    },
    {
      id: "realestate-6",
      icon: Home,
      iconColor: "bg-gradient-to-br from-zinc-600 to-gray-600",
      title: "Luxury condo market crashes?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "38%",
      priceLabel: "Crash Odds",
      volume: "$673K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
  ],

  // Dating - Cupid's Algorithm
  dating: [
    {
      id: "dating-1",
      icon: Heart,
      iconColor: "bg-gradient-to-br from-rose-600 to-pink-600",
      title: "Major celebrity engagement announced?",
      date: "11/15 11:59 PM UTC",
      currentPrice: "78%",
      priceLabel: "Romance Odds",
      volume: "$234K",
      isOfficial: false,
      timeRemaining: 2160000,
    },
    {
      id: "dating-2",
      icon: Heart,
      iconColor: "bg-gradient-to-br from-pink-600 to-fuchsia-600",
      title: "Dating app downloads surge 50%?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "62%",
      priceLabel: "Growth Probability",
      volume: "$389K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "dating-3",
      icon: Heart,
      iconColor: "bg-gradient-to-br from-rose-600 to-red-600",
      title: "Valentine's spending breaks records?",
      date: "02/14 11:59 PM UTC",
      currentPrice: "71%",
      priceLabel: "Spending Surge Odds",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 8640000,
    },
    {
      id: "dating-4",
      icon: Heart,
      iconColor: "bg-gradient-to-br from-fuchsia-600 to-pink-600",
      title: "New dating trend goes viral?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "84%",
      priceLabel: "Viral Certainty",
      volume: "$156K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "dating-5",
      icon: Heart,
      iconColor: "bg-gradient-to-br from-pink-600 to-rose-600",
      title: "AI matchmaking becomes mainstream?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "67%",
      priceLabel: "Adoption Odds",
      volume: "$523K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "dating-6",
      icon: Heart,
      iconColor: "bg-gradient-to-br from-red-600 to-rose-600",
      title: "Relationship compatibility test accuracy improves?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "56%",
      priceLabel: "Tech Improvement Odds",
      volume: "$198K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
  ],

  // Fashion - Runway Rita
  fashion: [
    {
      id: "fashion-1",
      icon: Shirt,
      iconColor: "bg-gradient-to-br from-blue-600 to-cyan-600",
      title: "Cargo pants trend peaks in 2026?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "88%",
      priceLabel: "Trend Certainty",
      volume: "$312K",
      isOfficial: false,
      timeRemaining: 5184000,
    },
    {
      id: "fashion-2",
      icon: Shirt,
      iconColor: "bg-gradient-to-br from-purple-600 to-fuchsia-600",
      title: "Paris Fashion Week announces new designer?",
      date: "11/30 11:59 PM CET",
      currentPrice: "73%",
      priceLabel: "Announcement Odds",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 3456000,
    },
    {
      id: "fashion-3",
      icon: Shirt,
      iconColor: "bg-gradient-to-br from-fuchsia-600 to-pink-600",
      title: "Y2K fashion comeback continues?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "92%",
      priceLabel: "Trend Momentum",
      volume: "$234K",
      isOfficial: false,
      timeRemaining: 5184000,
    },
    {
      id: "fashion-4",
      icon: Shirt,
      iconColor: "bg-gradient-to-br from-violet-600 to-indigo-600",
      title: "Sustainable fashion sales double?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "64%",
      priceLabel: "Growth Probability",
      volume: "$567K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "fashion-5",
      icon: Shirt,
      iconColor: "bg-gradient-to-br from-purple-600 to-violet-600",
      title: "Major brand launches Web3 collection?",
      date: "11/15 11:59 PM UTC",
      currentPrice: "51%",
      priceLabel: "Launch Odds",
      volume: "$298K",
      isOfficial: false,
      timeRemaining: 2160000,
    },
    {
      id: "fashion-6",
      icon: Shirt,
      iconColor: "bg-gradient-to-br from-fuchsia-600 to-violet-600",
      title: "Met Gala 2026 theme leaked early?",
      date: "12/01 11:59 PM EST",
      currentPrice: "43%",
      priceLabel: "Leak Probability",
      volume: "$189K",
      isOfficial: false,
      timeRemaining: 2592000,
    },
  ],

  // Gaming - Console Carl
  gaming: [
    {
      id: "gaming-1",
      icon: Gamepad2,
      iconColor: "bg-gradient-to-br from-indigo-600 to-blue-600",
      title: "GTA 6 release date announced?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "76%",
      priceLabel: "Announcement Odds",
      volume: "$1.2M",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "gaming-2",
      icon: Gamepad2,
      iconColor: "bg-gradient-to-br from-blue-600 to-cyan-600",
      title: "LoL Worlds viewership breaks record?",
      date: "11/15 11:59 PM UTC",
      currentPrice: "68%",
      priceLabel: "Record Probability",
      volume: "$892K",
      isOfficial: true,
      timeRemaining: 2160000,
    },
    {
      id: "gaming-3",
      icon: Gamepad2,
      iconColor: "bg-gradient-to-br from-cyan-600 to-indigo-600",
      title: "Nintendo Switch 2 announced by year end?",
      date: "12/31 11:59 PM JST",
      currentPrice: "54%",
      priceLabel: "Launch Odds",
      volume: "$1.1M",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "gaming-4",
      icon: Gamepad2,
      iconColor: "bg-gradient-to-br from-indigo-600 to-violet-600",
      title: "Fortnite player wins $1M tournament?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "82%",
      priceLabel: "Prize Odds",
      volume: "$567K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "gaming-5",
      icon: Gamepad2,
      iconColor: "bg-gradient-to-br from-blue-600 to-indigo-600",
      title: "Call of Duty breaks sales record?",
      date: "12/15 11:59 PM UTC",
      currentPrice: "61%",
      priceLabel: "Sales Probability",
      volume: "$734K",
      isOfficial: true,
      timeRemaining: 4320000,
    },
    {
      id: "gaming-6",
      icon: Gamepad2,
      iconColor: "bg-gradient-to-br from-cyan-600 to-blue-600",
      title: "Gaming PC sales surge 30%?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "47%",
      priceLabel: "Growth Odds",
      volume: "$445K",
      isOfficial: false,
      timeRemaining: 5184000,
    },
  ],

  // Music - Vinyl Victor
  music: [
    {
      id: "music-1",
      icon: Music,
      iconColor: "bg-gradient-to-br from-purple-600 to-indigo-600",
      title: "Drake drops surprise album?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "65%",
      priceLabel: "Release Odds",
      volume: "$892K",
      isOfficial: false,
      timeRemaining: 5184000,
    },
    {
      id: "music-2",
      icon: Music,
      iconColor: "bg-gradient-to-br from-indigo-600 to-blue-600",
      title: "Concert ticket prices drop 20%?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "23%",
      priceLabel: "Price Drop Odds",
      volume: "$567K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "music-3",
      icon: Music,
      iconColor: "bg-gradient-to-br from-blue-600 to-purple-600",
      title: "TikTok sound hits #1 on Billboard?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "88%",
      priceLabel: "Chart Success Odds",
      volume: "$445K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "music-4",
      icon: Music,
      iconColor: "bg-gradient-to-br from-purple-600 to-fuchsia-600",
      title: "Grammys announce new category?",
      date: "11/15 11:59 PM EST",
      currentPrice: "52%",
      priceLabel: "Announcement Odds",
      volume: "$298K",
      isOfficial: true,
      timeRemaining: 2160000,
    },
    {
      id: "music-5",
      icon: Music,
      iconColor: "bg-gradient-to-br from-indigo-600 to-purple-600",
      title: "Vinyl sales surpass CDs?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "71%",
      priceLabel: "Sales Flip Odds",
      volume: "$623K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "music-6",
      icon: Music,
      iconColor: "bg-gradient-to-br from-blue-600 to-indigo-600",
      title: "One-hit wonder emerges this month?",
      date: "10/31 11:59 PM UTC",
      currentPrice: "94%",
      priceLabel: "Viral Track Odds",
      volume: "$189K",
      isOfficial: false,
      timeRemaining: 1296000,
    },
  ],

  // Travel - Wanderlust Wanda
  travel: [
    {
      id: "travel-1",
      icon: Plane,
      iconColor: "bg-gradient-to-br from-teal-600 to-cyan-600",
      title: "Japan tourism hits record highs?",
      date: "12/31 11:59 PM JST",
      currentPrice: "82%",
      priceLabel: "Record Odds",
      volume: "$567K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "travel-2",
      icon: Plane,
      iconColor: "bg-gradient-to-br from-cyan-600 to-blue-600",
      title: "Flight prices drop 30% by year end?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "34%",
      priceLabel: "Price Drop Odds",
      volume: "$892K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "travel-3",
      icon: Plane,
      iconColor: "bg-gradient-to-br from-blue-600 to-teal-600",
      title: "New hidden gem destination goes viral?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "91%",
      priceLabel: "Viral Certainty",
      volume: "$234K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "travel-4",
      icon: Plane,
      iconColor: "bg-gradient-to-br from-teal-600 to-emerald-600",
      title: "Europe travel restrictions lifted?",
      date: "11/15 11:59 PM CET",
      currentPrice: "78%",
      priceLabel: "Policy Change Odds",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 2160000,
    },
    {
      id: "travel-5",
      icon: Plane,
      iconColor: "bg-gradient-to-br from-cyan-600 to-teal-600",
      title: "Bali gets overrun by influencers?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "96%",
      priceLabel: "Overcrowding Odds",
      volume: "$156K",
      isOfficial: false,
      timeRemaining: 5184000,
    },
    {
      id: "travel-6",
      icon: Plane,
      iconColor: "bg-gradient-to-br from-blue-600 to-cyan-600",
      title: "Airline launches new budget routes?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "67%",
      priceLabel: "Expansion Odds",
      volume: "$389K",
      isOfficial: true,
      timeRemaining: 3456000,
    },
  ],

  // Memes - Meme Lord Max
  memes: [
    {
      id: "memes-1",
      icon: Laugh,
      iconColor: "bg-gradient-to-br from-yellow-600 to-orange-600",
      title: "2012 meme format makes comeback?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "73%",
      priceLabel: "Revival Odds",
      volume: "$234K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "memes-2",
      icon: Laugh,
      iconColor: "bg-gradient-to-br from-orange-600 to-red-600",
      title: "New meme coin pumps 1000%?",
      date: "11/15 11:59 PM UTC",
      currentPrice: "42%",
      priceLabel: "Pump Probability",
      volume: "$892K",
      isOfficial: false,
      timeRemaining: 2160000,
    },
    {
      id: "memes-3",
      icon: Laugh,
      iconColor: "bg-gradient-to-br from-yellow-600 to-amber-600",
      title: "TikTok meme hits 1B views?",
      date: "10/31 11:59 PM UTC",
      currentPrice: "88%",
      priceLabel: "Viral Certainty",
      volume: "$445K",
      isOfficial: false,
      timeRemaining: 1296000,
    },
    {
      id: "memes-4",
      icon: Laugh,
      iconColor: "bg-gradient-to-br from-red-600 to-orange-600",
      title: "Dank meme becomes mainstream?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "95%",
      priceLabel: "Normie Conversion",
      volume: "$156K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "memes-5",
      icon: Laugh,
      iconColor: "bg-gradient-to-br from-orange-600 to-yellow-600",
      title: "Celebrity accidentally creates meme?",
      date: "10/25 11:59 PM UTC",
      currentPrice: "91%",
      priceLabel: "Chaos Odds",
      volume: "$298K",
      isOfficial: false,
      timeRemaining: 604800,
    },
    {
      id: "memes-6",
      icon: Laugh,
      iconColor: "bg-gradient-to-br from-amber-600 to-orange-600",
      title: "Reddit meme war breaks out?",
      date: "11/15 11:59 PM UTC",
      currentPrice: "67%",
      priceLabel: "War Probability",
      volume: "$234K",
      isOfficial: false,
      timeRemaining: 2160000,
    },
  ],

  // Wellness - Chakra Charlie
  wellness: [
    {
      id: "wellness-1",
      icon: Star,
      iconColor: "bg-gradient-to-br from-teal-600 to-cyan-600",
      title: "Meditation app users double?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "64%",
      priceLabel: "Growth Odds",
      volume: "$389K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "wellness-2",
      icon: Star,
      iconColor: "bg-gradient-to-br from-cyan-600 to-teal-600",
      title: "Yoga studio opens in your neighborhood?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "78%",
      priceLabel: "Expansion Odds",
      volume: "$156K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "wellness-3",
      icon: Star,
      iconColor: "bg-gradient-to-br from-teal-600 to-emerald-600",
      title: "Wellness retreat bookings surge?",
      date: "12/15 11:59 PM UTC",
      currentPrice: "71%",
      priceLabel: "Booking Surge Odds",
      volume: "$234K",
      isOfficial: true,
      timeRemaining: 4320000,
    },
    {
      id: "wellness-4",
      icon: Star,
      iconColor: "bg-gradient-to-br from-emerald-600 to-teal-600",
      title: "Sound bath trend goes mainstream?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "56%",
      priceLabel: "Trend Adoption",
      volume: "$189K",
      isOfficial: false,
      timeRemaining: 3456000,
    },
    {
      id: "wellness-5",
      icon: Star,
      iconColor: "bg-gradient-to-br from-cyan-600 to-emerald-600",
      title: "Mental health app downloads triple?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "67%",
      priceLabel: "Growth Probability",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "wellness-6",
      icon: Star,
      iconColor: "bg-gradient-to-br from-teal-600 to-cyan-600",
      title: "Ice bath challenge goes viral?",
      date: "11/15 11:59 PM UTC",
      currentPrice: "83%",
      priceLabel: "Viral Odds",
      volume: "$267K",
      isOfficial: false,
      timeRemaining: 2160000,
    },
  ],

  // Space - Galactic Gary
  space: [
    {
      id: "space-1",
      icon: Star,
      iconColor: "bg-gradient-to-br from-slate-600 to-indigo-600",
      title: "SpaceX Mars mission announced?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "48%",
      priceLabel: "Announcement Odds",
      volume: "$1.1M",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "space-2",
      icon: Star,
      iconColor: "bg-gradient-to-br from-indigo-600 to-purple-600",
      title: "Alien signal detected?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "2%",
      priceLabel: "Discovery Odds",
      volume: "$892K",
      isOfficial: false,
      timeRemaining: 5184000,
    },
    {
      id: "space-3",
      icon: Star,
      iconColor: "bg-gradient-to-br from-slate-600 to-blue-600",
      title: "James Webb discovers habitable planet?",
      date: "12/31 11:59 PM UTC",
      currentPrice: "34%",
      priceLabel: "Discovery Probability",
      volume: "$567K",
      isOfficial: true,
      timeRemaining: 5184000,
    },
    {
      id: "space-4",
      icon: Star,
      iconColor: "bg-gradient-to-br from-purple-600 to-indigo-600",
      title: "SpaceX Starship reaches orbit?",
      date: "11/30 11:59 PM UTC",
      currentPrice: "76%",
      priceLabel: "Mission Success Odds",
      volume: "$734K",
      isOfficial: true,
      timeRemaining: 3456000,
    },
    {
      id: "space-5",
      icon: Star,
      iconColor: "bg-gradient-to-br from-indigo-600 to-slate-600",
      title: "Asteroid near-miss this month?",
      date: "10/31 11:59 PM UTC",
      currentPrice: "12%",
      priceLabel: "Close Approach Odds",
      volume: "$298K",
      isOfficial: false,
      timeRemaining: 1296000,
    },
    {
      id: "space-6",
      icon: Star,
      iconColor: "bg-gradient-to-br from-blue-600 to-slate-600",
      title: "NASA announces new moon mission?",
      date: "12/15 11:59 PM UTC",
      currentPrice: "61%",
      priceLabel: "Announcement Odds",
      volume: "$445K",
      isOfficial: true,
      timeRemaining: 4320000,
    },
  ],
};

// Helper function to get bets for a specific oracle
export function getBetsForOracle(oracleId: string, userCreatedMarkets: any[] = []): PredictionBet[] {
  const defaultBets = oracleBets[oracleId] || oracleBets.crypto; // Default to crypto if oracle not found
  
  // Filter user-created markets for this oracle
  const userBetsForOracle = userCreatedMarkets
    .filter(market => market.oracleId === oracleId)
    .map(market => ({
      id: market.id,
      icon: Users, // Use the actual Users component
      iconColor: market.iconColor,
      title: market.title,
      date: market.date,
      currentPrice: market.currentPrice,
      priceLabel: market.priceLabel || "Yes Probability",
      volume: market.volume,
      isOfficial: market.isOfficial,
      timeRemaining: market.timeRemaining,
    }));
  
  // Combine user-created markets at the beginning (after the "Create Market" banner)
  return [...userBetsForOracle, ...defaultBets];
}

// Helper function to find a bet by ID across all oracles and user-created markets
export function findBetById(betId: string, userCreatedMarkets: any[] = []): PredictionBet | null {
  // First check user-created markets
  const userMarket = userCreatedMarkets.find(market => market.id === betId);
  if (userMarket) {
    return {
      id: userMarket.id,
      icon: Users,
      iconColor: userMarket.iconColor,
      title: userMarket.title,
      date: userMarket.date,
      currentPrice: userMarket.currentPrice,
      priceLabel: userMarket.priceLabel || "Yes Probability",
      volume: userMarket.volume,
      isOfficial: userMarket.isOfficial,
      timeRemaining: userMarket.timeRemaining,
    };
  }
  
  // Then check default oracle bets
  for (const [oracleId, bets] of Object.entries(oracleBets)) {
    const bet = bets.find(b => b.id === betId);
    if (bet) {
      return bet;
    }
  }
  
  return null;
}

// Export default bets (crypto) for backward compatibility
export const sampleBets = oracleBets.crypto;
