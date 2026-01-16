import { ChevronLeft, ChevronRight, CircleAlert, CircleFadingPlus, Clock, MessageSquare, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { POLYMARKET_SORT_OPTIONS, PolymarketSortOptionId } from '../constants/search-options';
import { arcLength } from '../constants/ui';
import { formatDate, formatDateTime } from '../lib/date';
import { createPolyMarketChat } from '../services/polymarket-message.service';
import {
  cancelPolymarketOrder,
  deletePolymarketAdmin,
  getMyPolymarketOrders,
  getPolymarkets,
  getPolymarketTrades,
  PaginationMeta,
  PolymarketMarket,
  PolymarketOrder,
  PolymarketTrade
} from '../services/polymarket.service';
import useAuthStore from '../store/auth.store';
import { checkIsAdmin } from '../utils/isAdmin';
import CreatePolymarketModal from './polymarket/CreatePolymarketModal';
import TradeModal from './polymarket/TradeModal';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const PolymarketPage = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = checkIsAdmin(user)
  const navigate = useNavigate();

  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [orders, setOrders] = useState<PolymarketOrder[]>([]);
  const [trades, setTrades] = useState<PolymarketTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'markets' | 'orders' | 'trades'>(
    'markets'
  );
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  // Trade modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<PolymarketMarket | null>(
    null
  );
  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>('Yes');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(
    null
  );
  const itemsPerPage = 20;

  const [sortOptionId, setSortOptionId] = useState<PolymarketSortOptionId | undefined>(undefined);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    if (activeTab === 'markets') {
      fetchMarkets();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'trades') {
      fetchTrades();
    }
  }, [activeTab, currentPage, sortOptionId]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const sort = sortOptionId ? POLYMARKET_SORT_OPTIONS[sortOptionId] : undefined;

      const response = await getPolymarkets({
        limit: itemsPerPage,
        offset,
        ...(sort ? { sortBy: sort.sortBy, sortOrder: sort.sortOrder } : {}),
      });

      setMarkets(response.data);
      setPaginationMeta(response.meta);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Polymarket markets');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyPolymarketOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const data = await getPolymarketTrades();
      setTrades(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load trade history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingOrderId(orderId);
      await cancelPolymarketOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleMarketClick = (market: PolymarketMarket) => {
    navigate(`/polymarket/${market.id}`);
  };

  const handleMarketChat = async (market: PolymarketMarket) => {
    if (!market.isMessaged) {
      try {
        const data = await createPolyMarketChat(market.id)
        if (data)
          navigate(`/polymarket/${market.id}/chat/${data.id}`);
      } catch (error) {
        console.log('error', error)
        toast.error('Something wrong with chat polymarket')
      }
    } else {
      navigate(`/polymarket/${market.id}/chat/${market.chatId}`);
    }
  };

  const handleTradeClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    market: PolymarketMarket,
    outcome: 'Yes' | 'No'
  ) => {
    e.stopPropagation(); // Prevent card click navigation
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
    setTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    // Refresh orders and trades if needed
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'trades') {
      fetchTrades();
    }
  };

  const handleDelete = async () => {
    if (!selectedMarket) return;

    try {
      setLoading(true);
      await deletePolymarketAdmin(selectedMarket.id);
      toast.success('Market deleted successfully');
      fetchMarkets()
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete Polymarket market');
    } finally {
      setLoading(false);
      setOpenDeleteConfirm(false)
    }
  }

  const formatVolume = (volume: string) => {
    const vol = parseFloat(volume);
    if (vol >= 1000000) {
      return `$${(vol / 1000000).toFixed(1)}M`;
    }
    if (vol >= 1000) {
      return `$${(vol / 1000).toFixed(1)}K`;
    }
    return `$${vol.toFixed(0)}`;
  };

  const renderMarketCard = (market: PolymarketMarket) => {
    const yesToken = market.tokens.find((t) => t.outcome === 'Yes' || t.outcome === 'Up');

    const yesPrice = yesToken ? parseFloat(yesToken.price) * 100 : 50;
    const progressLength = (yesPrice / 100) * arcLength;
    return (
      <Card
        key={market.id}
        className="overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg bg-background border-background/50"
        onClick={() => handleMarketClick(market)}
      >
        <CardContent className="p-4">
          {/* Header with image, question, and percentage */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
              {market.image && (
                <img
                  src={market.image}
                  alt={market.question}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium line-clamp-2 leading-snug">
                {market.question}
              </h4>
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Semicircle Progress Bar */}
                <div className="relative w-24 h-12 mb-1">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 50"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Background semicircle */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke={`#4a5565`}
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Progress semicircle */}
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
                    {yesPrice.toFixed(0)}%
                  </div>
                </div>
                <div className="text-xs text-gray-400">chance</div>
              </div>
            </div>
          </div>

          {/* Yes/No Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 mb-4">
            <Button
              className="h-10 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-lg font-semibold border border-green-600/30 rounded-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleTradeClick(e, market, 'Yes');
              }}
            >
              Yes
            </Button>
            <Button
              className="h-10 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-lg font-semibold border border-red-600/30 rounded-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleTradeClick(e, market, 'No');
              }}
            >
              No
            </Button>
          </div>

          {/* Footer with volume and close date */}
          <div className="flex items-center justify-between text-sm text-gray-400 gap-4">
            <div className="flex items-center justify-between flex-1">
              <span className="font-medium">
                {formatVolume(market.volume)} Vol.
              </span>
              {market.endDate && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(market.endDate)}</span>
                </div>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger>
                <MessageSquare className='w-4 h-4 cursor-pointer'
                  onClick={(e: Event) => {
                    e.stopPropagation()
                    handleMarketChat(market)
                  }} />
              </TooltipTrigger>
              <TooltipContent>
                Chat with this market
              </TooltipContent>
            </Tooltip>
          </div>
          {isAdmin &&
            <div className='text-right mt-5'>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setOpenDeleteConfirm(true)
                  setSelectedMarket(market)
                }}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          }
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Polymarket</h1>
          <p className="text-muted-foreground">
            Trade on real-world events with Polymarket markets
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as any)}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="markets">Markets</TabsTrigger>
              {/* TODO: Add my orders tab if limit place order */}
              {/* <TabsTrigger value="orders">My Orders</TabsTrigger> */}
              <TabsTrigger value="trades">Trade History</TabsTrigger>
            </TabsList>

            {activeTab === 'markets' &&
              <div className="flex items-center gap-3">
                <Select
                  value={sortOptionId ?? ''}
                  onValueChange={(v: string) => {
                    setSortOptionId(v as PolymarketSortOptionId)
                    setCurrentPage(1);
                  }}

                >
                  <SelectTrigger className="border-input data-placeholder:text-muted-foreground [&_svg:not([class*=' text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 w-52">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>

                  <SelectContent className="bg-background">
                    {Object.entries(POLYMARKET_SORT_OPTIONS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isAdmin &&
                  <Button variant="outline" onClick={() => setOpenCreate(true)}>
                    <CircleFadingPlus />
                  </Button>
                }
              </div>
            }

          </div>

          {/* Markets Tab */}
          <TabsContent value="markets" className="mt-6 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-40 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : markets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No markets found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {markets.map(renderMarketCard)}
                </div>

                {/* Pagination Controls */}
                {paginationMeta &&
                  (currentPage > 1 || paginationMeta.hasMore) && (
                    <div className="flex items-center justify-center gap-2 border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={!paginationMeta.hasMore || loading}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
              </>
            )}
          </TabsContent>

          {/* My Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No open orders</p>
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
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {order.market || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.outcome === 'Yes' ? 'default' : 'secondary'
                            }
                          >
                            {order.outcome || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.side === 'BUY' ? 'default' : 'outline'
                            }
                          >
                            {order.side}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.size}</TableCell>
                        <TableCell>
                          {order.price ? `$${order.price}` : 'Market'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'LIVE' ? 'default' : 'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              order.id && handleCancelOrder(order.id)
                            }
                            disabled={
                              cancellingOrderId === order.id ||
                              order.status !== 'LIVE'
                            }
                          >
                            {cancellingOrderId === order.id
                              ? 'Cancelling...'
                              : 'Cancel'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Trade History Tab */}
          <TabsContent value="trades" className="mt-6">
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

        {/* Trade Modal */}
        {selectedMarket && (
          <TradeModal
            open={tradeModalOpen}
            onOpenChange={setTradeModalOpen}
            market={selectedMarket}
            initialOutcome={selectedOutcome}
            onTradeSuccess={handleTradeSuccess}
          />
        )}
      </div>
      <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <DialogContent className="max-w-2xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CircleAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Confirm Delete Market
            </DialogTitle>
            <DialogDescription className="space-y-4 text-sm leading-relaxed">
              <p>
                Are you sure you want to delete this market?
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Title:</span>{' '}
                <span className="font-medium text-foreground">
                  {selectedMarket?.question}
                </span>
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete()}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreatePolymarketModal open={openCreate} onOpenChange={setOpenCreate} onSuccess={fetchMarkets} />
    </div>
  );
};

export default PolymarketPage;
