import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { News, newsService } from '../services/news.service';
import { timeAgo } from '../lib/date';
import { removeBrokenImages } from '../lib/htmlUtil';
import { Skeleton } from './ui/skeleton';

interface HotTakesPageProps {
  onArticleClick: (article: News) => void;
  onBack: () => void;
}

const PAGE_SIZE = 12;

export function HotTakesPage({ onArticleClick, onBack }: HotTakesPageProps) {
  const [articles, setArticles] = useState<News[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const pageWrapper = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const loadArticles = async (reset = false) => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;

    try {
      setLoading(true);

      const offset = reset ? 0 : page * PAGE_SIZE;

      const result = await newsService.getAll(PAGE_SIZE, offset);

      if (reset) {
        setArticles(result);
      } else {
        setArticles((prev) => [...prev, ...result]);
      }

      if (result.length < PAGE_SIZE) setHasMore(false);
      else setHasMore(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  };

  useEffect(() => {
    loadArticles(true);
  }, []);

  useEffect(() => {
    pageWrapper?.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
          loadArticles(false);
        }
      },
      { threshold: 1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadArticles]);

  const oracleCategoryMap: Record<string, string> = {
    crypto: 'Cryptocurrency',
    economics: 'Economics',
    'financial-markets': 'Financial Markets',
    fortune: 'Fortune & Mysticism',
    'fundamental-analysis': 'Fundamental Analysis',
    'meme-coins': 'Meme Coins',
    politics: 'Politics',
    'technical-analysis': 'Technical Analysis',
  };

  const availableCategories = ['all'];

  const filteredArticles =
    selectedCategory === 'all'
      ? articles
      : articles.filter(
        (a) => oracleCategoryMap[a.oracle.id] === selectedCategory
      );

  return (
    <div
      className="flex-1 overflow-y-auto"
      ref={pageWrapper}
    >
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-left mb-2 text-[40px]">
              Hot Takes
            </h1>
            <p className="text-left text-muted-foreground mb-8">
              Latest insights and analyses from our oracle community
            </p>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {availableCategories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? 'whitespace-nowrap bg-[rgb(152,16,250)] hover:bg-[rgb(152,16,250)]/90'
                      : 'whitespace-nowrap border-blue-500/50 hover:border-blue-500 hover:bg-blue-500/10'
                  }
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Article Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden hover:border-blue-500/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-video overflow-hidden bg-muted relative">
                  <ImageWithFallback
                    src={article.image || ''}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {article.oracle.name}
                    </Badge>

                    <span className="text-xs text-muted-foreground">
                      {timeAgo(article.createdAt)}
                    </span>
                  </div>

                  <h3 className="mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                    {article.title}
                  </h3>

                  <div
                    className="text-sm text-muted-foreground line-clamp-2 mb-3"
                    dangerouslySetInnerHTML={{
                      __html: removeBrokenImages(article.content),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton while loading more */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 py-6">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-40 w-full rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div
            ref={loadMoreRef}
            className="h-10"
          />

          {/* Empty State */}
          {!loading && filteredArticles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="mb-2">No articles found</h3>
              <p className="text-sm text-muted-foreground">
                No hot takes available in this category yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
