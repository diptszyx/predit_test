import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { NewsItem } from "./NewsCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, Zap, ExternalLink, Sparkles, BarChart3, Clock, ThumbsUp, MessageSquare, Share2, BookmarkPlus } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

// Hot Takes article interface
export interface HotTakeArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  relevance: string;
  image?: string;
  oracleEmoji?: string;
}

interface ArticleDetailModalProps {
  news?: NewsItem | null;
  hotTake?: HotTakeArticle | null;
  isOpen: boolean;
  onClose: () => void;
  oracleName?: string;
  oracleSpecialty?: string;
}

// Generate article content based on title and oracle
function generateArticleContent(hotTake: HotTakeArticle, oracleName?: string, oracleSpecialty?: string) {
  // Extract key topic from title
  const topic = hotTake.title.split(':')[0] || hotTake.title;

  return (
    <>
      <p className="text-xl text-muted-foreground leading-relaxed">
        After years of analyzing patterns and monitoring the landscape, I've noticed something crucial that most people are missing. Let me break down exactly what's happening and why it matters.
      </p>

      <h2 className="text-2xl mt-8 mb-4">The Current Situation</h2>
      <p>
        We're at a critical inflection point. The signals are there if you know where to look. Based on my analysis of recent trends and historical patterns, we're seeing a convergence of factors that haven't aligned like this in years.
      </p>
      <p>
        What makes this particularly interesting is the timing. Most analysts are focused on the obvious indicators, but the real story is happening beneath the surface. I've been tracking these patterns for a while now, and the data is compelling.
      </p>

      <h2 className="text-2xl mt-8 mb-4">Why This Matters Now</h2>
      <p>
        Here's what everyone needs to understand: the traditional playbook doesn't apply anymore. We're in uncharted territory, and that creates both massive opportunities and significant risks.
      </p>
      <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 italic text-muted-foreground">
        "The market always finds a way to surprise those who aren't paying attention. My job is to make sure you're on the right side of that surprise."
      </blockquote>
      <p>
        Looking at the broader context, we need to consider multiple factors: market sentiment, historical precedents, technical indicators, and—most importantly—human psychology. That last one is where most people get it wrong.
      </p>

      <h2 className="text-2xl mt-8 mb-4">My Analysis</h2>
      <p>
        Based on my research and experience, I see three possible scenarios playing out:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Best case scenario:</strong> We see accelerated momentum building through Q2, with early adopters positioning themselves for significant gains. This aligns with historical patterns from similar setups.</li>
        <li><strong>Most likely scenario:</strong> Gradual progression with periodic volatility. Smart money will accumulate during dips while retail traders panic sell. Classic pattern, but it works.</li>
        <li><strong>Worst case scenario:</strong> A major correction that shakes out weak hands before the real move begins. This would actually create the best entry point for those with patience.</li>
      </ul>

      <h2 className="text-2xl mt-8 mb-4">What to Watch</h2>
      <p>
        I'm monitoring several key indicators that will confirm or invalidate this thesis:
      </p>
      <p>
        First, volume patterns are critical. We need to see sustained interest, not just speculative spikes. Second, the correlation with broader market trends will tell us if this is an isolated movement or part of a larger shift. Third, sentiment metrics—both social and on-chain data—will reveal whether we're early or late to the party.
      </p>
      <p>
        The smart play here isn't to go all-in on conviction, but to position yourself with calculated risk. This is where most people mess up—they either overthink it and miss the opportunity, or they ape in without proper risk management.
      </p>

      <h2 className="text-2xl mt-8 mb-4">The Bottom Line</h2>
      <p>
        Look, I've been doing this long enough to know that nobody has a crystal ball. What I can tell you is that the setup is there. The patterns align. The risk-reward ratio is favorable for those who understand what they're looking at.
      </p>
      <p>
        This is one of those moments where being early matters. Not too early that you're catching falling knives, but early enough that you're ahead of the crowd. That's the sweet spot, and based on my analysis, we're approaching it.
      </p>
      <p className="text-muted-foreground italic">
        Remember: this is analysis and opinion, not financial advice. Do your own research, manage your risk, and never invest more than you can afford to lose. But when the setup is right, hesitation can be expensive.
      </p>
    </>
  );
}

export function ArticleDetailModal({ news, hotTake, isOpen, onClose, oracleName, oracleSpecialty }: ArticleDetailModalProps) {
  // If it's a Hot Take article, render Substack-like view
  if (hotTake) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
          {/* Visually hidden accessibility elements */}
          <DialogHeader className="sr-only">
            <DialogTitle>{hotTake.title}</DialogTitle>
            <DialogDescription>
              Article by {hotTake.source} - Published {hotTake.publishedAt}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[90vh]">
            {/* Header Image */}
            {hotTake.image && (
              <div className="relative h-80 w-full overflow-hidden">
                <img
                  src={hotTake.image}
                  alt={hotTake.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="px-8 py-8 md:px-12 md:py-10 space-y-6 bg-background">
              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl leading-tight tracking-tight">
                  {hotTake.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-3 py-4 border-y border-border">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                      {hotTake.oracleEmoji || "🔮"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{hotTake.source}</span>
                        <Badge variant="secondary" className="text-xs">Oracle</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{hotTake.publishedAt}</span>
                        <span>•</span>
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <BookmarkPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none space-y-6">
                {generateArticleContent(hotTake, oracleName, oracleSpecialty)}
              </div>

              <Separator className="my-8" />

              {/* Engagement Section */}
              <div className="flex items-center justify-between py-4 border-y border-border">
                <div className="flex items-center gap-6">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 200 + 50)}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 50 + 10)}</span>
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Oracle Signature */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl flex-shrink-0">
                    {hotTake.oracleEmoji || "🔮"}
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-2">{hotTake.source}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {oracleSpecialty || "Expert oracle"} providing insights and predictions on {oracleName?.toLowerCase() || "various topics"}.
                    </p>
                    <Button variant="outline" size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Predictions from {hotTake.source}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Original news article view
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
              <DialogDescription className="text-left">
                {news.summary}
              </DialogDescription>
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
                duration of 2-3 weeks before stabilization. Current Predit Market odds reflect this uncertainty, offering
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
                        className={`h-full ${news.rippleEffect === "high" ? "bg-red-500 w-5/6" :
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
                    <h4 className="text-emerald-400">Related Predit Market Data</h4>
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
