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
  - Summoner (Free): 1.0x
  - Summon Master: 2.0x

- **Streak Bonuses:**
  - 3+ days: 1.1x
  - 7+ days: 1.2x
  - 14+ days: 1.3x
  - 30+ days: 1.5x

- **House Membership:**
  - Regular Member: 1.1x
  - Officer: 1.25x
  - Leader: 1.5x

- **Event Multipliers:**
  - Weekend Bonus: 1.25x
  - Double XP Events: 2.0x
  - Oracle Birthdays: 1.5x

## XP Actions

### Oracle Interactions
- **First Oracle Visit**: 50 XP (one-time per oracle)
- **Regular Oracle Visit**: 10 XP
- **Chat Message**: 5 XP per message

### Oracle Predictions
- **Ask for Prediction (1-5/day)**: 25 XP
- **Ask for Prediction (6+/day, Summon Master only)**: 100 XP
- **Daily Prediction Streak Bonus**: 50 XP

**Note:** Free users (Summoners) are limited to 5 predictions per day. Summon Master subscribers can ask unlimited predictions and earn 100 XP for each prediction beyond the 5th daily ask.

### Daily Activities
- **Daily Login**: 20 XP
- **Complete Quest**: 100 XP + quest-specific XP reward
- **3-Day Streak**: 50 XP bonus
- **7-Day Streak**: 150 XP bonus
- **30-Day Streak**: 500 XP bonus

### Social & Community
- **Share Prediction**: 15 XP
- **Invite Friend**: 200 XP
- **Friend Joins**: 300 XP (when they sign up)

### House Activities
- **Join House**: 100 XP
- **House Contribution**: 40 XP
- **House Event Participation**: 80 XP

### Milestones
- **10 Predictions Asked**: 150 XP
- **50 Predictions Asked**: 500 XP
- **100 Predictions Asked**: 1000 XP

### Subscriptions
- **Subscribe to Summon Master**: 1000 XP

## Level Progression

| Level | XP Required | Title | Perks |
|-------|-------------|-------|-------|
| 1 | 0 | Novice Seeker | - |
| 2 | 100 | Curious Explorer | - |
| 3 | 250 | Oracle Apprentice | - |
| 4 | 500 | Prophecy Student | - |
| 5 | 1,000 | Vision Seeker | Unlock special oracle chat themes |
| 10 | 7,500 | Prophecy Master | Unlock exclusive oracle tier, Special oracle insights |
| 15 | 25,000 | Fortune Sage | Custom oracle creation, Enhanced oracle responses |
| 20 | 60,000 | Grand Oracle | Unlock all features, +20% bonus XP, Platform legend status |
| 25 | 130,000 | Deity of Prophecy | Maximum prestige, +50% bonus XP, Platform legend status |

## Achievements

### Explorer Achievements
- **First Steps**: Visit your first oracle (50 XP)
- **Oracle Explorer**: Visit 5 different oracles (150 XP)
- **Oracle Master**: Visit all 18 oracles (500 XP)

### Prediction Achievements
- **Prediction Novice**: Make 10 predictions (100 XP)
- **Prediction Adept**: Make 50 predictions (300 XP)
- **Prediction Legend**: Make 100 predictions (1000 XP)

### Streak Achievements
- **Streak Starter**: 3-day login streak (50 XP + 1.1x multiplier)
- **Week Warrior**: 7-day login streak (150 XP + 1.2x multiplier)
- **Monthly Devotee**: 30-day login streak (500 XP + 1.5x multiplier)

### Milestone Achievements
- **Prophecy Master**: Reach Level 10 (Special Oracle Tier)
- **Grand Oracle**: Reach Level 20 (Platform Legend Status + All Features)
- **House Member**: Join a house (100 XP + 1.1x XP bonus)

## Technical Implementation

### Files
- `/lib/xpSystem.ts` - Core XP configuration and utilities
- `/lib/useXP.ts` - React hook for XP management
- `/components/XPDisplay.tsx` - Visual XP/level display
- `/components/XPNotification.tsx` - XP gain notifications
- `/components/XPAchievementsCard.tsx` - Achievements display

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
1. User visits an oracle (first visit = 50 XP, subsequent = 10 XP)
2. User asks for a prediction (25 XP for first 5/day, 100 XP for 6+/day if Summon Master)
3. User completes a quest
4. User maintains login streaks
5. User achieves milestones

### Notifications

Two types of notifications are shown:
1. **XP Gain**: Toast notification showing XP gained and source
2. **Level Up**: Full-screen celebration when user levels up

## House Season System

### Season 1 - The Summons
- **Duration**: Until December 12, 2025
- **Mechanic**: All XP earned by house members contributes to house ranking
- **End of Season Rewards**:
  - 1st Place House: All members receive **3x** their total Season 1 XP as bonus
  - 2nd Place House: All members receive **2x** their total Season 1 XP as bonus
  - 3rd Place House: All members receive **1.5x** their total Season 1 XP as bonus

### House Benefits
1. **Immediate XP Multiplier**: +1.1x on all XP earned (stacks with other multipliers)
2. **Exclusive Quests**: Access to house-only daily and weekly challenges
3. **Collaborative Predictions**: Pool insights with house members
4. **Season End Bonus**: Massive XP bonus based on house ranking
5. **Special Recognition**: House badges and exclusive platform status

### Joining Houses
- Users can only be in one house at a time
- Joining a house awards +100 XP
- Leaving a house removes all house benefits
- Users can join a different house after leaving

## Future Enhancements

### Planned Features
1. **Seasonal Events**: Special XP multipliers during platform events
2. **Leaderboards**: Compete with other users for XP rankings
3. **Weekly Challenges**: Special quests with bonus XP
4. **Prestige System**: Reset levels for exclusive rewards
5. **XP Boosts**: Purchasable temporary XP multipliers
6. **Achievement Badges**: Unlock special visual badges for major accomplishments
7. **House Ranks**: Officer and Leader positions with higher multipliers
8. **Season 2**: New houses, challenges, and reward structures

### Balancing
- Monitor user progression rates
- Adjust XP values based on engagement metrics
- Add new levels as needed
- Balance house rewards to prevent dominance
- Introduce seasonal XP caps if necessary

## Best Practices

1. **Always show feedback**: Toast notifications when XP is earned
2. **Celebrate milestones**: Level ups should feel rewarding
3. **Make progress visible**: Display XP/level in prominent locations
4. **Balance rewards**: Ensure XP gains feel fair and achievable
5. **Encourage daily play**: Use streaks and daily quests effectively
