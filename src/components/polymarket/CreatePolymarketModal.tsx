import { useState } from "react";
import { toast } from "sonner";
import { createPolyMarketAdmin } from "../../services/polymarket.service";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

interface CreatePolymarketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
const CreatePolymarketModal = ({ open, onOpenChange, onSuccess }: CreatePolymarketModalProps) => {
  const [marketId, setMarketId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>()

  const handleCreate = async () => {
    if (!marketId) return
    setLoading(true)
    try {
      await createPolyMarketAdmin(marketId)
      toast.success('Market added successfully')
      onSuccess()
      setMarketId('')
      onOpenChange(false)
    } catch (error) {
      console.log('error', error)
      toast.error('Failed to create Polymarket market');
    } finally {
      setLoading(false)
    }
  }

  const onClose = () => {
    onOpenChange(false)
    setMarketId('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl"
        onInteractOutside={() => setMarketId('')}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create Polymarket
          </DialogTitle>
          <DialogDescription className="text-left">
            Enter the Polymarket Market ID to add a new market.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Market Id</label>
            <Input
              type="text"
              value={marketId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMarketId(e.target.value)}
              placeholder="e.g 516710"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={loading || !marketId} onClick={handleCreate}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePolymarketModal
