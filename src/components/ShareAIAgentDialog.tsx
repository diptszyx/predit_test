import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Share2, Link as LinkIcon, MessageCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ShareAIAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiAgentName: string;
  aiAgentAvatar: string;
  aiAgentTitle: string;
  aiAgentId: string;
}

export function ShareAIAgentDialog({
  open,
  onOpenChange,
  aiAgentName,
  aiAgentAvatar,
  aiAgentTitle,
  aiAgentId,
}: ShareAIAgentDialogProps) {
  // Create the shareable URL for the AI agent
  const shareUrl = `${window.location.origin}?aiagent=${aiAgentId}`;

  const shareText = `Check out ${aiAgentName} on Predit Market of Predictions! 🔮\n\n${aiAgentTitle}\n\n`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
      onOpenChange(false);
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

  const handleShareToX = () => {
    const tweetText = encodeURIComponent(shareText);
    const tweetUrl = encodeURIComponent(shareUrl);
    const xUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    window.open(xUrl, '_blank', 'width=550,height=420');
    onOpenChange(false);
  };

  const handleShareToTelegram = () => {
    const telegramText = encodeURIComponent(shareText + shareUrl);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
    onOpenChange(false);
  };

  const handleShareToDiscord = () => {
    // Discord doesn't have a direct share URL, so we copy the formatted message
    const discordMessage = `${shareText}${shareUrl}`;

    navigator.clipboard.writeText(discordMessage).then(() => {
      toast.success("Message copied! Paste it in Discord.");
      onOpenChange(false);
    }).catch(() => {
      toast.error("Failed to copy message");
    });
  };

  console.log('ShareAIAgentDialog rendering:', { open, aiAgentName, aiAgentId });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-500" />
            Share AI Agent
          </DialogTitle>
          <DialogDescription>
            Share {aiAgentName} with your friends and community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* AI Agent Preview */}
          <div className="p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={aiAgentAvatar}
                  alt={aiAgentName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="truncate">{aiAgentName}</h4>
                <p className="text-sm text-muted-foreground truncate">{aiAgentTitle}</p>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleShareToX}
              className="flex items-center justify-center gap-2 hover:bg-blue-500/10 hover:border-blue-500/30 h-10"
              type="button"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X (Twitter)</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleShareToTelegram}
              className="flex items-center justify-center gap-2 hover:bg-blue-400/10 hover:border-blue-400/30 h-10"
              type="button"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span>Telegram</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleShareToDiscord}
              className="flex items-center justify-center gap-2 hover:bg-indigo-500/10 hover:border-indigo-500/30 h-10"
              type="button"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>Discord</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 hover:bg-blue-500/10 hover:border-blue-500/30 h-10"
              type="button"
            >
              <LinkIcon className="w-4 h-4 flex-shrink-0" />
              <span>Copy Link</span>
            </Button>
          </div>

          {/* Share URL Preview */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Share URL:</p>
            <p className="text-xs break-all font-mono">{shareUrl}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
