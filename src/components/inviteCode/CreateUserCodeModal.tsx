import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Wallet } from 'lucide-react';

export default function CreateUserCodeModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: ({
    appWallet,
    prefix,
  }: {
    appWallet: string;
    prefix?: string;
  }) => Promise<void>;
}) {
  const [prefix, setPrefix] = useState('');
  const [appWallet, setAppWallet] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);

    try {
      await onConfirm({
        appWallet,
        prefix: prefix || undefined,
      });

      onClose();
      setPrefix('');
      setAppWallet('')
    } catch (err: any) {
      toast.error('Failed to create invite code', {
        description: err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onClose(); // prevent auto-close on error
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium">User's wallet address <span className='text-red-500'>*</span></label>
            <Input
              type="text"
              value={appWallet}
              onChange={(e) => setAppWallet(e.target.value)}
              placeholder="Ex: 0xabc"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Prefix (optional)</label>
            <Input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="default: DEH"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={handleCreate}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
