import { Info, Link as LinkIcon, Share } from "lucide-react";
import { toast } from "sonner";
import { truncateName } from "../lib/truncateName";
import Markdown from "./chat/Markdown";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

export type ShareMode = 'conversation' | 'reply';

export type SharePayload =
  | { mode: 'conversation'; question: string; answer: string, sharedLink?: string; }
  | { mode: 'reply'; message: string, sharedLink: string; };
interface ShareAIAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sharePayload: SharePayload
}

export function ShareChatDialog({
  open,
  onOpenChange,
  sharePayload
}: ShareAIAgentDialogProps) {
  const isFullChat = sharePayload.mode === 'conversation';
  const shareUrl = `${window.location.origin}${sharePayload.sharedLink}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Link copied to clipboard!");
        onOpenChange(false);
      } catch (e) {
        toast.error("Failed to copy link");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5 text-blue-500" />
            {isFullChat ? 'Share Conversation' : 'Share AI Reply'}
          </DialogTitle>
          <DialogDescription>
            Share this prediction with your friends and community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 w-full">
          <div className="p-4 rounded-lg bg-accent/50 border border-border shadow-lg">
            <div className="flex items-center gap-3">
              {sharePayload?.mode === 'reply' ?
                <Markdown
                  text={truncateName(sharePayload.message, 350)}
                /> : <>
                  <div className="relative max-h-[260px] overflow-hidden w-full">
                    <div className="space-y-4">
                      {/* User question bubble */}
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                          {truncateName(sharePayload?.question, 100)}
                        </div>
                      </div>

                      {/* AI answer bubble */}
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1 max-w-[90%] ">
                          <div className="rounded-2xl bg-background/70 border border-border px-4 py-3 text-sm leading-relaxed">
                            <Markdown
                              text={truncateName(sharePayload.answer, 200)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-1 gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 hover:bg-blue-500/10 hover:border-blue-500/30 h-10"
              type="button"
            >
              <LinkIcon className="w-4 h-4 shrink-0" />
              <span>Copy Link</span>
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted/40 border border-border px-3 py-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-snug">
              Anyone with the link can view it. This link expires in 7 days.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
