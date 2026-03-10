import {
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { getRandomPromptHomepage, SUGGESTED_PROMPTS_HOMEPAGE } from '../constants/prediction';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Card } from './ui/card';
interface HomePageProps {
  onGetStarted: () => void;
  onExplorePredictions: (prompt?: string) => void;
  user: any;
}

const FEATURES = [
  {
    icon: Brain,
    title: 'Expert AI Agents',
    description:
      'Specialized AI agents provide insights across crypto, tech, politics, sports, and more',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Predictions',
    description:
      'Get instant predictions on trending topics and breaking news events',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'Gamified Experience',
    description:
      'Earn XP, level up, complete quests, and climb the leaderboard',
    gradient: 'from-blue-600 to-blue-700',
  },
  {
    icon: Target,
    title: 'Track Your Performance',
    description: 'Monitor your prediction accuracy and improve over time',
    gradient: 'from-blue-500 to-blue-600',
  },
];

const STATS = [
  { label: 'Active Users', value: '50K+', icon: Users },
  { label: 'Predictions Made', value: '2.5M+', icon: Target },
  { label: 'AI Agents', value: '12+', icon: Brain },
  { label: 'Average Accuracy', value: '87%', icon: Award },
];

const BENEFITS = [
  'Access to specialized AI prediction agents',
  'Earn XP and level up with every prediction',
  'Compete on the global leaderboard',
  'Daily quests and challenges',
  'Pro tier with unlimited predictions',
  'Track your prediction history and accuracy',
];

const SUGGESTED_PROMPTS = getRandomPromptHomepage(SUGGESTED_PROMPTS_HOMEPAGE)

