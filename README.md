# Market Pulse

A real-time market analysis dashboard that shows why stocks are moving today, powered by financial data and AI analysis. View live at https://whyarestocksuptoday.com (don't worry I also have whyarestocksdowntoday.com)

## Prerequisites

- Node.js >= 18.0.0
- npm

## Environment Setup

1. Create backend environment file:
```bash
# backend/.env.development
PORT=5000
NODE_ENV=development
GNEWS_API_KEY=your_gnews_api_key
CLAUDE_API_KEY=your_claude_api_key
```

2. Create frontend environment file:
```bash
# frontend/.env.development
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Local Development

1. Install all dependencies:
```bash
npm run install-all
```

2. Start development servers:
```bash
npm run dev
```

This will start:
- Frontend development server on http://localhost:3000
- Backend API server on http://localhost:5000

## Production Deployment

1. Set up production environment files:

```bash
# frontend/.env.production
REACT_APP_API_BASE_URL=/api

# backend/.env.production
PORT=8081
NODE_ENV=production
GNEWS_API_KEY=your_gnews_api_key
CLAUDE_API_KEY=your_claude_api_key
```

2. Build and start production server:
```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

The app will be available at http://localhost:8081 (or configured port)

## Project Structure

```
market-pulse/
├── frontend/           # React frontend
│   ├── src/           # Source files
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js backend
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── package.json   # Backend dependencies
└── package.json       # Root package.json for dev scripts
```

## Available Scripts

- `npm run install-all` - Install all dependencies
- `npm run dev` - Start development servers
- `npm run build` - Build frontend for production
- `npm start` - Run production server
- `npm run update-railway` - Sync environment variables to Railway config
