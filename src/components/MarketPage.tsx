import { useState } from 'react'
import CreateMarketModal from './CreateMarket'
import { Button } from './ui/button'
import { CircleFadingPlus, PlusCircleIcon } from 'lucide-react'

const MarketPage = () => {
  const [openCreate, setOpenCreate] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl p-4 lg:p-6 space-y-6 h-full">
        <CreateMarketModal open={openCreate} onOpenChange={setOpenCreate} />
        <Button onClick={() => setOpenCreate(true)}><CircleFadingPlus /> Create market</Button>
      </div>
    </div>
  )
}

export default MarketPage
