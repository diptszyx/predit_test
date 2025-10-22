import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Zap, ExternalLink, Clock } from "lucide-react";
import { Button } from "./ui/button";

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  timestamp: string;
  category: "politics" | "economics" | "both";
  sentiment: "bullish" | "bearish" | "neutral";
  rippleEffect: "high" | "medium" | "low";
  marketImpact: string;
  polymarketOdds?: number;
  imageUrl?: string;
}

interface NewsCardProps {
  news: NewsItem;
  onClick: () => void;
}

export function NewsCard({ news, onClick }: NewsCardProps) {
  const getSentimentIcon = () => {
    switch (news.sentiment) {
      case "bullish":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "bearish":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRippleColor = () => {
    switch (news.rippleEffect) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-border bg-card group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {news.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={news.imageUrl} 
              alt={news.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <Badge className={`${getRippleColor()} border backdrop-blur-sm`}>
                <Zap className="w-3 h-3 mr-1" />
                {news.rippleEffect.toUpperCase()} IMPACT
              </Badge>
            </div>
          </div>
        )}
        
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{news.source}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {news.timestamp}
                </div>
              </div>
              <h3 className="mb-2 group-hover:text-blue-400 transition-colors">
                {news.headline}
              </h3>
            </div>
            <div className="flex-shrink-0">
              {getSentimentIcon()}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3">
            {news.summary}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {news.category === "both" ? "Politics & Economics" : news.category.charAt(0).toUpperCase() + news.category.slice(1)}
              </Badge>
            </div>
            
            {news.polymarketOdds && (
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-blue-400 hover:text-blue-300">
                <span>View Market</span>
                <span className="text-emerald-400">{news.polymarketOdds}%</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>

          {news.marketImpact && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-400">
                  <span className="opacity-70">Ripple Effect:</span> {news.marketImpact}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
