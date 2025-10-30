# Dehouse of Predictions

A Web3 x AI prediction platform featuring specialized AI prediction agents that provide expertise across cryptocurrency, politics, sports, tech, and more.

## Features

### Core Functionality
- **AI Prediction Agents**: Specialized oracles providing expert predictions across different categories
- **Wallet Integration**: Connect with MetaMask, Phantom, Backpack, Google, or Apple login
- **XP & Leveling System**: Earn XP through predictions with a scaling curve
- **Leaderboard**: Compete with other users for top XP and level rankings
- **Daily Quests**: Complete quests to earn bonus XP
- **Referral System**: Invite friends and earn XP bonuses
- **Share Predictions**: Share predictions via social media
- **Light/Dark Mode**: Full theme support with automatic persistence and system preference detection

### Subscription Tiers
- **Basic (Free)**: 5 total predictions with access to all AI agents
- **Pro ($4.99/mo)**: Unlimited predictions, 2x XP multiplier, priority responses

### XP & Level System
- **Level Calculation**: `Level = floor(Total Predictions ÷ 100) + 1`
  - 0-99 predictions = Level 1
  - 100-199 predictions = Level 2
  - 200-299 predictions = Level 3
  - No level cap - unlimited growth

- **XP Per Prediction**: Scales with total prediction count
  - Formula: `XP = baseXP × (1 + log₁₀(totalPredictionCount + 1) × 0.5)`
  - Prediction #1: 15 XP
  - Prediction #10: 23 XP
  - Prediction #100: 30 XP
  - Prediction #1000+: 37 XP

- **XP Multipliers**:
  - Pro subscription: 2x
  - 3+ day streak: 1.1x
  - 7+ day streak: 1.2x
  - 14+ day streak: 1.3x
  - 30+ day streak: 1.5x

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Custom component library
- **State Management**: React hooks
- **Theme**: GitHub-inspired dark theme with muted colors

## Project Structure

```
├── App.tsx                  # Main application entry point
├── components/              # React components
│   ├── ChatPage.tsx        # Main chat/prediction interface
│   ├── LeaderboardPage.tsx # XP & level leaderboard
│   ├── SettingsPage.tsx    # User settings & subscription
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── HotTakesPage.tsx    # Curated prediction articles
│   └── ui/                 # Reusable UI components
├── lib/                    # Utilities and core logic
│   ├── types.ts           # TypeScript type definitions
│   ├── mockData.ts        # Mock data for development
│   ├── xpSystem.ts        # XP calculation and leveling
│   └── useXP.ts           # XP management hook
└── styles/
    └── globals.css        # Global styles and Tailwind config
```

## Key Components

### Main Pages
- **ChatPage**: Primary interface for interacting with AI oracles
- **LeaderboardPage**: View top users sorted by XP or Level
- **SettingsPage**: Manage account, subscription, and preferences
- **HotTakesPage**: Browse curated prediction articles

### Dialogs & Modals
- **WalletConnectDialog**: Connect wallet or social login
- **SubscriptionManagementDialog**: Manage Pro subscription
- **HowItWorksDialog**: Explains XP and leveling system
- **SharePredictionDialog**: Share predictions on social media

## Development Notes

- The app uses a simplified level system based purely on prediction count
- All house/guild concepts have been removed
- Level titles have been removed - levels are defined by numbers only
- No level cap - users can progress infinitely
- Subscription management is integrated into Settings page
- Sign-in is required for chat functionality
- GitHub-inspired muted color theme throughout

## Payment Integration

- **Stripe**: Credit/debit card payments for Pro subscription
- **Crypto**: Native Web3 wallet payments supported
- Subscription management available in Settings

## Guidelines

See `/guidelines` folder for detailed documentation on:
- XP System mechanics
- Referral System implementation
- General development guidelines
