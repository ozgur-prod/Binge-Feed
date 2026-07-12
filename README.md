# Frontend

BingeFeed frontend - a React (Vite) single-page app for the BingeFeed TV-series social platform.

## Tech stack
- **React 19** + **Vite** - UI library and dev/build tooling (with HMR)
- **react-router-dom** - client-side routing
- **lucide-react** - icon set
- Plain **CSS** for styling
- **ESLint** for linting

## Project structure
```
Frontend/
├── src/
│   ├── main.jsx          # app entry, mounts <App> inside the router
│   ├── App.jsx           # routes (each guarded by auth)
│   ├── pages/            # one component per screen (Landing, Login, Feed, Profile, ...)
│   ├── components/       # shared UI (Header, modals, icons, ...)
│   ├── hooks/            # reusable hooks (useProfile, useToast)
│   ├── services/
│   │   └── api.js        # backend API client
│   ├── index.css         # global theme (dark, Poppins)
│   └── assets/
├── Dockerfile
├── index.html
└── package.json
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server (auto-reloads on save):
   ```bash
   npm run dev
   ```
   Runs on http://localhost:5173. It expects the backend running on http://localhost:8080.

## Build
```bash
npm run build      # production build into dist/
npm run preview    # preview the production build locally
```

## Docker
A `Dockerfile` is included. The frontend container runs on port 3000. The full stack
(backend and frontend) is built and started together via the `docker-compose.yml` in the
**Backend** repository. See that repo's README for the one-command setup.
