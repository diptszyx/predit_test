import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Sparkles, ChevronRight, Landmark, TrendingUp, Check } from "lucide-react";
import { Badge } from "./ui/badge";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOracles, setSelectedOracles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const steps = [
    {
      title: "Welcome to Predit of Predictions",
      subtitle: "Your AI Prediction Agents for Smarter Insights",
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-2">
            <h2>AI-Powered Market Intelligence</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get real-time insights from specialized AI Oracles trained on cryptocurrency, blockchain, and digital assets to make informed trading decisions on Predit.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-xs text-muted-foreground">Accurate Predictions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-xs text-muted-foreground">Real-Time Updates</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-xs text-muted-foreground">Market Analysis</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Oracles",
      subtitle: "Select AI specialists to guide your trading decisions",
      content: (
        <div className="space-y-4 max-w-2xl mx-auto">
          <Card
            onClick={() => {
              setSelectedOracles(prev =>
                prev.includes("crypto-crystal") ? prev.filter(o => o !== "crypto-crystal") : [...prev, "crypto-crystal"]
              );
            }}
            className={`cursor-pointer transition-all ${selectedOracles.includes("crypto-crystal")
              ? "border-cyan-500 bg-cyan-500/10"
              : "border-border hover:border-cyan-500/50"
              }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">💎</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3>Crypto Crystal Czar</h3>
                    {selectedOracles.includes("crypto-crystal") && (
                      <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Expert analysis of cryptocurrency markets, blockchain technology, DeFi protocols, and digital asset trends.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Bitcoin</Badge>
                    <Badge variant="outline" className="text-xs">DeFi</Badge>
                    <Badge variant="outline" className="text-xs">Altcoins</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => {
              setSelectedOracles(prev =>
                prev.includes("economics") ? prev.filter(o => o !== "economics") : [...prev, "economics"]
              );
            }}
            className={`cursor-pointer transition-all ${selectedOracles.includes("economics")
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-border hover:border-emerald-500/50"
              }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3>Economics Oracle</h3>
                    {selectedOracles.includes("economics") && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Track market trends, economic indicators, and financial events that drive betting opportunities.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Fed Rates</Badge>
                    <Badge variant="outline" className="text-xs">Market Trends</Badge>
                    <Badge variant="outline" className="text-xs">GDP & Inflation</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Personalize Your Feed",
      subtitle: "Select topics you want to track",
      content: (
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "us-elections", label: "US Elections", category: "politics" },
              { id: "global-politics", label: "Global Politics", category: "politics" },
              { id: "fed-rates", label: "Federal Reserve Rates", category: "economics" },
              { id: "inflation", label: "Inflation & CPI", category: "economics" },
              { id: "stock-market", label: "Stock Market", category: "economics" },
              { id: "geopolitics", label: "Geopolitical Events", category: "politics" },
              { id: "crypto", label: "Cryptocurrency", category: "economics" },
              { id: "policy", label: "Policy Changes", category: "politics" },
            ].map((interest) => (
              <Card
                key={interest.id}
                onClick={() => {
                  setSelectedInterests(prev =>
                    prev.includes(interest.id)
                      ? prev.filter(i => i !== interest.id)
                      : [...prev, interest.id]
                  );
                }}
                className={`cursor-pointer transition-all ${selectedInterests.includes(interest.id)
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-border hover:border-blue-500/50"
                  }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedInterests.includes(interest.id)}
                        onCheckedChange={() => { }}
                      />
                      <span>{interest.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {interest.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-blue-500/30 bg-blue-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="mb-1 text-blue-400">AI Recommendation</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on current market activity, US Elections and Federal Reserve Rates are showing high trading volume.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Connect to Predit",
      subtitle: "Optional: Link your account for personalized insights",
      content: (
        <div className="text-center space-y-6 max-w-lg mx-auto">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h3>Enhanced Trading Experience</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Predit account to get personalized news filtered by your active bets,
              real-time odds updates, and one-click market access.
            </p>
          </div>

          <div className="space-y-3 text-left bg-card border border-border rounded-xl p-4">
            <h4 className="text-sm">Benefits of connecting:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Auto-filter news based on your open positions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Real-time alerts for market-moving events</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>One-click access to betting markets</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Portfolio-aware predictions</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Connect Predit Account
            </Button>
            <Button variant="ghost" className="w-full" onClick={onComplete}>
              Skip for now
            </Button>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${index === currentStep
                ? "w-8 bg-blue-500"
                : index < currentStep
                  ? "w-2 bg-blue-500"
                  : "w-2 bg-accent"
                }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="mb-2">{steps[currentStep].title}</h1>
            <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
          </div>
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {currentStep > 0 ? (
            <Button variant="ghost" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            {currentStep < steps.length - 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
