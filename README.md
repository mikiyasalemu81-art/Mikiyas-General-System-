# System for Mikiyas

A single-user, installable Progressive Web App (PWA) designed specifically for Mikiyas. Built for ADHD productivity, high visual clarity, distraction limits, task reminders, financial tracking, and client intake prompt generation for Imako Solution.

---

## 🎯 Key Features

### 1. ⏱️ Time Management & App Blocking
- **Auto-detected apps**: Pre-configured with common distractions (Instagram, TikTok, YouTube Shorts, Facebook, Chess.com, Casual Games).
- **Synchronized 3-Way Input**: Presets (30 min, 1 hr, 2 hr) + live slider (5m–240m) + custom numeric input that stay in sync.
- **Visual Progress & Limits**: High-contrast meters shift from Sky Blue (safe) to Amber (near limit ≥80%) to Rose Red (blocked ≥100%).
- **Distraction Barriers & Attempt Tracking**: When an app exceeds its daily limit, launches are blocked and an attempt counter increments.
- **Small Notification Banner**: Non-intrusive banner notifies you without full-screen jarring alerts.
- **PWA Architecture Transparency**: Explicitly distinguishes between browser sandbox barriers and OS-level device limits.

### 2. ✅ ADHD Task Reminders & Dual Views
- **Daily & Weekly Tasks**: Scheduled with recurrence types and exact reminder times (e.g., `09:00`, `14:30`).
- **Dual View Modes**: Switch seamlessly between **List View** (with filter chips) and **Calendar View** (interactive month grid with color-coded task dots).
- **Browser Notifications & Web Audio Chimes**: HTML5 Notification API integration with gentle dual-tone focus chimes (Web Audio API).
- **Automated Midnight/Weekly Reset**: Automatically clears daily completed tasks at midnight and weekly tasks at the start of each week. Manual reset button also provided.

### 3. 💰 Finance Tracking & AI Advisor
- **Strict Categories**: Focuses strictly on `Transport` and `Clients` (Income and Expense).
- **Visual-First Charts**:
  - Income vs. Expenses timeline bar chart (Recharts).
  - Expense Category breakdown (Transport vs. Clients distribution) with numbers always visible.
- **Finance Advisor Panel**:
  - **Mode (a) - Daily Tip Card**: Dynamically calculates advice based on live figures phrased as *"If you cut X, you save Y."*
  - **Mode (b) - On-Demand Advisor**: Interactive Q&A engine with quick suggestion pills (e.g., *"How can I cut transport?"*).
  - **AI Model Hook**: Pre-wired hook (`hookAiFinancialAdvisor`) ready for OpenAI, Claude, or Gemini API keys.

### 4. ⚡ Imako Solution Project Intake & Antigravity Prompt Generator
- **Client Intake Form**: Client name, project type, brief description, reference links, budget, and deadline.
- **22 Clarifying Questions**: Covers Scope, Target Audience, Branding, Features, Pages, Integrations, Payments, Localization, Hosting, and Timelines.
- **One-Tap Suggestion Chips & Fast Preset Fill**: Designed for ADHD users to answer 22 questions in under 60 seconds.
- **Antigravity Prompt Export**: Synthesizes inputs into an expert-level specification prompt in a modal popup with a 1-click **Copy to Clipboard** button.
- **Local Project Storage**: Saved projects can be reopened, edited, or re-exported at any time.

### 5. 🎨 Theme & ADHD-Friendly UX
- **Manual Light/Dark Mode**: High-contrast light mode (white & light blue primary with light red secondary) and dark mode (slate-950).
- **Ultra-Smooth 280ms Transitions**: Backgrounds, borders, text, and components smoothly morph together.
- **Zero Login Friction**: Runs 100% locally with `localStorage`. No cloud tracking, accounts, or telemetry.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### Installation
```bash
# Clone the repository and enter the directory
cd joyful-hubble

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the Vite development server
npm run dev
```
Open your browser at `http://localhost:3000`.

### Production Build & Typecheck
```bash
# Typecheck with TypeScript and build minified production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📱 PWA Installation Instructions

1. **Chrome / Edge (Desktop)**:
   - Click the **Install** icon on the right side of the URL bar or open the three-dot menu and select **"Install System for Mikiyas"**.
2. **iOS Safari (iPhone / iPad)**:
   - Tap the **Share** button (box with upward arrow) at the bottom.
   - Scroll down and tap **"Add to Home Screen"**.
3. **Android Chrome**:
   - Tap the three-dot menu in Chrome and select **"Install app"** or **"Add to Home screen"**.

---

## 🛠️ Architecture & Project Structure

```
├── public/
│   ├── favicon.svg          # Stylized 'M' icon with focus ring
│   ├── manifest.webmanifest # PWA configuration
│   └── sw.js                # Offline service worker cache
├── src/
│   ├── types/               # TypeScript interfaces
│   ├── services/
│   │   ├── storage.ts       # Storage abstraction (swappable for backend)
│   │   ├── notifications.ts # HTML5 Notification API + Web Audio chimes
│   │   ├── advisor.ts       # Financial rule-based advisor + AI hook
│   │   └── intakeGenerator.ts # 22 questions & Antigravity prompt generator
│   ├── context/
│   │   ├── ThemeContext.tsx # Light/dark manual toggle & transition
│   │   └── AppContext.tsx   # Global reactive state & scheduled resets
│   ├── components/
│   │   ├── common/          # Header, BottomNav, MetricCard, SmallBanner, ProfileModal
│   │   ├── time/            # Time management, AppBlockCard, synchronized inputs
│   │   ├── tasks/           # Tasks list, Calendar view, AddTaskModal
│   │   ├── finance/         # Charts, AdvisorPanel, TransactionList, AddTransactionModal
│   │   └── intake/          # Project intake form, Questions step, Prompt modal
│   ├── data/
│   │   └── seedData.ts      # Initial rich data for first run
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## ☁️ Deployment

### Deploying to Vercel
```bash
npm install -g vercel
vercel
```

### Deploying to Cloudflare Pages or Netlify
Simply connect your repository and configure:
- **Build command**: `npm run build`
- **Output directory**: `dist`

---

*Crafted for Mikiyas & Imako Solution.*
