# Referral System

## Overview

The Dehouse of Oracles referral system allows users to invite friends and earn XP rewards when those friends join the platform. The system is fully integrated into the Dashboard and includes automatic code generation, link sharing, and XP tracking.

## Features

### Referral Code Generation
- **Automatic Generation**: Each user gets a unique referral code in the format `USERNAME-XXXX`
- **Format**: First 8 characters of username (uppercase, alphanumeric only) + hyphen + 4 random characters
- **Example**: `ORACLESEEKER-A7F2`

### XP Rewards

#### For the Referrer (Person Sharing)
1. **Invite Friend**: +200 XP (awarded when you share your referral link)
2. **Friend Joins**: +300 XP (awarded when your friend creates an account using your code)
3. **Total per Referral**: 500 XP

#### For the Referee (Person Joining)
- **Sign Up Bonus**: +100 XP (awarded immediately when they create an account with a referral code)

### Sharing Options

1. **Copy Referral Code**: Copy just the code (e.g., `ORACLESEEKER-A7F2`)
2. **Copy Referral Link**: Copy full URL with referral parameter (e.g., `https://dehouse.com?ref=ORACLESEEKER-A7F2`)
3. **Share on X (Twitter)**: Pre-filled tweet with referral message and link

## How It Works

### Step 1: User Gets Referral Code
- Navigate to Dashboard (requires wallet connection)
- Scroll to "Invite Friends & Earn XP" card
- Referral code is automatically generated if not exists
- Code is stored in user profile for consistency

### Step 2: Share Referral
- User copies their referral link or code
- Shares it with friends via any channel (social media, messaging, etc.)
- Optionally use the built-in X/Twitter share button

### Step 3: Friend Signs Up
- Friend visits the platform with referral link (`?ref=CODE`)
- System detects referral code in URL and stores it temporarily
- Shows notification: "Referral code detected! Sign up to get your bonus."
- Friend connects wallet or social login to create account

### Step 4: Rewards Distributed
- **Friend** receives 100 XP bonus immediately upon account creation
- **Referrer** receives 200 XP for the invite + 300 XP when friend joins = 500 XP total
- Both users see XP notification

## Technical Implementation

### URL Parameter
- Referral codes are passed via URL query parameter: `?ref=CODE`
- Example: `https://dehouse.com?ref=ORACLESEEKER-A7F2`

### Session Storage
- When referral code is detected, it's stored in `sessionStorage.setItem('pendingReferralCode', code)`
- This persists the code while user completes onboarding
- Cleared after account creation with `sessionStorage.removeItem('pendingReferralCode')`

### User Schema Extensions
```typescript
interface User {
  // ... existing fields
  referralCode?: string;           // User's unique referral code
  referredBy?: string;              // Referral code of user who invited them
  referredFriends?: Array<{         // List of friends they referred
    username: string;
    joinedAt: string;
    xpEarned: number;              // Always 500 (200 + 300)
    avatar?: string;
  }>;
}
```

### XP System Integration
Located in `/lib/xpSystem.ts`:
- `INVITE_FRIEND`: { action: 'invite_friend', baseXP: 200, description: 'Invited a friend' }
- `FRIEND_JOINED`: { action: 'friend_joined', baseXP: 300, description: 'Friend joined via invite' }

## Dashboard Display

The ReferralCard on the Dashboard shows:

### Stats Section
- **Friends Referred**: Total count of referred users
- **XP from Referrals**: Total XP earned (count × 500)
- **XP per Referral**: Fixed at 500 XP

### How It Works Section
- Clear explanation of XP rewards
- Visual badges showing XP amounts
- Friend bonus callout (100 XP for new users)

### Referral Code & Link
- Text inputs displaying code and full link
- Copy buttons with success feedback
- Fallback copy method for browsers that block Clipboard API

### Share Buttons
- Copy Link button (primary action)
- Share on X button with pre-filled tweet

### Referred Friends List
- Shows all friends who joined via your code
- Displays username, avatar, join date
- Shows XP earned badge (+500 XP)
- Empty state when no referrals yet

## Clipboard API Error Handling

The system includes robust clipboard functionality with multiple fallback methods:

1. **Primary**: Modern Clipboard API (`navigator.clipboard.writeText`)
2. **Fallback**: Legacy execCommand method using hidden textarea
3. **Final Fallback**: Error toast instructing manual copy

This ensures copy functionality works across all browsers and security contexts.

## User Experience Flow

### Successful Referral Flow
1. 👤 User A shares referral link with User B
2. 🔗 User B clicks link, lands on platform with `?ref=CODE`
3. 📢 User B sees notification about referral bonus
4. 🔐 User B connects wallet/social login
5. 🎉 User B receives "Referral bonus applied! +100 XP" toast
6. 🏆 User A receives XP for invite (200 XP) and join (300 XP)
7. 📊 Both users can track referrals on Dashboard

### Edge Cases Handled
- Code persists through onboarding flow via sessionStorage
- Works with both wallet and social login methods
- Invalid/expired codes are handled gracefully
- Duplicate referrals prevented (one bonus per user)

## Future Enhancements

Potential future additions:
- Referral leaderboards
- Tier-based referral bonuses (5 refs = bonus XP)
- Referral milestones achievements
- House-based referral competitions
- Referral analytics and tracking
- Limited-time referral XP multipliers
- Referral chains (multilevel tracking)

## Testing

To test the referral system:
1. Generate a referral code from Dashboard
2. Copy the referral link
3. Open in incognito/private window
4. Paste link with `?ref=CODE` parameter
5. Complete sign-up flow
6. Verify XP awards in both accounts

## XP Guidelines Integration

The referral system follows all XP_SYSTEM.md guidelines:
- Awards are instant and visible
- XP notifications use the XPNotification component
- Tracks via XP system hooks
- Integrates with level progression
- House multipliers apply to referral XP
- Achievements can be earned from referrals
