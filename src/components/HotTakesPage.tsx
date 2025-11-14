import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ThumbsUp, MessageSquare, Share2, ArrowLeft } from 'lucide-react';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { News } from '../services/news.service';
import { timeAgo } from '../lib/date';

interface HotTakesPageProps {
  articles: News[];
  onArticleClick: (article: News) => void;
  onBack: () => void;
}

export function HotTakesPage({
  articles,
  onArticleClick,
  onBack,
}: HotTakesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (articles?.length === 0) {
      onBack();
    }
  }, []);

  // Map oracle IDs to categories
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

  // Get unique categories from articles
  const availableCategories = [
    'all',
    ...new Set(
      articles?.map(
        (article) => oracleCategoryMap[article.oracle.id] || 'Other'
      )
    ),
  ].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return a.localeCompare(b);
  });

  // Filter articles by category
  const filteredArticles =
    selectedCategory === 'all'
      ? articles
      : articles?.filter(
          (article) => oracleCategoryMap[article.oracle.id] === selectedCategory
        );

  return (
    <div className="min-h-screen bg-background mt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2 hover:bg-blue-500/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-left mb-2 dark:bg-gradient-to-r dark:from-blue-600 dark:to-cyan-600 bg-clip-text dark:text-[rgb(255,255,255)] text-[40px] light:text-black">
            Hot Takes
          </h1>
          <p className="text-left text-muted-foreground mb-8">
            Latest insights and analyses from our oracle community
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {availableCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
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

        {/* Articles Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles?.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden hover:border-blue-500/50 transition-all duration-300"
            >
              {/* Article Image */}
              <div className="aspect-video overflow-hidden bg-muted relative">
                <ImageWithFallback
                  src={article.image || ''}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Article Content */}
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
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                {/* <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4" />
                    {article.likes || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    {article.comments || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    {article.shares || 0}
                  </span>
                </div> */}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles?.length === 0 && (
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
  );
}
