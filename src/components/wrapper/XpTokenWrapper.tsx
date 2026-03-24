import { Helmet } from 'react-helmet-async'
import InviteCodeGuard from '../guard/InviteCodeGuard'
import { Sidebar } from '../Sidebar'
import XpTokenPage from '../../pages/XpTokenPage'

const XpTokenWrapper = ({
  commonSidebarProps,
  handleWalletDisconnect,
  commonDialogProps,
}: any
) => {
  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      <Helmet>
        <title>XP Token History | Track XP Earn & Spend - Predit Market AI</title>

        <meta
          name="description"
          content="Track your XP token history on Predit Market AI. View earned, spent, and transaction details of your experience points in real-time."
        />

        <meta
          name="keywords"
          content="XP token, XP history, experience points tracker, XP transactions, Predit Market AI, user rewards"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="XP Token History | Predit Market AI"
        />
        <meta
          property="og:description"
          content="Monitor your XP tokens, earnings, and spending across all activities."
        />
        <meta
          property="og:url"
          content="https://predit.market/predit-xp-token"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="XP Token History | Predit Market AI"
        />
        <meta
          name="twitter:description"
          content="Track your XP token earnings and spending in one place."
        />

        {/* Canonical */}
        <link
          rel="canonical"
          href="https://predit.market/predit-xp-token"
        />
      </Helmet>
      <Sidebar {...commonSidebarProps} />
      <InviteCodeGuard onOpenWalletDialog={handleWalletDisconnect}>
        <div className="flex-1 overflow-y-auto">
          <main className="container mx-auto px-4 py-8">
            <XpTokenPage />
          </main>
        </div>
        {commonDialogProps}
      </InviteCodeGuard>
    </div>
  )
}

export default XpTokenWrapper
