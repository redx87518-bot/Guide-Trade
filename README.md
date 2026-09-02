# Guide Trade

AI-powered financial research assistant using Appwrite Functions, multiple AI providers, and a mobile-first PWA/Capacitor app.

## Architecture

### Backend (Appwrite Function: `guide-trade-api`)
- **Runtime**: Node.js 22
- **Database**: Appwrite Databases (`guide_trade` database)
- **Providers**: Quan (finance AI), Beyalan (quant analysis), Parallel (web research), Eulerpool (financial data), ElevenLabs (voice synthesis)

```
src/
  main.js              — Function entry point (routing, auth)
  appwrite/            — Appwrite SDK wrappers (database, auth, storage)
  providers/           — HTTP adapters for external AI APIs
  tools/               — Internal tool functions that call providers
  agent/               — Planner, orchestrator, prompt templates
  services/            — Business logic (research, settings, notifications, reports)
  utils/               — Logger, errors, validation
```

### Frontend (React + Vite + Capacitor)
- **Mobile-first PWA** with orb-based interaction
- **Capacitor** for native APK generation
- **Tailwind CSS** for styling

```
web/
  src/
    components/   — Orb, ResearchResult
    pages/        — Home, Research, Watchlist, History, Settings, Login
    hooks/        — useAuth, useResearch, useWatchlist
    lib/          — Appwrite client config
  capacitor.config.ts
  vite.config.ts
```

### Database Collections
1. `profiles` — User profile data
2. `watchlists` — Symbol watchlists
3. `research_sessions` — Research tracking
4. `research_results` — Research output
5. `saved_reports` — PDF report metadata
6. `user_settings` — Voice, Telegram, Discord integration settings
7. `notifications` — Notification history

## Development

```bash
# Backend
npm install
node --check src/main.js

# Frontend
cd web
npm install
npm run dev
```

## GitHub Actions
- `deploy-function.yml` — Auto-deploys function on `src/` changes
- `build-apk.yml` — Builds debug APK on every push
- `frontend-build.yml` — Builds frontend on `web/` changes

## License
Proprietary. Not financial advice.
