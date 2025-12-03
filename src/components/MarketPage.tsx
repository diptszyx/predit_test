import { CircleFadingPlus } from 'lucide-react';
import { useRef, useState } from 'react';
import CreateUpdateMarketModal from './CreateMarket';
import MarketListAdmin from './market/MarketListAdmin';
import { Button } from './ui/button';
import useAuthStore from '../store/auth.store';
import { ADMIN_EMAILS } from '../constants/admin';
import MarketList from './market/MarketList';

const MarketPage = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin =
    user && user.email ? ADMIN_EMAILS.includes(user.email) : false;
  const [openCreate, setOpenCreate] = useState(false);
  const refetchRef = useRef<(() => void) | null>(null);

  const handleRefetchReady = (refetch: () => void) => {
    refetchRef.current = refetch;
  };

  const handleCreateSuccess = () => {
    refetchRef.current?.();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6 h-full">
        {isAdmin && (
          <>
            <CreateUpdateMarketModal
              open={openCreate}
              onOpenChange={setOpenCreate}
              onSuccess={handleCreateSuccess}
            />
            <Button onClick={() => setOpenCreate(true)}>
              <CircleFadingPlus /> Create market
            </Button>
          </>
        )}
        {isAdmin ? (
          <MarketListAdmin onRefetchReady={handleRefetchReady} />
        ) : (
          <MarketList isFromMarketPage/>
        )}
      </div>
    </div>
  );
};

export default MarketPage;
