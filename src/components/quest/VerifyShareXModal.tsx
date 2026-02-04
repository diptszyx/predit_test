import React, { Dispatch, SetStateAction, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface VerifyShareXModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  questId: string | null
  onConfirm: (questId: string, postUrl: string) => void
}

const VerifyShareXModal = ({ open, setOpen, questId, onConfirm }: VerifyShareXModalProps) => {
  const [postUrl, setPostUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!questId || !postUrl.trim()) return
    try {
      setLoading(true)
      await onConfirm(questId, postUrl.trim())
    } finally {
      setLoading(false)
    }
  }

  const onClose = () => {
    if (loading) return
    setOpen(false)
    setPostUrl("")
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Verify Your Share
          </DialogTitle>

          <DialogDescription>
            Share on X, then paste your post link below to verify and earn XP.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            X Post URL
          </label>
          <Input
            placeholder="e.g https://x.com/username/status/2018..."
            value={postUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostUrl(e.target.value)}
            className='mt-2 text-sm'
          />
        </div>

        <div className="flex items-center justify-end pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!postUrl || !questId || loading}
              className="gap-2"
            >
              {loading ? "Verifying..." : "Confirm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VerifyShareXModal
