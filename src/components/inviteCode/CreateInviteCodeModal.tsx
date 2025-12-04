import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { error } from 'console';

export default function CreateInviteCodeModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: ({
    count,
    prefix,
  }: {
    count: number;
    prefix?: string;
  }) => Promise<void>;
}) {
  const [count, setCount] = useState(1);
  const [prefix, setPrefix] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!count || count < 1) return;
    setLoading(true);

    try {
      await onConfirm({
        count,
        prefix: prefix || undefined,
      });

      onClose();
      setCount(1);
      setPrefix('');
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
          <DialogTitle>Create Invite Codes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium">Prefix (optional)</label>
            <Input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="default: DEH"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Number of codes</label>
            <Input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
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
