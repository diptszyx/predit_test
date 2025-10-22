import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trophy, Zap, Sparkles, TrendingUp, Gift, Star, Flame, Target, Award, Rocket, Crown, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface Banner {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  gradient: string;
  buttonText: string;
  onAction: () => void;
}

interface RotatingBannersProps {
  onNavigate: (page: string) => void;
}

export function RotatingBanners({ onNavigate }: RotatingBannersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners: Banner[] = [
    {
      id: 1,
      icon: Trophy,
      badge: "Live Now",
      badgeColor: "bg-purple-500/20 border-purple-500/30 text-purple-300",
      title: "Genesis Oracle Clash - Season 1",
      description: "Join a house (3 switches allowed before Nov 20). Top house wins exclusive rewards",
      gradient: "from-purple-600/10 via-pink-600/10 to-blue-600/10",
      buttonText: "Join the Clash",
      onAction: () => onNavigate("houses"),
    },
    {
      id: 2,
      icon: Zap,
      badge: "New Feature",
      badgeColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300",
      title: "Instant Predictions Unlocked",
      description: "Get lightning-fast AI predictions with our new Turbo Mode - 10x faster responses",
      gradient: "from-yellow-600/10 via-orange-600/10 to-red-600/10",
      buttonText: "Try Turbo Mode",
      onAction: () => onNavigate("oracles"),
    },
    {
      id: 3,
      icon: Sparkles,
      badge: "Premium",
      badgeColor: "bg-blue-500/20 border-blue-500/30 text-blue-300",
      title: "Unlock VIP Oracle Access",
      description: "Get exclusive predictions, priority support, and 50% more daily consultations",
      gradient: "from-blue-600/10 via-indigo-600/10 to-purple-600/10",
      buttonText: "Upgrade Now",
      onAction: () => onNavigate("subscription"),
    },
    {
      id: 4,
      icon: TrendingUp,
      badge: "Hot Market",
      badgeColor: "bg-green-500/20 border-green-500/30 text-green-300",
      title: "Crypto Bull Run Predictions Live",
      description: "Bitcoin, Ethereum, and altcoin predictions with 87% historical accuracy",
      gradient: "from-green-600/10 via-emerald-600/10 to-teal-600/10",
      buttonText: "See Predictions",
      onAction: () => onNavigate("marketplace"),
    },
    {
      id: 5,
      icon: Gift,
      badge: "Limited Time",
      badgeColor: "bg-pink-500/20 border-pink-500/30 text-pink-300",
      title: "200% Welcome Bonus",
      description: "New users get triple XP on first week - Limited to first 1000 users",
      gradient: "from-pink-600/10 via-rose-600/10 to-red-600/10",
      buttonText: "Claim Bonus",
      onAction: () => onNavigate("subscription"),
    },
    {
      id: 6,
      icon: Star,
      badge: "Trending",
      badgeColor: "bg-orange-500/20 border-orange-500/30 text-orange-300",
      title: "2025 Tech Giants Predictions",
      description: "Apple, Google, Tesla, and Meta stock predictions for Q1 2025",
      gradient: "from-orange-600/10 via-amber-600/10 to-yellow-600/10",
      buttonText: "View Predictions",
      onAction: () => onNavigate("marketplace"),
    },
    {
      id: 7,
      icon: Flame,
      badge: "Switch Now",
      badgeColor: "bg-red-500/20 border-red-500/30 text-red-300",
      title: "House Switching Available Until Nov 20",
      description: "Use your 3 switches wisely! After Nov 20, all houses lock for Season 1 end",
      gradient: "from-red-600/10 via-orange-600/10 to-yellow-600/10",
      buttonText: "Switch House",
      onAction: () => onNavigate("houses"),
    },
    {
      id: 8,
      icon: Target,
      badge: "Challenge",
      badgeColor: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
      title: "Weekly Prediction Challenge",
      description: "Win exclusive rewards by correctly predicting 5 events this week",
      gradient: "from-cyan-600/10 via-blue-600/10 to-indigo-600/10",
      buttonText: "Accept Challenge",
      onAction: () => onNavigate("marketplace"),
    },
    {
      id: 9,
      icon: Award,
      badge: "Leaderboard",
      badgeColor: "bg-violet-500/20 border-violet-500/30 text-violet-300",
      title: "Top Predictors Get Rewards",
      description: "Monthly leaderboard: Top 100 users share exclusive prizes",
      gradient: "from-violet-600/10 via-purple-600/10 to-fuchsia-600/10",
      buttonText: "View Rankings",
      onAction: () => onNavigate("dashboard"),
    },
    {
      id: 10,
      icon: Rocket,
      badge: "New Release",
      badgeColor: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
      title: "AI Oracle Leveling System",
      description: "Level up your favorite oracles for better predictions and exclusive insights",
      gradient: "from-indigo-600/10 via-blue-600/10 to-cyan-600/10",
      buttonText: "Level Up",
      onAction: () => onNavigate("oracles"),
    },
    {
      id: 11,
      icon: Crown,
      badge: "Elite",
      badgeColor: "bg-amber-500/20 border-amber-500/30 text-amber-300",
      title: "VIP Elite Club Access",
      description: "Premium members get exclusive predictions and alpha calls",
      gradient: "from-amber-600/10 via-yellow-600/10 to-orange-600/10",
      buttonText: "Learn More",
      onAction: () => onNavigate("subscription"),
    },
    {
      id: 12,
      icon: Coins,
      badge: "Member Perks",
      badgeColor: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
      title: "Daily Quest Rewards",
      description: "Complete daily quests and earn XP multipliers - New challenges every day",
      gradient: "from-emerald-600/10 via-green-600/10 to-teal-600/10",
      buttonText: "Start Staking",
      onAction: () => onNavigate("dashboard"),
    },
  ];

  // Calculate how many pairs we have (showing 2 at a time)
  const totalPairs = Math.ceil(banners.length / 2);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const scrollNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPairs);
  };

  const scrollPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPairs) % totalPairs);
  };

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  // Calculate which banners to show
  const startIdx = currentIndex * 2;
  const visibleBanners = [
    banners[startIdx % banners.length],
    banners[(startIdx + 1) % banners.length],
  ];

  return (
    <div className="mb-8 relative group">
      {/* Scroll buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Banner container */}
      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {Array.from({ length: totalPairs }).map((_, pairIndex) => {
            const firstIdx = pairIndex * 2;
            const secondIdx = firstIdx + 1;
            const firstBanner = banners[firstIdx % banners.length];
            const secondBanner = secondIdx < banners.length ? banners[secondIdx] : null;

            return (
              <div key={pairIndex} className="flex gap-4 flex-shrink-0 w-full">
                {/* First banner */}
                <div
                  className={`flex-shrink-0 w-[calc(50%-0.5rem)] p-4 md:p-5 rounded-xl bg-gradient-to-r ${firstBanner.gradient} border border-purple-500/30 hover:border-purple-500/50 transition-all`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <firstBanner.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <Badge variant="outline" className={`${firstBanner.badgeColor} text-xs`}>
                        {firstBanner.badge}
                      </Badge>
                    </div>
                    <h3 className="text-base md:text-lg mb-1 line-clamp-1">{firstBanner.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">
                      {firstBanner.description}
                    </p>
                    <Button
                      onClick={firstBanner.onAction}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white w-full text-xs md:text-sm"
                    >
                      {firstBanner.buttonText}
                    </Button>
                  </div>
                </div>

                {/* Second banner */}
                {secondBanner && (
                  <div
                    className={`flex-shrink-0 w-[calc(50%-0.5rem)] p-4 md:p-5 rounded-xl bg-gradient-to-r ${secondBanner.gradient} border border-purple-500/30 hover:border-purple-500/50 transition-all`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <secondBanner.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <Badge variant="outline" className={`${secondBanner.badgeColor} text-xs`}>
                          {secondBanner.badge}
                        </Badge>
                      </div>
                      <h3 className="text-base md:text-lg mb-1 line-clamp-1">{secondBanner.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">
                        {secondBanner.description}
                      </p>
                      <Button
                        onClick={secondBanner.onAction}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white w-full text-xs md:text-sm"
                      >
                        {secondBanner.buttonText}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {Array.from({ length: totalPairs }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              currentIndex === idx 
                ? "bg-purple-500 w-6" 
                : "bg-gray-600/50 hover:bg-gray-500"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
