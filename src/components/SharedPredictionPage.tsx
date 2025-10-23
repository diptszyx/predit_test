import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import logoIcon from "/logo.png";

interface SharedPredictionPageProps {
  predictionId: string;
  onBack: () => void;
}

interface PredictionData {
  question: string;
  answer: string;
  oracleName: string;
  oracleAvatar: string;
  oracleEmoji: string;
  timestamp: string;
}

export function SharedPredictionPage({
  predictionId,
  onBack,
}: SharedPredictionPageProps) {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(
    null
  );

  useEffect(() => {
    // Load prediction data from localStorage
    console.log("SharedPredictionPage: Looking for prediction:", predictionId);
    const storedData = localStorage.getItem(`prediction-${predictionId}`);
    console.log("SharedPredictionPage: Found data:", storedData);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      console.log("SharedPredictionPage: Parsed data:", parsedData);
      setPredictionData(parsedData);
    } else {
      console.warn(
        "SharedPredictionPage: No prediction data found in localStorage"
      );
    }
  }, [predictionId]);

  if (!predictionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4">Prediction Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This prediction link may be invalid or expired.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Oracles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background with Oracle Avatar */}
      <div className="absolute inset-0 z-0">
        {/* Avatar as background with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 blur-3xl scale-110"
          style={{
            backgroundImage: `url(${predictionData.oracleAvatar})`,
          }}
        />
        {/* Gradient overlays for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-blue-600/5" />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={logoIcon}
                alt="Dehouse of Oracles"
                className="w-8 h-8"
              />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dehouse of Oracles
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Platform
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-6 text-center">
          <h1 className="mb-2">Shared Prediction</h1>
          <p className="text-muted-foreground">
            From {predictionData.oracleName} on{" "}
            {new Date(predictionData.timestamp).toLocaleDateString()}
          </p>
        </div>

        {/* Oracle Avatar */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-600/30 shadow-xl">
              <img
                src={predictionData.oracleAvatar}
                alt={predictionData.oracleName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
              <span className="text-sm text-white">
                {predictionData.oracleName}
              </span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-purple-600/30 bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-lg">❓</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm mb-2">Question</h3>
                <p className="leading-relaxed">{predictionData.question}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Card */}
        <Card className="mb-8 border-green-600/30 bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-lg">{predictionData.oracleEmoji}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm mb-2">
                  {predictionData.oracleName}'s Prediction
                </h3>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {predictionData.answer}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="border-border bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 text-center">
            <h3 className="mb-3">Want your own prediction?</h3>
            <p className="text-muted-foreground mb-6">
              Join Dehouse of Oracles and chat with specialized AI oracle agents
              for free!
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg hover:shadow-purple-500/50 transition-shadow"
              onClick={onBack}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Try Dehouse of Oracles
            </Button>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>Disclaimer:</strong> This prediction is for entertainment
            purposes only and should not be considered financial, investment, or
            professional advice. Always consult with qualified experts before
            making important decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
