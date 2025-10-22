# House Switching Rules - Season 1: The Summons

## Quick Reference

### Season Timeline
- **Season Start**: Platform Launch
- **Switching Window**: Launch - November 19, 2025
- **Switching Lockout**: November 20, 2025
- **Season End**: November 30, 2025 at 11:59 PM

### Can I Join/Switch Houses?

| Your Status | Before Nov 20 | Nov 20-30 | After Nov 30 |
|-------------|---------------|-----------|--------------|
| No house | ✅ Can join any house | ✅ Can join (no switching) | ❌ Season ended |
| In a house (0-2 switches used) | ✅ Can switch (max 3 total) | 🔒 Locked - cannot switch | ❌ Season ended |
| In a house (3 switches used) | 🔒 No switches left | 🔒 Locked - cannot switch | ❌ Season ended |

## Detailed Rules

### Phase 1: Switching Window (Launch - November 19)
**For users NOT in a house:**
- ✅ Can join any house anytime
- ✅ Receive +100 XP joining bonus
- ✅ Get +1.1x XP multiplier immediately
- ✅ No penalty for first join

**For users IN a house:**
- ✅ Can switch to a different house up to **3 times total**
- ✅ XP multiplier continues uninterrupted (+1.1x)
- ✅ All earned XP stays with you
- 📊 Old house loses your XP contribution
- 📊 New house gains your XP contribution
- ⚠️ Each switch counts toward your 3-switch limit
- ⚠️ Switch counter is displayed on Houses page
- ❌ Error if 3 switches already used: "No Switches Remaining"

**Switch Tracking:**
- Switch 1: Available to all users
- Switch 2: Available if switch 1 used
- Switch 3: Available if switch 2 used (final switch!)
- After 3 switches: Locked until November 20th

### Phase 2: Lockout Period (November 20-30)
**For users NOT in a house:**
- ✅ Can join a house for the first time
- ❌ Cannot switch if they join

**For users IN a house:**
- 🔒 All switching completely locked
- ❌ Cannot switch regardless of previous switches used
- ✅ Can still leave house (but cannot rejoin until Season 2)
- 💎 Season rewards depend on house you're in on Nov 30
- ⚠️ Error message: "House switching locked on November 20th"

### Phase 3: Season End (After November 30)
- 🏁 All house memberships locked
- 🏁 Rankings finalized
- 💰 Rewards calculated and distributed based on final house
- 🎉 Season 2 begins with reset switching limits

## User Flows

### Flow 1: First Time Joining
```
User clicks "Join House" 
  ↓
Join Dialog appears
  ↓ (Confirms)
User added to house
  ↓
+100 XP awarded
  ↓
+1.1x multiplier activated
  ↓
Success toast shown
```

### Flow 2: Switching Houses (Before Nov 20, Switches Available)
```
User clicks "Switch House"
  ↓
System checks date and switches
  ↓ (Before Nov 20, switches < 3)
Switch Dialog appears
Shows: "This will be switch X of 3"
Shows: "You'll have Y switches left"
  ↓ (Confirms)
User removed from old house
  ↓
User added to new house
  ↓
Switches counter incremented
  ↓
XP multiplier maintained
  ↓
Success toast shown
"Switches remaining: Y"
```

### Flow 3: Trying to Switch (No Switches Left)
```
User clicks "Switch House"
  ↓
System checks switches used
  ↓ (3 switches already used)
Error toast shown
  ↓
"No Switches Remaining"
"You've used all 3 house switches"
```

### Flow 4: Trying to Switch (After Nov 20 - Locked)
```
User clicks "Switch House"
  ↓
System checks date
  ↓ (After Nov 20)
Error toast shown
  ↓
"House Switching Locked"
"House switching closed on November 20th"
```

## Dialog Examples

### Join House Dialog (First Time)
**Title:** Join [House Name]?

**Content:**
- You're about to join [House Name]
- Benefits listed:
  - +1.1x XP multiplier on all activities
  - Access to house-exclusive quests
  - Season end XP bonus based on house ranking
  - Collaborative prediction pools

**Warning:**
⚠️ You can only be in one house at a time. Leaving a house will remove your bonuses.

**Actions:**
- Cancel
- Join House

### Switch House Dialog (Before Nov 20, Switches Available)
**Title:** Switch Houses?

**Content:**
- You're leaving [Old House] and joining [New House]
- **Switches Remaining Alert:**
  - This will be switch [X] of 3
  - You'll have [Y] switches left until November 20th, when all switching locks permanently
