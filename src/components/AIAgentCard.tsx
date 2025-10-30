import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface AIAgent {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  category: string;
  rating: string;
  likes: string;
  consultSessions?: string;
  specialty: string;
  tags: string[];
  avatar: string;
  bgColor: string;
  level?: number;
  tier?: 'free' | 'premium' | 'elite';
}

interface AIAgentCardProps {
  aiAgent: AIAgent;
  onClick: () => void;
}

export function AIAgentCard({ aiAgent, onClick }: AIAgentCardProps) {
  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:border-primary/50 border-border overflow-hidden bg-card"
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* AI Agent Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <img
                src={aiAgent.avatar}
                alt={aiAgent.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 mb-0.5 text-foreground">{aiAgent.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{aiAgent.title}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {aiAgent.category}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {aiAgent.description}
        </p>

        {/* Stats - Simplified without icons */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="text-foreground">{aiAgent.rating}</span>
            <span>rating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-foreground">{aiAgent.likes}</span>
            <span>likes</span>
          </div>
          {aiAgent.consultSessions && (
            <div className="flex items-center gap-1.5">
              <span className="text-foreground">{aiAgent.consultSessions}</span>
              <span>sessions</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
