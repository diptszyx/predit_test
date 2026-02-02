import { useWallet } from '@solana/wallet-adapter-react';
import { ChevronLeft, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { arcLength, rdImageMarket } from '../../constants/ui';
import { useMarketList } from '../../hooks/dflow/useMarketList';
import {
  calculateAvgAndPnL,
  centsLabel,
  getKalshiBidAsk,
  moneyLabel,
  pctLabel,
} from '../../hooks/dflow/usePositions';
import { useTrade } from '../../hooks/dflow/useTrade';
import {
  formatMint,
  mapTradeToUI,
  toUi,
  TradeRowUI,
} from '../../hooks/dflow/useTradeHistory';
import { formatDate, formatDateTime } from '../../lib/date';
import {
  createDflowMarketChat,
  DflowDataEntity,
  DflowTradeEntity,
  getTradeHistory,
  MarketPosition,
  Meta,
} from '../../services/dflow.service';
import { getUserTokenAccounts } from '../../utils/getTokenAccounts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { getPositions } from './../../services/dflow.service';
import SellingModal from './SellingModal';
import TradeModalDflow from './TradeModalDflow';
import { WalletInfoCard } from './WalletInfoCard';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export const MarketListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { markets, loading, meta } = useMarketList({
    limit: 20,
    offset: (page - 1) * 20,
  });
  const { isTrading } = useTrade();
  const [searchTerm, setSearchTerm] = useState('');

  // Trade modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<DflowDataEntity | null>(
    null,
  );
  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>('Yes');

  // Trade history
  const pageSize = 10;
  const [loadingTradeHistory, setLoadingTradeHistory] = useState(false);
  const [pageTradeHistory, setPageTradeHistory] = useState(1);
  const [tradeHistory, setTradeHistory] = useState<DflowTradeEntity[]>([]);
  const [historyMeta, setHistoryMeta] = useState<Meta>({
    total: 0,
    limit: pageSize,
    offset: (pageTradeHistory - 1) * pageSize,
  });

  // Positions
  const { publicKey } = useWallet();
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [pagePositions, setPagePositions] = useState(1);
  const [positions, setPositions] = useState<MarketPosition[]>([]);
  const [positionMeta, setPositionMeta] = useState<Meta>({
    total: 0,
    limit: pageSize,
    offset: (pagePositions - 1) * pageSize,
  });
  const [activeTab, setActiveTab] = useState<
    'markets' | 'trades' | 'positions'
  >('markets');

  useEffect(() => {
    if (activeTab === 'trades') {
      fetchHistory();
    }
    if (activeTab === 'positions') {
      fetchPositions();
    }
  }, [activeTab, pageTradeHistory, pagePositions]);

  const fetchHistory = async () => {
    try {
      setLoadingTradeHistory(true);
      const data = await getTradeHistory({
        limit: 10,
        offset: (pageTradeHistory - 1) * pageSize,
      });
      setTradeHistory(data.data);
      setHistoryMeta(data.meta);
    } catch (error) {
      console.log('Fail to fetch trade history', error);
      toast.error('Fail to fetch trade history');
    } finally {
      setLoadingTradeHistory(false);
    }
  };

  const fetchPositions = async () => {
    if (!publicKey) return;
    setLoadingPositions(true);
    try {
      const tokenAccounts = await getUserTokenAccounts(publicKey.toBase58());
      const data = await getPositions({
        tokenAccounts,
        limit: pageSize,
        offset: (pagePositions - 1) * pageSize,
      });
      setPositions(data.data);
      setPositionMeta(data.meta);
    } catch (error) {
      console.log('Fail to fetch trade positions', error);
      toast.error('Fail to fetch trade positions');
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleMarketClick = (id: string) => {
    navigate(`/kalshi/${id}`);
  };

  const handleTradeClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    market: DflowDataEntity,
    outcome: 'Yes' | 'No',
  ) => {
    e.stopPropagation();
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
    setTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    if (activeTab === 'trades') {
      fetchHistory();
    }
    setTradeModalOpen(false);
  };

  const formatVolume = (volume: number) => {
    if (!volume) return '$0';
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const handleClickChat = async (market: DflowDataEntity) => {
    if (!market.chatId) {
      try {
        const data = await createDflowMarketChat(market.id);
        if (data) navigate(`/kalshi/${market.id}/chat/${data.id}`);
      } catch (error) {
        console.log('error', error);
        toast.error('Something wrong with chat polymarket');
      }
    } else {
      navigate(`/kalshi/${market.id}/chat/${market.chatId}`);
    }
  };

  const renderMarketCard = (market: DflowDataEntity) => {
    const yes = parseFloat(market.yesBid ?? '0');
    const no = parseFloat(market.noBid ?? '0');

    const probYes = yes + no > 0 ? yes / (yes + no) : 0.5;
    const progressLength = probYes * arcLength;

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
              <ImageWithFallback
                src={market.imageUrl || rdImageMarket(market.ticker)}
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
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 50"
                    style={{ overflow: 'visible' }}
                  >
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#4a5565"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
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
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleTradeClick(e, market, 'Yes')
              }
              disabled={isTrading}
            >
              Yes
            </Button>
            <Button
              className="h-10 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-lg font-semibold border border-red-600/30 rounded-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleTradeClick(e, market, 'No')
              }
              disabled={isTrading}
            >
              No
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-400 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {formatVolume(Number(market.volume))} Vol.
              </span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(market.closeTime)}</span>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <MessageSquare
                  className="w-4 h-4 cursor-pointer"
                  onClick={(e: Event) => {
                    e.stopPropagation();
                    handleClickChat(market);
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>Chat with this market</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredMarkets = markets.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6">
        <div className="space-y-2 flex flex-col sm:flex-row sm:items-center justify-between w-full">
          <div>
            <h1 className="text-3xl font-bold">Kalshi Market</h1>
            <p className="text-muted-foreground">
              Trade on real-world events powered by Kalshi
            </p>
          </div>
          <div className="w-fit">
            <WalletInfoCard />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as any)}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <TabsList>
              <TabsTrigger value="markets">Markets</TabsTrigger>
              <TabsTrigger value="trades">Trade History</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
            </TabsList>

            {/* Search / Filter bar */}
            {activeTab === 'markets' && (
              <div className="relative flex-1 max-w-md mt-4 sm:mt-0">
                <Input
                  placeholder="Search markets..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>
            )}
          </div>

          <TabsContent
            value="markets"
            className="mt-6 space-y-6"
          >
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
                {meta && meta.total > meta.limit && (
                  <div className="flex items-center justify-center gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={filteredMarkets.length < meta.limit}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent
            value="trades"
            className="mt-6"
          >
            {loadingTradeHistory ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-14 w-full"
                  />
                ))}
              </div>
            ) : tradeHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No trade history</p>
              </div>
            ) : (
              <>
                <TradeHistoryTable trades={tradeHistory} />
                {historyMeta && (
                  <div className="flex items-center justify-between pt-8">
                    <p className="text-sm">
                      Page {page} of {Math.ceil(historyMeta.total / pageSize)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPageTradeHistory((p) => p - 1)}
                      >
                        Previous
                      </Button>

                      <Button
                        variant="outline"
                        disabled={
                          page === Math.ceil(historyMeta.total / pageSize)
                        }
                        onClick={() => setPageTradeHistory((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent
            value="positions"
            className="mt-6"
          >
            {loadingPositions ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-14 w-full"
                  />
                ))}
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No positions</p>
              </div>
            ) : (
              <>
                <PositionsTable
                  positions={positions}
                  onSellSuccess={fetchPositions}
                />
                {positions && (
                  <div className="flex items-center justify-between pt-8">
                    <p className="text-sm">
                      Page {page} of {Math.ceil(positionMeta.total / pageSize)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPagePositions((p) => p - 1)}
                      >
                        Previous
                      </Button>

                      <Button
                        variant="outline"
                        disabled={
                          page === Math.ceil(positionMeta.total / pageSize)
                        }
                        onClick={() => setPagePositions((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {selectedMarket && (
          <TradeModalDflow
            open={tradeModalOpen}
            onOpenChange={setTradeModalOpen}
            market={selectedMarket}
            initialOutcome={selectedOutcome}
            onTradeSuccess={handleTradeSuccess}
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
  );
};

export interface TradeHistoryTableProps {
  trades: DflowTradeEntity[];
  decimals?: number;
}

export const TradeHistoryTable = ({
  trades,
  decimals = 6,
}: TradeHistoryTableProps) => {
  const statusVariant = (s: string) => {
    const v = (s ?? '').toLowerCase();
    if (v === 'closed') return 'default';
    if (v === 'failed') return 'destructive' as any;
    if (v === 'open') return 'secondary';
    if (v === 'pending') return 'outline';
    return 'secondary';
  };

  const rows = useMemo(
    () => trades.map((t) => mapTradeToUI(t, decimals)),
    [trades, decimals],
  );

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>In → Out</TableHead>
            <TableHead>Fills/Reverts</TableHead>
            <TableHead>Market</TableHead>
            <TableHead>TX</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((r: TradeRowUI) => (
            <TableRow key={r.id}>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(r.updatedAt)}
              </TableCell>

              <TableCell>
                <Badge
                  variant={statusVariant(r.status)}
                  className="capitalize"
                >
                  {r.status}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge
                  variant={'outline'}
                  className="capitalize"
                >
                  {r.tradeSide}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge variant="outline">{r.tradeCurrency}</Badge>
              </TableCell>

              <TableCell>
                <div className="font-medium">
                  {r.requestedAmountUi.toFixed(6)}
                </div>
                <div className="text-xs text-muted-foreground">
                  slippage: {r.slippageBps} bps
                </div>
              </TableCell>

              <TableCell className="text-sm">
                <div className="font-medium">
                  {formatMint(r.inputMint)} → {formatMint(r.outputMint)}
                </div>
                <div className="text-xs text-muted-foreground">
                  actual: {r.inAmountUi == null ? '—' : r.inAmountUi.toFixed(6)}
                  {' → '}
                  {r.outAmountUi == null ? '—' : r.outAmountUi.toFixed(6)}
                </div>
              </TableCell>

              <TableCell className="text-sm">
                {r.fillsCount} / {r.revertsCount}
              </TableCell>

              <TableCell>
                <a
                  href={`/kalshi/${r.marketId}`}
                  className="underline text-[#3b82f6]"
                >
                  View
                </a>
              </TableCell>

              <TableCell className="text-sm">
                {r.orbUrl ? (
                  <a
                    href={r.orbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#3b82f6]"
                  >
                    Open with Orb
                  </a>
                ) : (
                  '—'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
export interface PositionsTableProps {
  positions: MarketPosition[];
  onSellSuccess: () => void;
}

export const PositionsTable = ({
  positions,
  onSellSuccess,
}: PositionsTableProps) => {
  const [openSellingModal, setOpenSellingModal] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] =
    useState<MarketPosition | null>(null);

  const handleClickSelling = (position: MarketPosition) => {
    setSelectedPosition(position);
    setOpenSellingModal(true);
  };

  const sellingSuccess = () => {
    setSelectedPosition(null);
    setOpenSellingModal(false);
    onSellSuccess();
  };
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs tracking-wide">MARKET</TableHead>
            <TableHead className="w-20 text-right text-xs tracking-wide">
              AVG
            </TableHead>
            <TableHead className="w-20 text-right text-xs tracking-wide">
              CURRENT
            </TableHead>
            <TableHead className="w-[150px] text-right text-xs tracking-wide">
              VALUE
            </TableHead>
            <TableHead className="w-[130px] text-right text-xs"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {positions.map((position) => {
            const shares = toUi(position.balance, position.decimals);
            const { yesBid, yesAsk, noBid, noAsk } = getKalshiBidAsk(position);

            const currentUSD =
              position.positionType === 'YES' ? (yesAsk ?? 0) : (noAsk ?? 0);

            const valueUSD = shares * currentUSD;
            const { avgUSD, pnlUSD, pnlPct, isAvgEstimated } =
              calculateAvgAndPnL({
                positionType: position.positionType,
                shares,
                currentUSD,
                yesBid,
                yesAsk,
                noBid,
                noAsk,
                avgPrice: position.avgPrice,
              });

            const sideLabel = position.positionType === 'YES' ? 'Yes' : 'No';
            const sideColor =
              position.positionType === 'YES'
                ? 'text-emerald-300'
                : 'text-rose-300';

            return (
              <TableRow key={`${position.market.eventTicker}-${position.mint}`}>
                {/* MARKET CELL */}
                <TableCell className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
                      <ImageWithFallback
                        src={
                          position.market.imageUrl ||
                          rdImageMarket(position.market.ticker)
                        }
                        alt={position.market.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {position.market.title}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${sideColor}`}>
                          {sideLabel}
                        </span>
                        <span className="">•</span>
                        <span>{shares.toFixed(1)} shares</span>
                        <span className="">at</span>
                        <span className="font-medium ">
                          {avgUSD != null ? centsLabel(avgUSD) : '—'}
                        </span>
                        {isAvgEstimated && (
                          <span className="ml-1 rounded-full border bg-background/80 px-2 py-1 text-[8px]">
                            Estimated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* AVG */}
                <TableCell className="text-right align-top">
                  <div className="text-sm font-semibold">
                    {avgUSD != null ? centsLabel(avgUSD) : '—'}
                  </div>
                </TableCell>

                {/* CURRENT */}
                <TableCell className="text-right align-top">
                  <div className="text-sm font-semibold">
                    {centsLabel(currentUSD)}
                  </div>
                </TableCell>

                {/* VALUE */}
                <TableCell className="text-right align-top">
                  <div className="text-sm font-semibold">
                    {moneyLabel(valueUSD)}
                  </div>

                  <div className="mt-1 text-xs">
                    {pnlUSD != null && pnlPct != null ? (
                      <span
                        className={
                          pnlUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {pnlUSD >= 0 ? '+' : ''}
                        {moneyLabel(pnlUSD)} ({pnlUSD >= 0 ? '+' : ''}
                        {pctLabel(pnlPct)})
                      </span>
                    ) : (
                      <span className="">—</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="w-2/3"
                      onClick={() => handleClickSelling(position)}
                    >
                      {position.market.status === 'active' ? 'Sell' : 'Claim'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        {selectedPosition && (
          <SellingModal
            open={openSellingModal}
            onChange={setOpenSellingModal}
            position={selectedPosition}
            onTradeSuccess={sellingSuccess}
          />
        )}
      </Table>
    </Card>
  );
};
