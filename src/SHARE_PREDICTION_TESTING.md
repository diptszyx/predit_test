# Share Prediction Feature - Testing Guide

## How to Test the Share Button

### Questions that WILL trigger prediction detection:

✅ **Time-based questions:**
- "What will the price of Bitcoin be tomorrow?"
- "What price will Bitcoin reach next week?"
- "Where will crypto be in 2025?"
- "What happens next month?"

✅ **Direct prediction keywords:**
- "Will Bitcoin go up?"
- "Do you predict rain tomorrow?"
- "What's your forecast for Tesla?"
- "Can you predict the election outcome?"

✅ **Probability/chance questions:**
- "What are the odds of winning?"
- "What's the probability it will happen?"
- "What's the likelihood of success?"

✅ **Future-oriented questions:**
- "What will happen to AI?"
- "How high will prices go?"
- "What do you think will occur?"

### Questions that will NOT trigger (regular chat):

❌ "What is Bitcoin?" (present tense)
❌ "Tell me about crypto" (general info)
❌ "How does it work?" (explanation request)
❌ "What happened yesterday?" (past tense)

## Visual Feedback

1. **Before prediction**: Share button is faded/gray
2. **After prediction question**: 
   - Button flashes with purple pulse for 3 seconds
   - Button gets purple background and icon
   - Check browser console for "Prediction detected!" message

3. **Clicking share button**:
   - If prediction exists: Opens share dialog
   - If no prediction: Shows toast "Ask a prediction question first!"

## Debug Console Logs

Open browser console (F12) to see:
```
Message: [your question]
Is Prediction: true/false
Prediction detected! Storing and flashing share button
```

## Test Sequence

1. Ask: "What will the price of Bitcoin be tomorrow?"
2. Watch console - should see "Is Prediction: true"
3. Wait for oracle response
4. Watch share button flash purple for 3 seconds
5. Click share button
6. See share dialog with social media options
7. Click "Copy Link" - should see "Link copied to clipboard!" toast
   - **Note:** If automatic copy fails (Clipboard API blocked), a text input will appear with the URL for manual copying
8. Open new tab and paste the URL (Ctrl/Cmd+V)
9. You should see a beautiful shared prediction page with:
   - Oracle avatar as blurred background
   - Question card with purple gradient
   - Answer card with green gradient
   - Oracle name and timestamp
   - CTA to join Dehouse of Oracles

## Troubleshooting Copy Link

If you see "Unable to copy automatically" message:
1. A text input will appear with the shareable URL
2. Click the input to select all
3. Press Ctrl+C (Windows/Linux) or Cmd+C (Mac) to copy
4. The input will disappear after 10 seconds or when you click outside it
