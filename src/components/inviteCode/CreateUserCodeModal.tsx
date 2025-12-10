import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';

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
    if (!appWallet) {
      toast.error('Failed to create user invite code', {
        description: "User's wallet address should not be empty",
      });
      return
    }
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
      toast.error('Failed to create user invite code', {
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
          <DialogDescription>Prefix must be 2–5 uppercase letters (A–Z).</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">User's wallet address <span className='text-red-500'>*</span></label>
            <Input
              type="text"
              value={appWallet}
              onChange={(e) => setAppWallet(e.target.value)}
              placeholder="Ex: 0x0e43...2a07"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2">Prefix (optional)</label>
            <Input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Default: DEH"
              className="mt-1"
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
