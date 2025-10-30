import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Sparkles, TrendingUp, BarChart3, ArrowLeft, Mic } from "lucide-react";
import { NewsItem } from "./NewsCard";

interface OracleDetailPageProps {
  type: "politics" | "economics";
  news: NewsItem[];
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "oracle";
  content: string;
  timestamp: string;
}

export function OracleDetailPage({ type, news, onBack }: OracleDetailPageProps) {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "oracle",
      content: `Hello! I'm the ${type === "crypto-crystal" ? "Crypto Crystal Czar" : "Economics"} Oracle. I analyze ${type === "crypto-crystal" ? "cryptocurrency markets, blockchain technology, and DeFi protocols" : "economic indicators, market trends, and financial data"} to help you make informed trading decisions. Ask me anything!`,
      timestamp: "Just now"
    }
  ]);

  const oracleDetails = type === "crypto-crystal" 
    ? {
        name: "Crypto Crystal Czar",
        avatar: "💎",
        gradient: "from-cyan-500 to-blue-600",
        description: "Expert in cryptocurrency markets and blockchain technology"
      }
    : {
        name: "Economics Oracle",
        avatar: "📊",
        gradient: "from-emerald-600 to-teal-700",
        description: "Specialized in economic indicators and market analysis"
      };

  const handleSendQuery = () => {
    if (!query.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: "Just now"
    };

    // Generate mock Oracle response
    const oracleResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "oracle",
      content: `Based on current data analysis, ${query.toLowerCase().includes("election") ? "the election dynamics show increased volatility with key swing states remaining competitive. Market sentiment suggests a 52% probability for the current outcome." : query.toLowerCase().includes("rate") || query.toLowerCase().includes("fed") ? "the Federal Reserve's stance indicates potential policy shifts. Market participants are pricing in a 68% chance of rate adjustments in Q2 2025." : "I've analyzed the relevant data and market indicators. The ripple effect suggests moderate to high impact on related betting markets with confidence levels around 75%."}`,
      timestamp: "Just now"
    };

    setChatHistory([...chatHistory, userMessage, oracleResponse]);
    setQuery("");
  };

  const filteredNews = news.filter(n => 
    n.category === type || n.category === "both"
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${oracleDetails.gradient} flex items-center justify-center text-3xl shadow-lg`}>
              {oracleDetails.avatar}
            </div>
            <div>
              <h1>{oracleDetails.name}</h1>
              <p className="text-sm text-muted-foreground">{oracleDetails.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h3>Ask the Oracle</h3>
                </div>
                
                <ScrollArea className="h-96 pr-4 mb-4">
                  <div className="space-y-4">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl p-4 ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-accent"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'Summarize latest US election polls'"
                    onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon">
                    <Mic className="w-5 h-5" />
                  </Button>
                  <Button onClick={handleSendQuery}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Query Suggestions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(type === "politics" 
                    ? ["Latest polls", "Election forecast", "Geopolitical risks"]
                    : ["Fed rate outlook", "Inflation trends", "Market sentiment"]
                  ).map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Curated News Clusters */}
            <div>
              <h3 className="mb-4">Curated Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNews.map((item) => (
                  <Card key={item.id} className="border-border bg-card hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-4">
                      {item.imageUrl && (
                        <div className="relative h-32 -mx-4 -mt-4 mb-3 overflow-hidden rounded-t-xl">
                          <img src={item.imageUrl} alt={item.headline} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <h4 className="mb-2 line-clamp-2">{item.headline}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {item.sentiment}
                        </Badge>
                        {item.polymarketOdds && (
                          <span className="text-sm text-emerald-400">
                            {item.polymarketOdds}% odds
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Insights & Markets */}
          <div className="space-y-4">
            {/* Market Psychology */}
            <Card className="border-border bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h4>Market Sentiment</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Bullish</span>
                      <span className="text-emerald-400">65%</span>
                    </div>
                    <div className="h-2 bg-accent rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[65%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Bearish</span>
                      <span className="text-red-400">20%</span>
                    </div>
                    <div className="h-2 bg-accent rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[20%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Neutral</span>
                      <span className="text-gray-400">15%</span>
                    </div>
                    <div className="h-2 bg-accent rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 w-[15%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Polymarket Bets */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <h4>Top Markets</h4>
                </div>
                <div className="space-y-3">
                  {filteredNews.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 bg-accent rounded-lg">
                      <p className="text-sm mb-2 line-clamp-2">{item.headline}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Current odds</span>
                        <span className="text-sm text-emerald-400">{item.polymarketOdds}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-3 text-emerald-400 border-emerald-500/30">
                  View All Markets
                </Button>
              </CardContent>
            </Card>

            {/* Related Oracle Crossovers */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <h4 className="mb-3">Related Insights</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  See how {type === "politics" ? "economic" : "political"} events intersect with this analysis
                </p>
                <Button variant="outline" className="w-full">
                  View {type === "politics" ? "Economics" : "Politics"} Oracle
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
