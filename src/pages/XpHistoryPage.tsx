import React, { useEffect, useState } from 'react'
import { leaderboardService, XP_EVENT_LABEL, XpEventType, XpHistoryItem, XpHistoryResponse } from '../services/leaderboard.service'

import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../components/ui/table';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { formatXpTime } from '../utils/datetime.utils';
import { Button } from '../components/ui/button';

const XpHistoryPage = () => {
  const [events, setEvents] = useState<XpHistoryItem[]>()
  const [loading, setLoading] = useState(false)
  const [eventType, setEventType] = useState<XpEventType | 'all'>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    const fetchXpEvents = async () => {
      setLoading(true);
      const requestParams = {
        page,
        limit: pageSize,
        eventType: eventType === 'all' ? undefined : eventType,
      };

      try {
        const data = await leaderboardService.getXpEvents(requestParams)
        if (data) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false);
      }
    }

    fetchXpEvents()
  }, [eventType, page])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">XP History</h1>
        <p className="text-muted-foreground">
          Track your earned and spent XP across all activities and events.
        </p>
      </div>

      <Select
        value={eventType}
        onValueChange={(v) => setEventType(v as XpEventType | 'all')}
      >
        <SelectTrigger className="border-input data-placeholder:text-muted-foreground [&_svg:not([class*=' text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 w-48">
          <SelectValue placeholder="Filter event" />
        </SelectTrigger>

        <SelectContent className="bg-background">
          <SelectItem value="all">All events</SelectItem>

          {Object.entries(XP_EVENT_LABEL).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableCell className="font-semibold">Type</TableCell>
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
                  No XP activity yet. Start completing actions to earn XP!
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              events?.map((event, idx) => {
                const hasBoost = Number(event.multiplier) > 1
                const multiplierText = Number(event.multiplier).toFixed(1).replace(/\.0$/, '') // 2.2 -> "2.2", 2.0 -> "2"
                const totalText = `+${event.totalXp} XP`

                return (
                  <TableRow key={event.id} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 capitalize">
                        {event.eventType.replace(/_/g, ' ')}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        {/* main reward */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums">{totalText}</span>

                          {/* show badge only if multiplier > 1 */}
                          {hasBoost && (
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                              Boost ×{multiplierText}
                            </span>
                          )}
                        </div>

                        {/* subtext only if multiplier > 1 */}
                        {hasBoost && (
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {event.baseXp} × {multiplierText}
                          </div>
                        )}
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

      {!loading && total > 0 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default XpHistoryPage
