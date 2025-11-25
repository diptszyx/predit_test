import { Search, Moon, Sun, TrendingUp, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";

interface TopBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function TopBar({ darkMode, onToggleDarkMode }: TopBarProps) {
  const [searchFocus, setSearchFocus] = useState(false);

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-4 p-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
            <span className="text-xl">🔮</span>
          </div>
          <div className="hidden md:block">
            <h1 className="leading-none">Predit Market of Predictions</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ask AI to find insights... (e.g., 'US election polls', 'Fed rate predictions')"
            className={`pl-10 bg-accent border-border transition-all ${searchFocus ? "ring-2 ring-blue-500/50" : ""
              }`}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
          />
          {searchFocus && (
            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-card border border-border rounded-lg shadow-xl">
              <p className="text-xs text-muted-foreground mb-2">AI Suggestions:</p>
              <div className="space-y-1">
                {["US election betting odds", "Federal Reserve interest rate impact", "Geopolitical risks in Asia"].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="w-full text-left text-sm p-2 hover:bg-accent rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <TrendingUp className="w-4 h-4" />
            Predit Market
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            className="rounded-lg"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
