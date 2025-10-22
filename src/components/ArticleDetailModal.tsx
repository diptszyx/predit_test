import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { NewsItem } from "./NewsCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, Zap, ExternalLink, Sparkles, BarChart3, Clock } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface ArticleDetailModalProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleDetailModal({ news, isOpen, onClose }: ArticleDetailModalProps) {
  if (!news) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          {/* Header Image */}
          {news.imageUrl && (
            <div className="relative h-64 w-full overflow-hidden">
              <img 
                src={news.imageUrl} 
                alt={news.headline}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          )}

          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{news.source}</Badge>
                <span className="text-sm text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {news.timestamp}
                </div>
                <div className="ml-auto">
                  {getSentimentIcon()}
                </div>
              </div>
              <DialogTitle className="text-left">{news.headline}</DialogTitle>
            </DialogHeader>

            {/* AI Key Takeaways */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h4 className="text-blue-400">AI-Generated Key Takeaways</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Market sentiment indicates {news.sentiment} outlook with {news.rippleEffect} impact potential</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{news.marketImpact}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Recommended for traders monitoring {news.category} sectors</span>
                </li>
              </ul>
            </div>

            {/* Article Summary */}
            <div className="space-y-3">
              <p className="text-muted-foreground">{news.summary}</p>
              <p className="text-muted-foreground">
                This development has significant implications for market participants. Traders should monitor related 
                indicators and adjust positions accordingly. The ripple effect across connected markets could create 
                both opportunities and risks in the coming days.
              </p>
              <p className="text-muted-foreground">
                Historical analysis suggests similar events have led to measurable market movements, with an average 
                duration of 2-3 weeks before stabilization. Current Polymarket odds reflect this uncertainty, offering 
                potential value for informed traders.
              </p>
            </div>

            {/* Ripple Effect Analysis */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h4>Ripple Effect Analysis</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Market Impact Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          news.rippleEffect === "high" ? "bg-red-500 w-5/6" :
                          news.rippleEffect === "medium" ? "bg-yellow-500 w-3/5" :
                          "bg-blue-500 w-2/5"
                        }`}
                      />
                    </div>
                    <span className="text-sm uppercase">{news.rippleEffect}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Sentiment Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-4/5" />
                    </div>
                    <span className="text-sm">82%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Polymarket Integration */}
            {news.polymarketOdds && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-emerald-400">Related Polymarket Data</h4>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {news.polymarketOdds}% Odds
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Current market consensus suggests {news.polymarketOdds}% probability. 
                  Volume has increased 34% in the last 24 hours, indicating strong trader interest.
                </p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Full Market Data
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Historical Comparison */}
            <div className="border-t border-border pt-4">
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare with Historical Similar Events
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
