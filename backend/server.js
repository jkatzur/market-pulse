import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import marketRoutes from './routes/market.js';
import newsRoutes from './routes/news.js';
import analysisRoutes from './routes/analysis.js';
import testRoutes from './routes/test.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Validate environment variables on startup
const requiredEnvVars = {
  'GNEWS_API_KEY': process.env.GNEWS_API_KEY,
  'CLAUDE_API_KEY': process.env.CLAUDE_API_KEY,
  'PORT': process.env.PORT || 5000
};

console.log('\nEnvironment Variables Check:');
console.log('---------------------------');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '✓ Loaded' : '✗ Missing'}`);
  if (key === 'GNEWS_API_KEY' && value) {
    console.log(`GNEWS_API_KEY value: ${value}`);
  }
});
console.log('---------------------------\n');

// Ensure required environment variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'  // Allow frontend in development
    : process.env.PRODUCTION_URL || '*'
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes first
app.use('/api/market', marketRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/analysis', analysisRoutes);

// Then serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Finally, handle React routing - send all other requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
    app.listen(PORT + 1);
  } else {
    console.error('Server error:', err);
  }
}); 