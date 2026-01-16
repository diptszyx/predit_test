import { Badge, ChevronLeft, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { arcLength, rdImageMarket } from '../../constants/ui';
import { useMarketList } from "../../hooks/dflow/useMarketList";
import { useTrade } from "../../hooks/dflow/useTrade";
import { formatDate, formatDateTime } from '../../lib/date';
import { createDflowMarketChat, DflowDataEntity } from '../../services/dflow.service';
import { PolymarketTrade } from '../../services/polymarket.service';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import TradeModalDflow from './TradeModalDflow';

export const MarketListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { markets, loading, meta } = useMarketList({ limit: 20, offset: (page - 1) * 20 });
  const { placeOrder, isTrading } = useTrade();
  const [searchTerm, setSearchTerm] = useState("");

  // Trade modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<DflowDataEntity | null>(
    null
  );
  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>('Yes');

  const [trades, setTrades] = useState<PolymarketTrade[]>([]);
  const [activeTab, setActiveTab] = useState<'markets' | 'trades'>(
    'markets'
  );

  const handleMarketClick = (id: string) => {
    navigate(`/dflow/${id}`);
  };

  const handleTradeClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    market: DflowDataEntity,
    outcome: 'Yes' | 'No'
  ) => {
    e.stopPropagation();
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
    setTradeModalOpen(true);
  };

  const formatVolume = (volume: number) => {
    if (!volume) return "$0";
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const handleClickChat = async (market: DflowDataEntity) => {
    if (!market.chatId) {
      try {
        const data = await createDflowMarketChat(market.id)
        if (data)
          navigate(`/dflow/${market.id}/chat/${data.id}`)
      } catch (error) {
        console.log('error', error)
        toast.error('Something wrong with chat polymarket')
      }
    } else {
      navigate(`/dflow/${market.id}/chat/${market.chatId}`)
    }
  }

  const renderMarketCard = (market: DflowDataEntity) => {
    const yes = parseFloat(market.yesBid ?? "0")
    const no = parseFloat(market.noBid ?? "0")

    const probYes = (yes + no) > 0 ? yes / (yes + no) : 0.5
    const progressLength = probYes * arcLength

    return (
      <Card
        key={market.id}
        className="overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg bg-background border-background/50"
        onClick={() => handleMarketClick(market.id)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 bg-muted flex items-center justify-center">
              {/* Placeholder Image */}
              <img
                src={rdImageMarket(market.id)}
                alt={market.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium line-clamp-2 leading-snug">
                {market.title}
              </h4>
              <div className="flex flex-col items-center shrink-0">
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
                    {(probYes * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-xs text-gray-400">chance</div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 mb-4">
            <Button
              className="h-10 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-lg font-semibold border border-green-600/30 rounded-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleTradeClick(e, market, 'Yes')}
              disabled={isTrading}
            >
              Yes
            </Button>
            <Button
              className="h-10 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-lg font-semibold border border-red-600/30 rounded-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleTradeClick(e, market, 'No')}
              disabled={isTrading}
            >
              No
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-400 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatVolume(Number(market.volume))} Vol.</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(market.closeTime)}</span>
              </div>
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

        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as any)}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value='markets'>Markets</TabsTrigger>
              <TabsTrigger value="trades">Trade History</TabsTrigger>
            </TabsList>

            {/* Search / Filter bar */}
            {activeTab === 'markets' &&
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search markets..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
            }
          </div>

          <TabsContent value='markets' className="mt-6 space-y-6">
            {loading ? (
              <MarketSkeleton />
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
                      disabled={filteredMarkets.length < meta.limit}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value='trades' className='mt-6'>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No trade history</p>
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Market</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Match Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {trade.market}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trade.outcome === 'Yes' ? 'default' : 'secondary'
                            }
                          >
                            {trade.outcome}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trade.side === 'BUY' ? 'default' : 'outline'
                            }
                          >
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {parseFloat(trade.size).toFixed(2)}
                        </TableCell>
                        <TableCell>${trade.price}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trade.status === 'MATCHED'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {trade.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(trade.match_time)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {selectedMarket && (
          <TradeModalDflow
            open={tradeModalOpen}
            onOpenChange={setTradeModalOpen}
            market={selectedMarket}
            initialOutcome={selectedOutcome}
          // onTradeSuccess={handleTradeSuccess}
          />
        )}
      </div>
    </div>
  );
};

const MarketSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}