# House Switching System - Implementation Summary

## Overview
Users can switch houses up to **3 times** before November 20th, then switching locks permanently until Season 1 ends on November 30th.

## Key Rules

### ✅ BEFORE November 20th
- **Allowed:** Join a house for the first time (no limit)
- **Allowed:** Switch houses up to **3 times total**
- **Tracked:** Switch counter shows remaining switches
- **Display:** "Switches Left: X" visible on Houses page

### 🔒 AFTER November 20th  
- **Locked:** All house switching disabled
- **Allowed:** First-time joins only (cannot switch after)
- **Final:** Your house at Nov 20th = your house for season end rewards

### 🏁 November 30th - Season End
- Rankings finalized
- Rewards distributed based on house you're in
- Switch counters reset for Season 2

## User Interface

### Switches Remaining Display
Located in Season Info card on Houses page:
```
Days Remaining: 45
Total Houses: 4
Total Members: 41,580
Switches Left: 2
```

### Status Messages

**Before Nov 20, Switches Available:**
```
✓ You have 2 house switches remaining. 
  Switching locks on November 20th (15 days).
```

**Before Nov 20, No Switches Left:**
```
⚠️ You've used all 3 house switches. 
   You'll remain in Crypto Kings until Season 1 ends.
```

**After Nov 20, Locked:**
```
🔒 House switching locked on November 20th. 
   All houses finalized for Season 1 end (Nov 30).
```

## Button Behavior

### "Join House" Button (No Current House)
- **Before Nov 20:** Opens join dialog
- **After Nov 20:** Opens join dialog
- **Result:** Joins house, does NOT count as a switch

### "Switch House" Button (Has Current House)

**Before Nov 20, Switches < 3:**
- Opens switch dialog
- Shows: "This will be switch X of 3"
- Shows: "You'll have Y switches left"
- Increments switch counter on confirm

**Before Nov 20, Switches = 3:**
- Shows error toast
- "No Switches Remaining"
- "You've used all 3 house switches"

**After Nov 20:**
- Shows error toast
- "House Switching Locked"
- "House switching closed on November 20th"

## Dialog Examples

### Switch Dialog (When Switches Available)
```
Title: Switch Houses?

Content:
You're about to leave Crypto Kings and join Fortune Tellers.

[Orange Alert Box]
⚠️ Switches Remaining
This will be switch 2 of 3. You'll have 1 switch left until 
November 20th, when all switching locks permanently.

[Purple Info Box]
What happens when you switch:
• Your +1.1x XP multiplier continues uninterrupted
• All XP earned stays with you
• Your old house loses your contribution to their total
• Your new house gains your contribution
• Season end rewards depend on your house at season end (Nov 30)

[Yellow Warning]
⚠️ You can switch up to 3 times before November 20th. 
After that, all houses lock until Season 1 ends on November 30th.

Actions: [Cancel] [Switch to Fortune Tellers]
```

## Technical Implementation

### User Type Extension
```typescript
interface User {
  // ... existing fields
  houseSwitchesUsed?: number; // Tracks switches (0-3)
}
```

### Date Logic
```typescript
const switchLockDate = new Date('2025-11-20T00:00:00');
const seasonEndDate = new Date('2025-11-30T23:59:59');
const currentDate = new Date();

const isSwitchingLocked = currentDate >= switchLockDate;
const switchesUsed = user?.houseSwitchesUsed ?? 0;
const maxSwitches = 3;
const remainingSwitches = maxSwitches - switchesUsed;
```

### Switch Validation
```typescript
const canSwitch = 
  !isSwitchingLocked && // Before Nov 20
  switchesUsed < maxSwitches && // Has switches left
  currentUserHouse; // Already in a house
```

### Handler Functions

**Join House (First Time):**
```typescript
const handleJoinHouse = (houseId: string) => {
  updateUser({ house: houseId });
  awardXPToUser('JOIN_HOUSE'); // +100 XP
  // Does NOT increment houseSwitchesUsed
};
```

**Switch House:**
```typescript
const handleSwitchHouse = (houseId: string) => {
  const currentSwitches = user?.houseSwitchesUsed ?? 0;
  updateUser({ 
    house: houseId,
    houseSwitchesUsed: currentSwitches + 1 // Increment counter
  });
  awardXPToUser('JOIN_HOUSE'); // +100 XP
};
```

## Strategic Considerations

### Early Season (Launch - October)
- **Strategy:** Experiment with different houses
- **Risk:** Low - you have 3 switches to find the right fit
- **Recommendation:** Try different house communities early

### Mid Season (November 1-15)
- **Strategy:** Monitor house rankings and trends
- **Risk:** Medium - use remaining switches wisely
- **Recommendation:** Save at least 1 switch for late adjustments

### Late Season (November 16-19)
- **Strategy:** Make final positioning decision
- **Risk:** High - this is your last chance!
- **Recommendation:** Choose the house most likely to win

### Lockout Period (November 20-30)
- **Strategy:** Support your house, earn XP
- **Risk:** None - no more decisions to make
- **Recommendation:** Maximize XP earnings to boost house total

## Edge Cases

### Case 1: User joins, leaves, then rejoins different house
- **First join:** Does NOT count as switch
- **Leave:** Does NOT count as switch
- **Rejoin different house:** DOES count as switch #1

### Case 2: User uses all 3 switches before Nov 20
- **Result:** Locked into current house
- **UI:** Shows "Switches Left: 0 (Locked)"
- **Error:** "You've used all 3 house switches"

### Case 3: User has never joined a house, joins on Nov 25
- **Result:** Can join any house
- **Limitation:** Cannot switch to a different house
- **Warning:** Choose carefully - no switching allowed!

### Case 4: User switches 3 times, season ends
- **Result:** House at time of 3rd switch determines rewards
- **Season 2:** Switches reset to 0, can switch 3 more times

## Messaging Best Practices

### Success Messages
- "Welcome to [House]! Start earning house XP now."
- "House Switched! You've left [Old] and joined [New]! Switches remaining: X"

### Error Messages
- "No Switches Remaining: You've used all 3 house switches."
- "House Switching Locked: Switching closed on November 20th."

### Warning Messages
- "⚠️ This will be your final switch!"
- "✓ You have X switches remaining. Use them wisely!"

## Testing Scenarios

1. **New user joins house:** Switch counter stays at 0
2. **User switches once:** Counter increments to 1
3. **User switches three times:** Counter at 3, switching disabled
4. **Date changes to Nov 20:** All switching locked regardless of counter
5. **User with 0 switches tries to switch:** Error toast shown
6. **User tries to switch after Nov 20:** Error toast shown
7. **Season ends, Season 2 starts:** Counter resets to 0

## Future Enhancements

- **Season 2:** Consider 5 switches or different rules
- **Premium Perks:** Elite users get +1 extra switch?
- **House Officers:** Certain roles get additional switches?
- **Switch History:** Show log of when user switched houses
- **Penalties:** Reduce XP multiplier for frequent switchers?
- **Loyalty Rewards:** Bonus for users who never switch?
