import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { InviteCode } from '../../services/invite-code.service';
import { Twitter } from 'lucide-react';

interface ShareCodesModalProps {
  open: boolean;
  onClose: () => void;
  codes: InviteCode[];
  onConfirm: (selectedCodes: string[]) => void;
}

export default function ShareCodesModal({
  open,
  onClose,
  codes,
  onConfirm,
}: ShareCodesModalProps) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedCodes([]);
    }
  }, [open]);

  const handleSelectCode = (code: string, checked: boolean) => {
    if (checked) {
      setSelectedCodes((prev) => [...prev, code]);
    } else {
      setSelectedCodes((prev) => prev.filter((c) => c !== code));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCodes(codes.map((c) => c.code));
    } else {
      setSelectedCodes([]);
    }
  };

  const handleConfirm = () => {
    if (selectedCodes.length > 0) {
      onConfirm(selectedCodes);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Invite Codes to Share</DialogTitle>
          <DialogDescription>
            Choose one or more invite codes to share on X (Twitter)
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2 border-b">
          <Checkbox
            checked={codes.length > 0 && selectedCodes.length === codes.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">Select All</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          {codes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No invite codes available
            </p>
          ) : (
            codes.map((code) => (
              <div
                key={code.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-accent"
              >
                <Checkbox
                  checked={selectedCodes.includes(code.code)}
                  onCheckedChange={(checked: boolean) =>
                    handleSelectCode(code.code, checked)
                  }
                />
                <div className="flex-1">
                  <p className="font-medium">{code.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {code.usedBy ? (
                      <span className="text-red-500">Used</span>
                    ) : (
                      <span className="text-green-600">Unused</span>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedCodes.length} code{selectedCodes.length !== 1 ? 's' : ''}{' '}
            selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedCodes.length === 0}
              className="gap-2"
            >
              <Twitter className="w-4 h-4" />
              Share on X
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
