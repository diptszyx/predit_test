import clsx from "clsx";
import { ArrowLeft, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatDate } from "../../lib/date";
import { marketAdminServices } from "../../services/market-admin.service";
import { getMarketById, Market, placeBet } from "../../services/market.service";
import useAuthStore from "../../store/auth.store";
import { checkIsAdmin } from "../../utils/isAdmin";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { getStatusBadgeProps } from "./MarketListAdmin";
import { AUTO_OPTIONS } from "./MarketModal";

const MarketDetails = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const fetchUser = useAuthStore((state) => state.fetchCurrentUser);
  const user = useAuthStore((state) => state.user);
  const isAdmin = checkIsAdmin(user)

  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<string>('');
  const [trading, setTrading] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMarket();
    }
  }, [id]);

  const fetchMarket = async () => {
    if (!id) return;

    try {
      const data = await getMarketById(id);
      setMarket(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/market');
  };

  const handleConfirm = async () => {
    const amountValue = Number(amount);
    if (!selectedOutcome || amountValue <= 0 || !id) return;
    if (!user) {
      toast.error('User not logged in');
      return;
    }

    if (amountValue > user.xp) {
      toast.error('Insufficient XP to place this market');
      return;
    }

    try {
      setTrading(true);

      const bet = await placeBet(id, {
        prediction: selectedOutcome,
        amount: amountValue,
      });

      await fetchUser();

      toast.success(`Market placed: ${selectedOutcome} ${amount} XP`);

    } catch (err) {
      console.error(err);
      toast.success(`Market placed: ${selectedOutcome} ${amount} XP`);
    } finally {
      setTrading(false);
      setAmount('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Market not found</p>
          <Button onClick={handleBack}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const disabledBetButton =
    trading ||
    Number(amount) <= 0 ||
    (user && Number(amount) > user.xp) ||
    market.isBetted ||
    market.status !== 'open'

  const disabledChooseOutcome =
    market.isBetted ||
    market.status !== 'open'
  const canResolve = market.status === 'open' || market.status === 'end';
  const isResolved = market.status === 'resolved';

  const handleResolve = async (outcome: 'yes' | 'no') => {
    if (!market.id || !market) return;

    try {
      setResolving(true);
      await marketAdminServices.resolveMarket(market.id, { outcome });
      toast.success(`Market resolved as "${outcome.toUpperCase()}"`, {
        description: 'All bets have been settled and payouts distributed.',
      });

      await fetchMarket()
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to resolve market', {
        description: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total participants</p>
                      <p className="text-lg font-semibold">
                        {market.totalParticipants}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="text-sm font-semibold">
                        {formatDate(market.closeAt)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Oracle</p>
                      <p className="text-sm font-semibold">
                        {market.oracle.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Market ID</p>
                      <p className="text-xs font-mono">
                        {market.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-15 h-15 md:w-20 md:h-20 rounded-md overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {/* Placeholder Image */}
                      <ImageWithFallback
                        src={market.image?.path || market.imageUrl || ''}
                        alt={market.question}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h1 className="text-lg md:text-xl font-bold w-full">
                          {market.question}
                          <Badge
                            variant={
                              getStatusBadgeProps(market.status).variant
                            }
                            className={`text-[10px] ml-3 px-1.5 py-0 h-6 capitalize shrink-0 ${getStatusBadgeProps(market.status)
                              .className
                              }`}
                          >
                            {market.status}
                          </Badge>
                        </h1>
                      </div>
                    </div>
                  </div>

                  {/* Outcome */}
                  {market.outcome && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Result:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold
        ${market.outcome === "yes"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {market.outcome.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {/* YES */}
                    <div className="rounded-xl border p-4 bg-green-50">
                      <p className="text-xs text-green-600 font-medium">YES POOL</p>
                      <p className="text-2xl font-bold text-green-700">
                        {market.yesPool} XP
                      </p>
                    </div>

                    {/* NO */}
                    <div className="rounded-xl border p-4 bg-red-50">
                      <p className="text-xs text-red-600 font-medium">NO POOL</p>
                      <p className="text-2xl font-bold text-red-700">
                        {market.noPool} XP
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {market.description &&
                      <div className="pt-2 mb-0">
                        <h4 className="font-semibold">Description</h4>
                        <p className="text-muted-foreground mt-2">{market.description}</p>
                      </div>
                    }
                  </div>

                  {/* Rules */}
                  <div className="space-y-3">
                    <div className="pt-4">
                      <h4 className="font-semibold mb-2">Market Rules</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        This is a binary prediction market created by the system. Users place bets using XP

                        <br /><br />

                        The market will resolve to "YES" if the event described in the title happens before the specified end time. Otherwise, it will resolve to "NO".

                        Trading is open until the market close time. After closing, no further bets can be placed.

                        <br /><br />

                        Once the event concludes, the result will be determined based on clear, publicly available, and verifiable information.

                        <br /><br />

                        Winning users will receive XP rewards proportional to their stake. Losing bets will forfeit the XP used.

                        <br /><br />

                        Note: This market is for entertainment and prediction purposes only. XP has no real-world monetary value.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                {!isAdmin &&
                  <div>
                    <CardHeader>
                      <CardTitle className="font-semibold">Trade</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 mt-5">
                      <div className="space-y-2">
                        <Label>Outcome</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={
                              selectedOutcome === 'yes' ? 'default' : 'outline'
                            }
                            onClick={() => setSelectedOutcome('yes')}
                            className={
                              selectedOutcome === 'yes'
                                ? 'bg-green-600 hover:bg-green-700'
                                : ''
                            }
                            disabled={disabledChooseOutcome}
                          >
                            YES
                          </Button>
                          <Button
                            variant={
                              selectedOutcome === 'no' ? 'default' : 'outline'
                            }
                            onClick={() => setSelectedOutcome('no')}
                            className={
                              selectedOutcome === 'no'
                                ? 'bg-red-600 hover:bg-red-700'
                                : ''
                            }
                            disabled={disabledChooseOutcome}
                          >
                            NO
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label>Amount</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 cursor-pointer text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="text-xs">
                                The amount of XP you place for this market.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div>
                          <Input
                            type="number"
                            className="w-full text-sm"
                            value={amount}
                            onChange={(e: any) => {
                              const v = e.target.value;
                              // allow empty string
                              if (v === '') return setAmount('');
                              // allow only numbers
                              if (/^\d+$/.test(v)) {
                                setAmount(v);
                              }
                            }}
                            min={0}
                            max={user?.xp || undefined}
                            placeholder={`Max: ${user?.xp ?? 0}`}
                          />
                          {user && Number(amount) > user.xp && (
                            <p className="text-xs text-red-500 mt-1">
                              Amount exceeds your available XP
                            </p>
                          )}
                          <div className="mt-2 flex items-center bg-primary dark:bg-input/30 rounded-3xl p-1 w-fit">
                            {AUTO_OPTIONS.map((v) => {
                              const disabled = !user || v > user.xp;
                              return (
                                <button
                                  key={v}
                                  type="button"
                                  disabled={disabled}
                                  className={clsx(
                                    'px-3 py-1 rounded-3xl text-sm transition-all font-semibold text-white dark:text-black',
                                    disabled
                                      ? 'opacity-40 cursor-not-allowed'
                                      : 'hover:opacity-80 hover:text-accent-foreground cursor-pointer'
                                  )}
                                  onClick={() => {
                                    if (!disabled) {
                                      setAmount(String(v));
                                    }
                                  }}
                                >
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleConfirm}
                        disabled={disabledBetButton}
                        className='w-full'
                      >
                        {trading ? 'Placing...' : 'Confirm'}
                      </Button>
                      {market.isBetted && (
                        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                          <p className="text-[12px] text-yellow-900 font-medium">
                            ✓ You have already placed a bet on this market
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </div>
                }

                {isAdmin &&
                  <div>
                    <CardHeader>
                      <CardTitle className="font-semibold">Resolve Market</CardTitle>
                    </CardHeader>
                    <CardContent>

                      {/* Resolve Buttons */}
                      {canResolve && (
                        <div className="space-y-3">
                          <div className="pt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                              Choose the outcome to resolve this market. This action
                              will distribute payouts to all winning placements.
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <Button
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white h-8 text-sm"
                              onClick={() => handleResolve('yes')}
                              disabled={resolving}
                            >
                              Resolve as Yes
                            </Button>
                            <Button
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white h-8 text-sm"
                              onClick={() => handleResolve('no')}
                              disabled={resolving}
                            >
                              Resolve as No
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Already Resolved Message */}
                      {isResolved && (
                        <div className="mt-5 p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-sm text-blue-900 font-medium">
                            ✓ This market has been resolved as <span className='capitalize font-bold'>{market.outcome}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </div>
                }
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketDetails
