import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: NODE_ENV, timestamp: new Date().toISOString() });
});

// In production, serve the built SvelteKit static files
if (NODE_ENV === 'production') {
  const serveDir = process.env.SERVE_DIR || path.join(__dirname, '..', 'svelte-app', 'build');
  app.use(express.static(serveDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(serveDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🌾  Currano Farms Server`);
  console.log(`────────────────────────────`);
  console.log(`   Server:  http://localhost:${PORT}`);
  console.log(`   Mode:    ${NODE_ENV}`);
  console.log(`────────────────────────────\n`);
});
