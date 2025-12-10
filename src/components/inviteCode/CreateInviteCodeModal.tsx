import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  const [count, setCount] = useState<string>('1');
  const [prefix, setPrefix] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!Number(count) || Number(count) < 1) {
      toast.error('Failed to create invite code', {
        description: "You must generate at least 1 code.",
      });
      return
    };
    setLoading(true);

    try {
      await onConfirm({
        count: Number(count),
        prefix: prefix || undefined,
      });

      onClose();
      setCount('1');
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
          <DialogDescription>Prefix must be 2–5 uppercase letters (A–Z).</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Prefix (optional)</label>
            <Input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Default: DEH"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Number of codes</label>
            <Input
              type="number"
              min={1}
              value={count}
              onChange={(e: any) => {
                const v = e.target.value;

                // allow empty string
                if (v === '') return setCount('');

                // allow only numbers
                if (/^\d+$/.test(v)) {
                  setCount(v);
                }
              }}
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
