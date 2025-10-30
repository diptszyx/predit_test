# Dehouse of Oracles - XP System Documentation

## Overview
The XP (Experience Points) system rewards users for engaging with the platform and completing various activities. Users earn XP to level up, unlock perks, and gain multipliers that enhance their earnings.

## Core Features

### 1. **Experience Points (XP)**
- Users earn XP for various actions throughout the platform
- XP accumulates towards leveling up
- Total XP is displayed in the header and dashboard

### 2. **Levels**
- Users progress through 25 levels (expandable)
- Each level has a unique title (e.g., "Novice Seeker", "Grand Oracle")
- Levels unlock perks, features, and bonuses
- Level progression requires increasingly more XP

### 3. **Multipliers**
- **Subscription Tiers:**
  - Basic (Free): 1.0x
  - Pro (Premium): 2.0x

- **Streak Bonuses:**
  - 3+ days: 1.1x
  - 7+ days: 1.2x
  - 14+ days: 1.3x
  - 30+ days: 1.5x

- **House Membership (Based on House Level):**
  - Level 1 House: 1.1x
  - Level 2 House: 1.15x
  - Level 3 House: 1.2x
  - Level 4 House: 1.25x
  - Level 5 House: 1.3x
  - Level 6 House: 1.35x
  - Level 7 House: 1.4x
  - Level 8 House: 1.45x
  - Level 9 House: 1.5x
  - Level 10 House: 1.6x
  
- **House Role Bonuses (Added to House Level Multiplier):**
  - Regular Member: No bonus
  - Active Contributor (Top 25%): +0.02x
  - Officer (Appointed by Leader): +0.03x
  - Leader (House Creator): +0.05x

- **Event Multipliers:**
  - Double XP Events: 2.0x
  - Oracle Birthdays: 1.5x

## XP Actions

### Oracle Predictions (Primary XP Source)
- **Ask for Prediction**: XP scales with total prediction count using exponential curve
  - Formula: `XP = baseXP × (1 + log₁₀(totalPredictionCount + 1) × 0.5)`
  - Starting at 15 XP for first prediction
  - Gradually increasing to ~37 XP at 1000+ predictions
- **Premium Predictions (6+/day, Pro only)**: 30 XP base (also scales with curve)
- **Daily Prediction Streak Bonus**: 100 XP

**Note:** Free users (Basic tier) are limited to 5 predictions per day. Pro subscribers have unlimited predictions.

### Daily Activities
- **Complete Quest**: Quest-specific XP reward (typically 150 XP)
- **3-Day Streak**: 100 XP bonus
- **7-Day Streak**: 250 XP bonus
- **30-Day Streak**: 750 XP bonus

### Milestones
- **10 Predictions Asked**: 250 XP
- **50 Predictions Asked**: 750 XP
- **100 Predictions Asked**: 1500 XP

### Subscriptions
- **Subscribe to Pro**: 1500 XP

## Level Progression

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Novice Seeker |
| 2 | 100 | Curious Explorer |
| 3 | 300 | Oracle Apprentice |
| 4 | 600 | Prophecy Student |
| 5 | 1,200 | Vision Seeker |
| 10 | 7,500 | Prophecy Master |
| 15 | 25,000 | Fortune Sage |
| 20 | 60,000 | Grand Oracle |
| 24 | 100,000 | Omniscient One |
| 25 | 110,000 | Deity of Prophecy |

## Technical Implementation

### Files
- `/lib/xpSystem.ts` - Core XP configuration and utilities
- `/lib/useXP.ts` - React hook for XP management
- `/components/XPDisplay.tsx` - Visual XP/level display
- `/components/XPNotification.tsx` - XP gain notifications

### Key Components
- **XPDisplay.tsx**: Shows current XP and level with progress bar
- **XPNotification.tsx**: Animated toasts when XP is earned
- **XPInfoDialog.tsx**: Compact XP system explanation
- **HowItWorksDialog.tsx**: Comprehensive 4-tab XP guide (Overview, Earning XP, Multipliers, Houses)
- **Dashboard.tsx**: Central hub showing XP summary, quests, and referrals
- **LeaderboardPage.tsx**: Rankings of top XP earners
- **Sidebar.tsx**: Shows level progress with XP info button

### Usage Example

```typescript
import { useXP } from './lib/useXP';

function MyComponent() {
  const { awardXPToUser, getLevelInfo } = useXP(user, updateUser);
  
  // Award XP
  const handleAction = () => {
    awardXPToUser('VISIT_ORACLE', {
      showToast: true, // Show notification
      customMultipliers: [1.5] // Optional custom multipliers
    });
  };
  
  // Get level info
  const levelInfo = getLevelInfo();
  console.log(levelInfo.level, levelInfo.title, levelInfo.progress);
}
```

