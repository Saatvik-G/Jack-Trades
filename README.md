# Jack&Trades — Cross-Discipline Explorer

> *"A jack of all trades is a master of none, but oftentimes better than a master of one."*

**Jack&Trades** is an AI-powered single-page web app that reveals non-obvious, mechanism-level structural connections between any user-input topic and 4 to 6 distinct disciplines (Science, Mathematics, Psychology, Philosophy, History, Art, Economics, Design, Biology, Music, Architecture, and Game Theory).

---

## 🌟 Key Features

- **Topic Exploration**: Enter any concept, technique, or skill (e.g., *Gradient Descent*, *Recursion*, *Supply & Demand*, *Photosynthesis*) to uncover deep cross-disciplinary analogies.
- **Mechanism-Level Rigor**: Avoids shallow wordplay by illuminating shared underlying structures, feedback loops, state spaces, and optimization dynamics.
- **Serious / Playful View Toggle**:
  - **Serious Mode**: Structural explanation is front and center; fun facts are subdued.
  - **Playful Mode**: Highlights screenshot-worthy, witty fun-facts with visual callouts and emojis while preserving full structural rigor.
- **Instant Regeneration**: One-click regeneration for fresh perspective sets on the same topic.
- **Deploy-Ready & Minimalist**: Built with a clean, responsive layout, generous whitespace, loading shimmers, and robust error handling.

---

## 🖼️ Preview

*(Screenshot Placeholder)*

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Saatvik-G/Jack-Trades.git
cd Jack-Trades
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Note**: Never commit `.env.local` or expose your API keys. It is automatically excluded via `.gitignore`.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start exploring.

---

## 📄 License

MIT License © 2026 Jack&Trades
