import {
  MessageSquare,
  Sparkles,
  Star,
  ThumbsUp
} from "lucide-react";
import { OracleEntity } from "../services/oracles.service";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent
} from "./ui/dialog";


interface InfoAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiAgent: OracleEntity;
  handleLike: () => void
  handleRating: (rating: number) => void
  hasLiked: boolean
  userRating: number | null
  localLikes: number
}

export function InfoAgentDialog({
  open,
  onOpenChange,
  aiAgent,
  handleLike,
  handleRating,
  hasLiked,
  userRating,
  localLikes
}: InfoAgentDialogProps) {

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <ImageWithFallback
              src={aiAgent.image}
              alt={aiAgent.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate mb-0.5">{aiAgent.name}</h3>
            <p className="text-xs text-blue-400 mb-2">
              {aiAgent.type}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {aiAgent.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 py-3 border-t border-b border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-sm">
                {Number(aiAgent.rating).toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-sm">{aiAgent.predictions}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Predictions
            </p>
          </div>
        </div>

        <div
          className={`mt-4 p-3 rounded-lg bg-muted/30 transition-all 
              
              `
          }
        >
          <p className="text-xs text-muted-foreground mb-2">
            Rate this AI Agent
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="transition-opacity hover:opacity-70"
              >
                <Star
                  className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer ${star <= userRating!
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                    }`}
                />
              </button>
            ))}
          </div>
          {userRating! > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              You rated {Math.round(userRating!)}/5
            </p>
          )}
        </div>

        <Button
          variant="outline"
          className={`w-full mt-3 h-9 transition-all cursor-pointer ${hasLiked
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
            : 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50'
            }`}
          onClick={handleLike}
        >
          <ThumbsUp
            className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''
              }`}
          />
          {hasLiked ? 'Liked' : 'Like'} • {localLikes.toString()}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
