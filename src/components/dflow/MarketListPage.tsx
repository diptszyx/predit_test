import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MarketSummary, useMarketList } from "../../hooks/dflow/useMarketList";
import { useTrade } from "../../hooks/dflow/useTrade";
import { createDflowMarketChat } from '../../services/dflow.service';
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const MarketListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { markets, loading, meta } = useMarketList({ limit: 20, offset: (page - 1) * 20 });
  const { placeOrder, isTrading } = useTrade();
  const [searchTerm, setSearchTerm] = useState("");

  const handleMarketClick = (ticker: string) => {
    // Navigate to Dflow detail page (using series or ticker?)
    // Assuming ticker is unique market ID
    navigate(`/dflow/${ticker}`);
  };

  const handleQuickBuy = async (e: React.MouseEvent<HTMLButtonElement>, mint: string) => {
    e.stopPropagation();
    if (isTrading) return;
    try {
      await placeOrder('BUY', mint, 10); // Quick buy $10
      alert("Order placed successfully!");
    } catch (error) {
      console.error(error);
      alert("Trade failed");
    }
  };

  const formatVolume = (volume: number) => {
    if (!volume) return "$0";
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const handleClickChat = async (market: MarketSummary) => {
    if (!market.chatId) {
      try {
        const data = await createDflowMarketChat(market.id)
        if (data)
          navigate(`/dflow/${market.ticker}/chat/${data.id}`)
      } catch (error) {
        console.log('error', error)
        toast.error('Something wrong with chat polymarket')
      }
    } else {
      navigate(`/dflow/${market.ticker}/chat/${market.chatId}`)
    }
  }

  const renderMarketCard = (market: MarketSummary) => {
    // Hardcoded probability/price for now as it's not in the list API yet
    // In a real app, you'd fetch prices or have them in the list
    const yesPrice = 50;
    const arcLength = 126; // Approx arc length for the svg
    const progressLength = (yesPrice / 100) * arcLength;
    return (
      <Card
        key={market.ticker}
        className="overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg bg-background border-background/50"
        onClick={() => handleMarketClick(market.ticker)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
              {/* Placeholder Image */}
              <span className="text-xs text-muted-foreground">IMG</span>
            </div>
            <div className="flex-1 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium line-clamp-2 leading-snug">
                {market.title}
              </h4>
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Semicircle Progress Bar (Simulated) */}
                <div className="relative w-24 h-12 mb-1">
                  <svg className="w-full h-full" viewBox="0 0 100 50" style={{ overflow: 'visible' }}>
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#4a5565" strokeWidth="8" strokeLinecap="round" />
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${progressLength} ${arcLength}`}
                      style={{ transition: 'stroke-dasharray 0.3s ease' }}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-400 leading-none">
                    {yesPrice}%
                  </div>
                </div>
                <div className="text-xs text-gray-400">chance</div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">{market.subtitle}</Badge>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 mb-4">
            <Button
              className="h-10 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-lg font-semibold border border-green-600/30 rounded-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleQuickBuy(e, market.yesMint)}
              disabled={isTrading}
            >
              Yes
            </Button>
            <Button
              className="h-10 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-lg font-semibold border border-red-600/30 rounded-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleQuickBuy(e, market.noMint)}
              disabled={isTrading}
            >
              No
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-400 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatVolume(market.volume)} Vol.</span>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <MessageSquare className='w-4 h-4 cursor-pointer'
                  onClick={(e: Event) => {
                    e.stopPropagation()
                    handleClickChat(market)
                  }} />
              </TooltipTrigger>
              <TooltipContent>
                Chat with this market
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    );
  };


  const filteredMarkets = markets.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dflow Markets</h1>
          <p className="text-muted-foreground">Trade on real-world events powered by Dflow</p>
        </div>

        {/* Search / Filter bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search markets..."
              className="pl-9"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No markets found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarkets.map(renderMarketCard)}
            </div>

            {/* Pagination */}
            {meta && (meta.total > meta.limit) && (
              <div className="flex items-center justify-center gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  // simplistic check, ideally use total/limit
                  disabled={filteredMarkets.length < meta.limit}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};