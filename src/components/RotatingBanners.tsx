import { Sparkles, Zap } from 'lucide-react';

interface RotatingBannersProps {
  onNavigate: (page: string) => void;
}

export function RotatingBanners({ onNavigate }: RotatingBannersProps) {
  return (
    <div className="mb-8">
      {/* Two side-by-side banners */}
      <div className="flex gap-4">
        {/* First banner - Specialized Expertise */}
        <div className="flex-1 p-6 rounded-xl bg-card border border-border hover:border-blue-500/50 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2">
                  Specialized Expertise for Pinpoint Accuracy
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fine-tuned on niche data for stocks, cryptos, politics,
                  sports, and more—delivering spot-on predictions that crush the
                  competition.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Second banner - Supercharge */}
        <div className="flex-1 p-6 rounded-xl bg-card border border-border hover:border-blue-500/50 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2">Supercharge s and Investments</h3>
                <p className="text-sm text-muted-foreground">
                  Spot trends, minimize risks, and maximize wins with actionable
                  insights tailored just for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
