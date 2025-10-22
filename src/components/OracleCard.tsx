import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Oracle {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  category: string;
  accuracy: string;
  likes: string;
  consultSessions?: string;
  specialty: string;
  tags: string[];
  avatar: string;
  bgColor: string;
  level?: number;
  tier?: 'free' | 'premium' | 'elite';
}

interface OracleCardProps {
  oracle: Oracle;
  onClick: () => void;
}

export function OracleCard({ oracle, onClick }: OracleCardProps) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-border overflow-hidden"
      onClick={onClick}
    >
      {/* Full Avatar Image with Text Overlay */}
      <div className="relative h-[28rem] overflow-hidden">
        {/* Avatar Image - positioned to hide bottom 10% */}
        <img 
          src={oracle.avatar} 
          alt={oracle.name}
          className="w-full h-[110%] object-cover object-top"
          style={{ objectPosition: 'center top' }}
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className={`absolute inset-0 bg-gradient-to-t ${oracle.gradient} opacity-20`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Top Emoji Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="text-3xl bg-black/40 backdrop-blur-sm rounded-lg p-2">{oracle.emoji}</div>
        </div>

        {/* Text Content Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 z-10">
          {/* Oracle Info */}
          <div>
            <h3 className="line-clamp-1 mb-1 text-white">{oracle.name}</h3>
            <p className="text-xs text-gray-200 line-clamp-1">{oracle.title}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm text-white">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>{oracle.accuracy}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-blue-400" />
              <span>{oracle.likes}</span>
            </div>
            {oracle.consultSessions && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-purple-400" />
                <span>{oracle.consultSessions}</span>
              </div>
            )}
          </div>

          {/* Category Badge */}
          <div>
            <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/30 backdrop-blur-sm">
              {oracle.category}
            </Badge>
          </div>

          {/* Description Preview */}
          <p className="text-xs text-gray-300 line-clamp-2">
            {oracle.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
