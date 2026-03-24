import { Zap } from "lucide-react";
import { XpMarketEvent } from "../../services/leaderboard.service";
import { formatXpTime } from "../../utils/datetime.utils";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

type MyXpMarketHistoryProps = {
  loading: boolean;
  events: XpMarketEvent[]
}

const MyXpMarketHistoryItem = ({ loading, events }: MyXpMarketHistoryProps) => {
  const appUrl = import.meta.env.VITE_APP_URL
  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case "bet_won":
        return "text-emerald-500";
      case "bet_lost":
        return "text-red-500";
      case "bet_placed":
        return "text-yellow-500";
      default:
        return "text-foreground";
    }
  };
  return (
    <div className="rounded-md border mt-3">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableCell className="font-semibold">Status</TableCell>
            <TableCell className="font-semibold">Market</TableCell>
            <TableCell className="font-semibold">XP Amount</TableCell>
            <TableCell className="font-semibold">Time</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading &&
            [1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
              </TableRow>
            ))}

          {!loading && events?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center py-6 text-muted-foreground"
              >
                No activity yet. Your XP history will appear here once you start trading.
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            events?.map((event, idx) => {
              return (
                <TableRow key={event.id} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                  <TableCell className="font-medium">
                    <div
                      className={`flex items-center gap-2 capitalize ${getEventTypeStyle(
                        event.eventType
                      )}`}
                    >
                      {event.eventType.replace(/_/g, " ")}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <a
                        href={`${appUrl}/market/${event.metadata.marketId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-primary text-[13px]"
                      >
                        Go to market
                      </a>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {"prediction" in event.metadata && event.metadata.prediction && (
                          <span className="rounded-md border px-2 py-0.5">
                            prediction: {event.metadata.prediction}
                          </span>
                        )}

                        {"payout" in event.metadata &&
                          typeof event.metadata.payout === "number" && (
                            <span className="rounded-md border px-2 py-0.5">
                              payout: {event.metadata.payout}
                            </span>
                          )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1 items-center text-[15px]">
                      <div
                        className={`flex items-center gap-2 font-semibold ${event.eventType === "bet_won" || event.totalXp > 0
                          ? "text-green-600"
                          : event.totalXp < 0
                            ? "text-red-600"
                            : "text-foreground"
                          }`}
                      >
                        {event.totalXp > 0 ? `+${event.totalXp}` : event.totalXp}
                      </div>
                      <Zap className={`w-3 h-3 ${event.eventType === "bet_won" || event.totalXp > 0
                        ? "text-green-600"
                        : event.totalXp < 0
                          ? "text-red-600"
                          : "text-foreground"
                        }`} />
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatXpTime(event.createdAt)}
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </div>
  )
}
export default MyXpMarketHistoryItem
