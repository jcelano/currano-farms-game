# Currano Farms

A pixel-art farming game built with Phaser 3 and SvelteKit. Raise chickens, collect eggs, and sell goods at the farmers market.

## Tech Stack

- **Game Engine:** Phaser 3
- **Frontend:** SvelteKit (static adapter) + Svelte 5
- **Server:** Express (serves static build)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 22+

### Install & Run

```bash
# Install dependencies
npm install
cd svelte-app && npm install && cd ..

# Run in development mode (server + frontend)
npm run dev
```

The dev server starts at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm start
```

The production server runs on port 3001.

## Project Structure

```
├── server/           # Express server (serves static build)
├── svelte-app/       # SvelteKit frontend
│   └── src/
│       ├── lib/
│       │   ├── game/     # Phaser game scenes, systems, entities
│       │   └── stores/   # Svelte stores for UI state
│       └── routes/       # SvelteKit pages (/, /title, /play)
├── shared/           # Shared types/config
└── render.yaml       # Render deploy config
```

## Deployment

Deployed on [Render](https://render.com) via `render.yaml`. Connects to a GitHub repo and auto-deploys on push to `main`.

## Save Data

Game state is saved locally in the browser's IndexedDB (up to 3 save slots). There is no backend database or cloud sync.
