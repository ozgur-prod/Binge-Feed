# Frontend

BingeFeed frontend — a React (Vite) single-page app for the BingeFeed TV-series social platform.

## Tech stack
- **React 19** + **Vite** — UI library and dev/build tooling (with HMR)
- Plain **CSS** for styling
- **ESLint** for linting

## Project structure
```
Frontend/
├── src/
│   ├── main.jsx          # app entry, mounts <App>
│   ├── App.jsx           # renders the current page
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   └── LandingPage.css
│   ├── index.css         # global theme (dark, Poppins)
│   └── assets/
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
   Runs on http://localhost:5173.

## Build
```bash
npm run build      # production build into dist/
npm run preview    # preview the production build locally
```