- What happens:
  - Your +1.1x XP multiplier continues uninterrupted
  - All XP earned stays with you
  - Your old house loses your contribution to their total
  - Your new house gains your contribution
  - Season end rewards depend on your house at season end (Nov 30)

**Warning:**
⚠️ You can switch up to 3 times before November 20th. After that, all houses lock until Season 1 ends on November 30th.

**Actions:**
- Cancel
- Switch to [New House]

### Error Toast (No Switches Remaining)
**Title:** No Switches Remaining

**Description:** You've used all 3 house switches. You'll remain in your current house until Season 1 ends.

### Error Toast (After Nov 20 - Locked)
**Title:** House Switching Locked

**Description:** House switching closed on November 20th. You'll remain in your current house until Season 1 ends on November 30th.

## UI Indicators

### On Houses Page

**Before November 20:**
```
🔒 House switching locked. You can switch houses starting November 20th 
   (10 days before season end)
```

**During November 20-30:**
```
✓ House switching is now available! You have [X] days left to make 
  your final choice.
```

### Button Labels
- **When not in a house:** "Join House"
- **When in a house (before Nov 20):** "Switch House" (shows error on click)
- **When in a house (Nov 20-30):** "Switch House" (opens switch dialog)

## Season End Reward Calculation

### Example Scenario
**User Stats:**
- Joined: House A on launch day
- Season 1 XP Earned: 15,000 XP
- Switched: To House B on November 25th
- House B Final Ranking: 1st Place

**Reward Calculation:**
```
Base XP earned in Season 1: 15,000 XP
House B ranking: 1st Place = 3x multiplier
Bonus XP = 15,000 × 3 = 45,000 XP

Total new XP: 15,000 (existing) + 45,000 (bonus) = 60,000 XP
```

**Note:** It doesn't matter that the user started in House A. Rewards are based solely on which house you're in on November 30th.

## Strategic Implications

### Early Season Strategy
- Join a house early to maximize +1.1x multiplier time
- Choose based on community, not just current ranking
- Rankings will change significantly throughout season

### Mid Season Strategy
- Monitor house rankings regularly
- Engage actively to boost your house's position
- Build relationships with house members

### Late Season Strategy (Nov 20-30)
- **Option 1: Stay Loyal** - Remain with your house regardless of ranking
- **Option 2: Strategic Switch** - Move to a winning house for better rewards
- **Risk vs Reward**: Switching guarantees rewards if target house wins, but rankings can still change

### Ethical Considerations
- Loyalty to your house throughout the season
- vs.
- Maximizing personal rewards by switching to winner

The game design allows both approaches!

## Technical Implementation

### Date Check Logic
```typescript
const seasonEndDate = new Date('2025-11-30T23:59:59');
const currentDate = new Date();
const daysUntilSeasonEnd = Math.ceil(
  (seasonEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
);
const canSwitchHouses = daysUntilSeasonEnd <= 10;
```

### Switch Validation
```typescript
if (currentUserHouse) {
  if (canSwitchHouses) {
    // Show switch dialog
    setSwitchDialogOpen(true);
  } else {
    // Show error toast
    toast.error("Cannot Switch Houses", {
      description: `You can only switch houses within 10 days...`
    });
  }
}
```

## FAQ

**Q: How many times can I switch houses?**
A: You can switch houses up to **3 times total** before November 20th. After November 20th, all switching is locked until Season 1 ends.

**Q: What if I leave my house, does that count as a switch?**
A: Leaving and then joining a different house counts as one switch. We recommend using the "Switch House" button instead of manually leaving.

**Q: Do I lose any XP when switching?**
A: No! All XP you've earned stays with you permanently. Only the house's total XP changes (old house loses your contribution, new house gains it).

**Q: What if the rankings change after I use all my switches?**
A: That's the strategic element! You need to decide when to use your 3 switches. Save them for later when rankings stabilize, or use them early to find the right house fit.

**Q: Can I switch on November 19th (last day before lockout)?**
A: Yes, as long as you have switches remaining. But be careful - after November 20th, you're locked in!

**Q: What happens if I'm not in a house on November 30th?**
A: You receive no season end bonus rewards. You must be in a house at season end to qualify for rewards.

**Q: Does my subscription tier affect which house I can join?**
A: No, all houses are available to all users regardless of subscription tier. However, premium subscriptions help you earn more XP, which helps your house ranking!

**Q: What if I join a house for the first time after November 20th?**
A: You can still join a house for the first time between Nov 20-30, but you cannot switch to a different house. Choose wisely!

**Q: Do my switches reset for Season 2?**
A: Yes! When Season 2 begins, everyone gets a fresh 3 switches to use for that season.
