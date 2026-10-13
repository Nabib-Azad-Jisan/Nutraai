# NutraAI — AI-Powered Health App

A fully functional mobile-first health app powered by Claude AI.

## Features

- AI food scanning & nutrition analysis
- BMI calculator with recommendations
- Daily health score
- Calorie & macro tracker
- Water intake tracker
- Sleep tracker
- Disease risk estimation
- AI health coach (chat powered by Claude)
- Doctor marketplace

## Quick start

### 1. Get your Anthropic API key
Sign up at https://console.anthropic.com and create an API key.

### 2. Add your API key
Open `app.js` and replace the placeholder on line 14:
```js
const ANTHROPIC_API_KEY = 'YOUR_API_KEY_HERE';
```

### 3. Open the app
Open `index.html` in any modern browser — no build step needed.

```
nutraai/
├── index.html   ← app structure & screens
├── styles.css   ← all styling + dark mode
├── app.js       ← logic, AI calls, state
└── README.md
```

## Production notes

The app currently calls the Anthropic API directly from the browser.
This is fine for local development and demos, but for a real product you should:

1. Create a backend proxy (Node.js / Express / Next.js)
2. Store the API key server-side in environment variables
3. Point the `callClaude()` function in `app.js` to your proxy endpoint

Example backend proxy (Node.js + Express):
```js
app.post('/api/claude', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.json(data);
});
```

## Extending the app

To add more screens, follow this pattern in `index.html`:
```html
<div class="screen" id="screen-myscreen">
  <!-- content -->
  <nav class="nav-bar">...</nav>
</div>
```

Then call `showScreen('screen-myscreen')` from any button.

## Tech stack

- Vanilla HTML, CSS, JavaScript (no framework)
- Claude API (`claude-sonnet-4-6`) for food analysis and coaching
- Tabler Icons for the icon set
- Dark mode via CSS `prefers-color-scheme`