### Awarding XP

XP is automatically awarded when:
1. User asks for a prediction (XP scales with total prediction count)
2. User completes a quest (150 XP)
3. User maintains login streaks (100/250/750 XP for 3/7/30 days)
4. User achieves prediction milestones (250/750/1500 XP for 10/50/100 predictions)
5. User subscribes to Pro (1500 XP)

### Notifications

Two types of notifications are shown:
1. **XP Gain**: Toast notification showing XP gained and source
2. **Level Up**: Full-screen celebration when user levels up

## House System

### User-Created Houses
- **Creation**: Pro subscribers can create houses (+500 XP)
- **Leadership**: House creator becomes Leader with special bonuses
- **Capacity**: Houses start at 20 members, expand with house level (max 100)
- **House XP**: 50% of member XP contributes to house XP pool
- **Leveling**: Houses level from 1-10 based on cumulative house XP

### House Levels & Benefits
Houses level up by accumulating house XP, unlocking better multipliers:
- **Level 1**: 1.1x multiplier (0 house XP)
- **Level 2**: 1.15x multiplier (5,000 house XP)
- **Level 3**: 1.2x multiplier (15,000 house XP) - Unlocks house quests
- **Level 4**: 1.25x multiplier (35,000 house XP)
- **Level 5**: 1.3x multiplier (65,000 house XP) - Unlocks house events
- **Level 6**: 1.35x multiplier (110,000 house XP)
- **Level 7**: 1.4x multiplier (175,000 house XP)
- **Level 8**: 1.45x multiplier (265,000 house XP)
- **Level 9**: 1.5x multiplier (385,000 house XP)
- **Level 10**: 1.6x multiplier (550,000 house XP) - Maximum prestige

### House Roles
- **Leader**: +0.05x bonus multiplier, full management powers
- **Officer**: +0.03x bonus multiplier, limited management powers
- **Active Contributor**: +0.02x bonus multiplier, top 25% most active
- **Regular Member**: House level multiplier only

### Weekly House Competition
- **Unified Leaderboard**: All houses compete in a single ranking
- **Ranking Metric**: Average XP per active member (past 7 days)
- **Weekly Rewards**: Bonus house XP and personal XP for top 10 houses
- **Monthly Championships**: Overall top houses win grand prizes

### Joining Houses
- Browse houses by category, level, and activity
- Join instantly if house has capacity
- Unlimited house switching (no penalties)
- Earn +100 XP when joining
- Immediately gain house XP multiplier

## Implemented Features

### Core Systems
1. ✅ **Leaderboard System**: Top 100 XP earners with user rankings and stats
2. ✅ **Referral System**: Invite friends and earn XP bonuses (200 XP for invite, 300 XP when they join)
3. ✅ **House Ranks**: Officer (Lv 20-24) and Leader (Lv 25+) positions with higher multipliers
4. ✅ **Daily Prediction Limits**: Smart keyword detection system for free vs premium users
5. ✅ **XP Info Dialogs**: Comprehensive guides explaining the XP system
6. ✅ **Visual Progress**: XP displays in sidebar, dashboard, and header with progress bars

### Future Enhancements
1. **Seasonal Events**: Special XP multipliers during platform events
2. **Weekly Challenges**: Special quests with bonus XP
3. **Prestige System**: Reset levels for exclusive rewards
4. **XP Boosts**: Purchasable temporary XP multipliers
5. **Season 2**: New houses, challenges, and reward structures

### Balancing
- Monitor user progression rates
- Adjust XP values based on engagement metrics
- Add new levels as needed
- Balance house rewards to prevent dominance
- Introduce seasonal XP caps if necessary

## Design Philosophy

### User Experience
1. **Always show feedback**: Toast notifications when XP is earned
2. **Celebrate milestones**: Level ups feel rewarding
3. **Make progress visible**: XP/level displayed in sidebar, dashboard, and header
4. **Balance rewards**: XP gains feel fair and achievable
5. **Encourage daily play**: Streaks and daily quests drive engagement

### Gamification Elements
1. **25 Unique Levels**: Each with custom titles (e.g., "Deity of Prophecy")

3. **Multiplier Stacking**: Combine subscription, streaks, houses, and events
3. **Visual Progress**: Yellow progress bars and tier gradients
4. **Competitive Elements**: Leaderboard rankings and house competitions
5. **Social Rewards**: Referral bonuses and house participation

### Terminology
- **Summon Level**: Used instead of "Level" or "Player Level"
- **Basic**: Free tier users
- **Pro**: Premium tier users
- **House**: Guild/clan system (not "Guild" or "Clan")
- **Oracle**: AI prediction agents (not "AI" or "Agent")
- **Prediction**: User questions to oracles (not "Question" or "Query")