export function HomePage({
  onGetStarted,
  onExplorePredictions,
  user,
}: HomePageProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    // Simulate query processing
    setTimeout(() => {
      setIsLoading(false);
      onExplorePredictions(query);
    }, 800);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handlePromptClick = (promptText: string) => {
    setQuery(promptText);
    // Auto-submit after brief delay
    setTimeout(() => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onExplorePredictions(promptText);
      }, 500);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar - Mobile only */}
      {/* <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-center bg-blue-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <span className="text-lg">🔮</span>
            </div>
            <span className="font-semibold">Dehouse of Predictions</span>
          </div>
        </div>
      </header> */}

      {/* Hero Section with Futuristic Gradient */}
      <section
        className="relative overflow-hidden md:mt-0"
        style={{
          minHeight: '600px',
          height: '100vh',
        }}
      >
        {/* Radial Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 0%, #60a5fa 0%, #2563eb 25%, #1e3a8a 55%, #0f172a 100%)',
          }}
        />

        {/* Subtle Bottom Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.1) 100%)',
          }}
        />

        {/* Content Container */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 max-w-[1140px]">
            <div className="text-center flex gap-6 flex-col">
              {/* Headline */}
              <h1
                className="text-white font-semibold"
                style={{
                  fontSize: 'clamp(32px, 5vw, 60px)',
                  lineHeight: '1.1',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                AI-Powered Market Predictions - Your Personalized AI for Markets
              </h1>

              {/* Subtitle */}
              <p
                className="mx-auto max-w-2xl"
                style={{
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  lineHeight: '1.5',
                  fontWeight: 400,
                  color: '#bfdbfe',
                }}
              >
                Ask your personalized market AI and stay one move ahead.
              </p>

              {/* Search Input Form */}
              <form
                onSubmit={handleSubmit}
                role="search"
                className="mx-auto"
                style={{
                  maxWidth: '1000px',
                  width: '100%',
                  paddingTop: '8px',
                }}
              >
                <div
                  className={`relative transition-all duration-150 ease-out flex items-center ${isFocused ? 'scale-[1.01]' : ''
                    }`}
                  style={{
                    height: 'clamp(56px, 8vw, 72px)',
                    borderRadius: '9999px',
                    background: 'rgba(15, 23, 27, 0.4)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: isFocused
                      ? '0 0 0 2px rgba(59, 130, 246, 0.3), 0 8px 24px rgba(59, 130, 246, 0.2)'
                      : '0 0 0 1px rgba(59, 130, 246, 0.15), 0 4px 16px rgba(0, 0, 0, 0.2)',
                    padding: '0 20px',
                  }}
                >
                  <TextareaAutosize
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value.slice(0, 500))}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Ask a question to get started…"
                    disabled={isLoading}
                    aria-label="Ask a market question"
                    className="w-full h-full bg-transparent border-0 outline-none pr-16 text-[16px] scrollbar-hide resize-none"
                    style={{
                      color: '#ccc',
                      caretColor: '#3b82f6',
                    }}
                    maxRows={2}
                    minRows={1}
                  />

                  <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group flex-shrink-0 shadow-sm cursor-pointer hover:scale-105"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(59, 130, 246, 0.25)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      boxShadow:
                        '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mx-auto animate-spin text-blue-500" />
                    ) : (
                      <ArrowRight
                        className="w-5 h-5 mx-auto text-blue-500 transition-transform duration-150 group-hover:translate-x-0.5"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25))',
                        }}
                      />
                    )}
                  </button>
                </div>
              </form>

              {/* Suggested Prompts */}
              <div
                className="mx-auto"
                style={{
                  maxWidth: '1000px',
                  paddingTop: '8px',
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt.text)}
                      className="group text-left transition-all duration-150 ease-out cursor-pointer"
                      style={{
                        borderRadius: '14px',
                        padding: '15px',
                        background: 'rgba(15, 23, 27, 0.7)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow =
                          '0 2px 8px rgba(0, 0, 0, 0.15)';
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 transition-opacity duration-150"
                          style={{
                            width: '22px',
                            height: '22px',
                          }}
                        >
                          <prompt.icon
                            className="w-full h-full group-hover:opacity-100 opacity-80 transition-opacity duration-150"
                            style={{ color: '#3b82f6' }}
                          />
                        </div>
                        <p
                          className="line-clamp-2"
                          style={{
                            fontSize: '14px',
                            lineHeight: '1.4',
                            color: '#bfdbfe',
                            fontWeight: 400,
                          }}
                        >
                          {prompt.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="flex justify-center">
                  <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-5xl md:text-5xl">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make informed predictions and compete with
            the best
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start making predictions in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto">
                <span className="text-2xl text-white">1</span>
              </div>
              <h3 className="text-xl">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Sign in with MetaMask, Phantom, Backpack, Google, or Apple
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto">
                <span className="text-2xl text-white">2</span>
              </div>
              <h3 className="text-xl">Choose an AI Agent</h3>
              <p className="text-muted-foreground">
                Select from specialized agents in crypto, tech, politics, and
                more
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto">
                <span className="text-2xl text-white">3</span>
              </div>
              <h3 className="text-xl">Make Predictions</h3>
              <p className="text-muted-foreground">
                Get insights, make predictions, earn XP, and level up
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-3xl opacity-20" />
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc2MTcyOTI3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Analytics Dashboard"
              className="relative rounded-2xl shadow-xl w-full"
            />
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <h2 className="text-4xl md:text-4xl">Why Choose Predit Market?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users making informed predictions with
              AI-powered insights
            </p>
            <div className="space-y-3">
              {BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Card className="relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(160deg, #007CF0 0%, #0677e2 30%, #07c1bb 49%, #07c1bb 51%, #0677e2 70%, #007CF0 100%)',
              }}
            />
            <div className="relative px-8 py-12 md:py-16 px-6 text-center text-white space-y-6">
              <h2 className="text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join the future of AI-powered predictions today. Start with 5
                free predictions on our Basic tier.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {user ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => onExplorePredictions('')}
                    className="bg-white text-blue-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Explore Predictions
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={onGetStarted}
                    className="bg-white text-blue-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Sign Up Free
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer Section with Internal Links */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/chat"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    AI Oracles
                  </Link>
                </li>
                <li>
                  <Link
                    to="/hot-takes"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    News
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/subscription"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">AI Predictions</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Market Analysis</span>
                </li>
                <li>
                  <Link
                    to="/xp-history"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    XP & Rewards
                  </Link>
                </li>
                <li>
                  <span className="text-muted-foreground">
                    Real-time Insights
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/settings"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <span className="text-muted-foreground">
                    <Link
                      to="/terms-of-service"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Predit Market AI Oracles. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
