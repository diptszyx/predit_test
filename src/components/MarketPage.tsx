import { useState } from 'react';
import CreateMarketModal from './CreateMarket';
import { Button } from './ui/button';
import { CircleFadingPlus } from 'lucide-react';
import MarketListAdmin from './market/MarketListAdmin';

const MarketPage = () => {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6 h-full">
        <CreateMarketModal open={openCreate} onOpenChange={setOpenCreate} />
        <Button onClick={() => setOpenCreate(true)}>
          <CircleFadingPlus /> Create market
        </Button>
        <MarketListAdmin />
      </div>
    </div>
  );
};

export default MarketPage;
