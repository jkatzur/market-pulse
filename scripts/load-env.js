import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../backend/.env.production');
const railwayPath = path.join(__dirname, '../railway.json');

// Read .env.production file
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse env file
const envVars = envContent
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, value] = line.split('=').map(str => str.trim());
    acc[key] = value;
    return acc;
  }, {});

// Read existing railway.json
const railwayConfig = JSON.parse(fs.readFileSync(railwayPath, 'utf8'));

// Update variables
railwayConfig.variables = {
  ...railwayConfig.variables,
  GNEWS_API_KEY: envVars.GNEWS_API_KEY,
  CLAUDE_API_KEY: envVars.CLAUDE_API_KEY
};

// Write back to railway.json
fs.writeFileSync(railwayPath, JSON.stringify(railwayConfig, null, 2)); 