import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Link, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface SharePredictionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  answer: string;
  aiAgentName: string;
  aiAgentAvatar: string;
  aiAgentEmoji: string;
}

export function SharePredictionDialog({
  open,
  onOpenChange,
  question,
  answer,
  aiAgentName,
  aiAgentAvatar,
  aiAgentEmoji,
}: SharePredictionDialogProps) {
  // Generate a unique ID for this prediction
  const predictionId = btoa(`${aiAgentName}-${Date.now()}`).replace(/[/+=]/g, '');

  // Create the shareable URL
  const shareUrl = `${window.location.origin}/prediction/${predictionId}`;

  console.log('SharePredictionDialog rendered');
  console.log('Question:', question);
  console.log('Answer:', answer);
  console.log('AI Agent:', aiAgentName);
  console.log('Generated URL:', shareUrl);

  // Store prediction data in localStorage for the shared page
  const storePredictionData = () => {
    const predictionData = {
      question,
      answer,
      aiAgentName,
      aiAgentAvatar,
      aiAgentEmoji,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`prediction-${predictionId}`, JSON.stringify(predictionData));
  };

  const handleCopyLink = () => {
    storePredictionData();
    console.log('=== COPY LINK CLICKED ===');
    console.log('Share URL:', shareUrl);
    console.log('Prediction ID:', predictionId);

    // Always show manual copy dialog - most reliable method
    console.log('Showing copy dialog...');

    // Close the share dialog first to avoid z-index conflicts
    onOpenChange(false);

    // Wait a moment for the dialog to close
    setTimeout(() => {
      // Create a custom dialog overlay for manual copying
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 20px;
      `;

      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: #1a1a2e;
        border: 2px solid #a855f7;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      `;

      dialog.innerHTML = `
        <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 18px;">Copy Prediction Link</h3>
        <p style="color: #9ca3af; margin: 0 0 16px 0; font-size: 14px;">
          Click the input below to select the link, then copy it (Ctrl+C or Cmd+C):
        </p>
        <input 
          type="text" 
          value="${shareUrl}" 
          readonly
          style="
            width: 100%;
            padding: 12px;
            background: #0f0f1e;
            border: 1px solid #a855f7;
            border-radius: 8px;
            color: #fff;
            font-size: 13px;
            margin-bottom: 16px;
            font-family: monospace;
            cursor: pointer;
          "
          id="copyLinkInput"
        />
        <button 
          style="
            width: 100%;
            padding: 12px;
            background: #a855f7;
            border: none;
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            font-weight: 600;
          "
          id="closeCopyDialog"
        >
          Done
        </button>
      `;

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      // Auto-select the input text
      const input = document.getElementById('copyLinkInput') as HTMLInputElement;
      if (input) {
        // Select on click
        input.onclick = () => {
          input.select();
          input.setSelectionRange(0, shareUrl.length);
        };

        // Auto-select after a moment
        setTimeout(() => {
          input.focus();
          input.select();
          input.setSelectionRange(0, shareUrl.length);
        }, 100);
      }

      // Close dialog on button click
      const closeBtn = document.getElementById('closeCopyDialog');
      if (closeBtn) {
        closeBtn.onclick = () => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          toast.success("Link ready to share!");
        };
      }

      // Close on overlay click
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
        }
      };

      console.log('Copy dialog displayed with URL:', shareUrl);
    }, 200);
  };

  const handleTwitterShare = () => {
    storePredictionData();
    const text = `Check out this prediction from ${aiAgentName} on Predit of Predictions! 🔮`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    storePredictionData();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleRedditShare = () => {
    storePredictionData();
    const title = `Prediction from ${aiAgentName} on Predit of Predictions`;
    const url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle>Share to:</DialogTitle>
          <DialogDescription>
            Share this prediction with your friends and followers
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Copy Link */}
          <Button
            variant="secondary"
            className="h-16 justify-start gap-3 bg-secondary/50 hover:bg-secondary/70 border border-border"
            onClick={handleCopyLink}
          >
            <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center flex-shrink-0">
              <Link className="w-5 h-5" />
            </div>
            <span>Copy Link</span>
          </Button>

          {/* Facebook */}
          <Button
            variant="secondary"
            className="h-16 justify-start gap-3 bg-secondary/50 hover:bg-secondary/70 border border-border"
            onClick={handleFacebookShare}
          >
            <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center flex-shrink-0">
              <Facebook className="w-5 h-5" />
            </div>
            <span>Facebook</span>
          </Button>

          {/* Twitter */}
          <Button
            variant="secondary"
            className="h-16 justify-start gap-3 bg-secondary/50 hover:bg-secondary/70 border border-border"
            onClick={handleTwitterShare}
          >
            <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center flex-shrink-0">
              <Twitter className="w-5 h-5" />
            </div>
            <span>Twitter</span>
          </Button>

          {/* Reddit */}
          <Button
            variant="secondary"
            className="h-16 justify-start gap-3 bg-secondary/50 hover:bg-secondary/70 border border-border"
            onClick={handleRedditShare}
          >
            <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
            </div>
            <span>Reddit</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
