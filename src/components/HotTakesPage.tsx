import { CircleAlert, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { timeAgo } from '../lib/date';
import { sanitizeArticleHtml } from '../lib/htmlUtil';
import { News, newsService } from '../services/news.service';
import { Topic, topicServices } from '../services/topic-admin.service';
import useAuthStore from '../store/auth.store';
import { checkIsAdmin } from '../utils/isAdmin';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Skeleton } from './ui/skeleton';

interface HotTakesPageProps {
  onArticleClick: (article: News) => void;
  onBack: () => void;
}

const PAGE_SIZE = 12;

export function HotTakesPage({ onArticleClick, onBack }: HotTakesPageProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = checkIsAdmin(user)
  const [articles, setArticles] = useState<News[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [isLoadingTopicList, setIsLoadingTopicList] = useState(false);

  const pageWrapper = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selected, setSelected] = useState<News | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load articles
  const loadArticles = async (reset = false) => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;

    try {
      setLoading(true);
      const offset = reset ? 0 : page * PAGE_SIZE;
      const result = await newsService.getAll(
        topicFilter || undefined,
        PAGE_SIZE,
        offset
      );

      setArticles((prev) => (reset ? result : [...prev, ...result]));
      setHasMore(result.length === PAGE_SIZE);
      if (reset) setPage(1);
      else setPage((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  };

  // Load topics
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingTopicList(true);
        const topics = await topicServices.getAllTopics();
        setTopicList(topics);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTopicList(false);
      }
    })();
  }, []);

  // Reset articles when topicFilter changes
  useEffect(() => {
    loadArticles(true);
    pageWrapper.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [topicFilter]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          loadArticles(false);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadArticles]);

  const handleDelete = async () => {
    if (!selected) {
      toast.error("Something wrong to delete this news")
      return
    };

    setIsDeleting(true);
    try {
      const res = await newsService.deleteNewsById(selected.id)
      if (res === 204) {
        // Remove the deleted item from the local state
        setArticles((prev) => prev.filter((article) => article.id !== selected.id))
        toast.success("News deleted successfully")
      }
    } catch (error) {
      console.log("Failed to delete news: ", error)
      toast.error("Failed to delete news")
    } finally {
      setIsDeleting(false);
      setOpenDeleteConfirm(false)
      setSelected(null)
    }
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      ref={pageWrapper}
    >
      <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <DialogContent className="max-w-2xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CircleAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Confirm Delete News
            </DialogTitle>
            <DialogDescription className="space-y-4 text-sm leading-relaxed">
              <p>
                Are you sure you want to delete this news?
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Title:</span>{' '}
                <span className="font-medium text-foreground">
                  {selected?.title}
                </span>
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-left mb-2 text-[40px]">Hot Takes</h1>
            <p className="text-left text-muted-foreground mb-8">
              Latest insights and analyses from our oracle community
            </p>
          </div>

          {/* Topic Filter */}
          <div className="mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                size="sm"
                variant={topicFilter === null ? 'default' : 'outline'}
                onClick={() => setTopicFilter(null)}
                className="min-w-[60px] text-xs"
                style={{ padding: '4px 12px' }}
              >
                All
              </Button>

              {isLoadingTopicList
                ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-20 rounded"
                  />
                ))
                : topicList.map((topic) => (
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
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden bg-muted relative">
                  <ImageWithFallback
                    src={article.image || ''}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

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
                      __html: sanitizeArticleHtml(article.content),
                    }}
                  />

                  {isAdmin &&
                    <div className='text-right'>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e: Event) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setOpenDeleteConfirm(true)
                          setSelected(article)
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  }
                </div>
              </div>
            ))}

            {/* Skeleton while loading */}
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-40 w-full rounded-lg"
                />
              ))}
          </div>

          {/* Infinite scroll trigger */}
          <div
            ref={loadMoreRef}
            className="h-10"
          />

          {/* Empty state */}
          {!loading && articles.length === 0 && (
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
