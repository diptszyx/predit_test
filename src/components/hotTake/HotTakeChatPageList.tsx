import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge, Zap } from 'lucide-react';
import { timeAgo } from '../../lib/date';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Skeleton } from '../ui/skeleton';
import { News } from '../../services/news.service';

interface Props {
  isLoadingNews: boolean;
  newsArticles: News[];
  getMore: () => void;
  hasMoreArticles: boolean;
  handleArticleClick: (id: string) => void;
}

export default function HotTakeChatPageList({
  isLoadingNews,
  newsArticles,
  getMore,
  hasMoreArticles,
  handleArticleClick,
}: Props) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMoreArticles) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          getMore();
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMoreArticles, getMore]);

  return (
    <div className="p-3 space-y-3">
      {isLoadingNews && newsArticles.length === 0 ? (
        <>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="space-y-2"
            >
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-2/3" />
            </div>
          ))}
        </>
      ) : newsArticles.length > 0 ? (
        <>
          {newsArticles.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden hover:shadow-md transition-all duration-300 group relative cursor-pointer"
              onClick={() => handleArticleClick(article.slug)}
            >
              <div className="relative h-32 md:h-[200px]! overflow-hidden">
                <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1 right-1">
                  <Badge
                    variant="secondary"
                    className="text-xs h-4 px-1.5"
                  >
                    {article.relevance}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-2">
                <h4 className="text-xs mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                  {article.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="truncate text-xs flex items-center gap-1">
                    {article.oracle?.name}
                  </span>
                  <span className="text-xs">{timeAgo(article.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMoreArticles && (
            <div
              ref={loaderRef}
              className="space-y-2 py-3"
            >
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-xs text-muted-foreground">
            No hot takes available
          </p>
        </div>
      )}
    </div>
  );
}
