import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge, Zap } from 'lucide-react';
import { timeAgo } from '../../lib/date';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Skeleton } from '../ui/skeleton';
import { News } from '../../services/news.service';
import { Topic } from '../../services/topic-admin.service';
import { Button } from '../ui/button';

interface Props {
  isLoadingNews: boolean;
  newsArticles: News[];
  isLoadingTopicList: boolean;
  topicList: Topic[];
  getMore: () => void;
  hasMoreArticles: boolean;
  handleArticleClick: (id: string) => void;
  topicFilter: string | null;
  setTopicFilter: (v: string | null) => void;
}

export default function HotTakeChatPageList({
  isLoadingNews,
  newsArticles,
  getMore,
  hasMoreArticles,
  handleArticleClick,
  topicList,
  isLoadingTopicList,
  topicFilter,
  setTopicFilter,
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
    <div className="h-full overflow-hidden">
      <div className="flex gap-2 overflow-x-auto lg:mt-3 px-2 pb-2 scrollbar-hidden">
        {isLoadingTopicList ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-6 min-w-[60px] rounded-lg"
            />
          ))
        ) : (
          <>
            <Button
              size="sm"
              variant={
                topicFilter === null || !topicFilter ? 'default' : 'outline'
              }
              onClick={() => setTopicFilter(null)}
              className="min-w-[60px] text-xs"
              style={{ padding: '4px 12px' }}
            >
              All
            </Button>

            {topicList.map((topic) => (
              <Button
                key={topic.id}
                size="sm"
                variant={topicFilter === topic.id ? 'default' : 'outline'}
                onClick={() => setTopicFilter(topic.id)}
                className="min-w-[60px] text-xs"
                style={{ padding: '4px 12px' }}
              >
                {topic.name}
              </Button>
            ))}
          </>
        )}
      </div>
      <div
        className="h-full pb-10"
        style={{ overflow: 'auto' }}
      >
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
                      <span className="text-xs">
                        {timeAgo(article.createdAt)}
                      </span>
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
      </div>
    </div>
  );
}
