import { useEffect, useState } from 'react'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table'
import { Claim, claimedHistory } from '../services/claim-token.service'
import { formatXpTime } from '../utils/datetime.utils'

const XpTokenPage = () => {
  const claimNetwork = import.meta.env.VITE_CLAIM_TOKEN_NETWORK
  const isDevnetNetwork = claimNetwork === 'devnet'

  const [claims, setClaims] = useState<Claim[]>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchXpEvents = async () => {
      setLoading(true);

      try {
        const data = await claimedHistory()
        if (data) {
          setClaims(data.claims)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false);
      }
    }

    fetchXpEvents()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          XP Token History
        </h1>
        <p className="text-muted-foreground">
          View all your claimed XP token transactions.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableCell className="font-semibold">XP Amount</TableCell>
              <TableCell className="font-semibold">Time</TableCell>
              <TableCell className="font-semibold">Tx Hash</TableCell>
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
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && claims?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-muted-foreground"
                >
                  No token claims yet.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              claims?.map((claim, idx) => {
                const viewSolscanLink = `https://solscan.io/tx/${claim.txSignature}${isDevnetNetwork ? '?cluster=devnet' : ''}`;

                return (
                  <TableRow key={claim.id} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                    <TableCell>
                      {claim.amount}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatXpTime(claim.createdAt)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      <a
                        href={viewSolscanLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium text-[#3b82f6]"
                      >
                        View on solscan
                      </a>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default XpTokenPage
