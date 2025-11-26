import { CircleFadingPlus } from 'lucide-react';
import { useState } from 'react';
import CreateUpdateMarketModal from './CreateMarket';
import MarketListAdmin from './market/MarketListAdmin';
import { Button } from './ui/button';

const MarketPage = () => {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6 h-full">
        <CreateUpdateMarketModal open={openCreate} onOpenChange={setOpenCreate} />
        <Button onClick={() => setOpenCreate(true)}>
          <CircleFadingPlus /> Create market
        </Button>
        <MarketListAdmin />
      </div>
    </div>
  );
};

export default MarketPage;
