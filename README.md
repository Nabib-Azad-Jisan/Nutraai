<div align="center">

# NutraAI

**An AI-powered nutrition and health companion built on the Claude API**

![Status](https://img.shields.io/badge/status-prototype-orange)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Claude API](https://img.shields.io/badge/AI-Claude%20API-D97757)

[Overview](#overview) · [Features](#features) · [Getting Started](#getting-started) · [Architecture](#architecture) · [Roadmap](#roadmap)

</div>

---

## Overview

NutraAI is a mobile-first web application that helps users understand and improve their daily health habits. It combines standard health calculations (BMI, BMR, daily energy expenditure) with large language model capabilities to provide natural-language meal analysis and personalized coaching.

The application is built with vanilla HTML, CSS and JavaScript, requires no build tooling, and runs directly in the browser.

> **Project status:** This repository is an early-stage prototype intended for demonstration and learning. Several modules use sample data and application state is not yet persisted. See the [Roadmap](#roadmap) for planned work.

---

## Features

### AI-powered
- **Meal analysis.** Users describe a meal in plain language. The Claude API returns a structured nutritional estimate covering calories, macronutrients, fiber, sugar, sodium and key vitamins, along with a health rating and a recommendation tailored to the user's goal.
- **Health coach.** A conversational assistant that is given the user's profile and daily activity as context, so its guidance is personal rather than generic.

### Health tracking
- **Personalized calorie target.** Basal metabolic rate is calculated with the Mifflin-St Jeor equation, then adjusted for activity level and goal (loss, maintenance or gain).
- **Calorie and macronutrient tracking** with progress toward the daily goal.
- **BMI calculator** with WHO-based categories and recommendations.
- **Hydration tracking** against a daily target.
- **Sleep tracking** based on bedtime and wake time.
- **Composite health score** (0–100) derived from nutrition, hydration, sleep and meal consistency.
- **Risk indicators** for common lifestyle-related conditions. These are informational only.

### Care access
- **Practitioner directory** with filtering by specialty. Booking is currently a demonstration flow.

### Interface
- Mobile-first, responsive layout
- Automatic light and dark themes based on system preference

---

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox or Safari)
- An Anthropic API key from the [Anthropic Console](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/Nabib-Azad-Jisan/Nutraai.git
cd Nutraai
```

### Configuration

Open `app.js` and set your API key:

```js
const ANTHROPIC_API_KEY = 'YOUR_API_KEY_HERE';
```

### Running the app

Open `index.html` in your browser. No dependencies or build step are required.

---

## Architecture

```
Nutraai/
├── index.html    Application shell and screen markup
├── styles.css    Design tokens, components and theming
├── app.js        State management, business logic and API integration
└── README.md
```

| Layer | Responsibility |
|---|---|
| **UI** | Single-page app with screen-based navigation, written in semantic HTML |
| **State** | One in-memory state object holding the profile, meals, nutrients and hydration |
| **Logic** | Health calculations (BMI, BMR, TDEE, health score) and rendering |
| **AI integration** | `callClaude()` wraps the Anthropic Messages API for meal analysis and coaching |

---

## Security

This prototype calls the Anthropic API directly from the browser, which exposes the API key to anyone using the app. **It is suitable for local development only.**

For any deployment:

1. Route all requests through a server-side proxy (for example Node.js with Express, or a serverless function).
2. Store the API key in server-side environment variables.
3. Point `callClaude()` at the proxy endpoint instead of the Anthropic API.
4. Never commit API keys to version control.

---

## Roadmap

- [ ] Persist user data with `localStorage`, then move to a backend database
- [ ] Image-based meal recognition using Claude's vision capabilities
- [ ] Secure backend proxy for API requests
- [ ] User authentication and accounts
- [ ] Dynamic streak and sleep-quality tracking
- [ ] Conversation memory for the health coach
- [ ] Practitioner booking and scheduling integration
- [ ] Historical trends and analytics dashboard

---

## Contributing

Contributions, issues and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## Disclaimer

NutraAI is intended for educational and informational purposes only. Nutritional values are AI-generated estimates and may be inaccurate. Risk indicators are simplified heuristics, not clinical assessments. This application does not provide medical advice, diagnosis or treatment. Always consult a qualified healthcare professional regarding any health concerns.

---

## Author

**Nabib Azad Jisan**
GitHub: [@Nabib-Azad-Jisan](https://github.com/Nabib-Azad-Jisan)
