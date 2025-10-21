# GoDaddy React Node.js Server

A full-stack React + Node.js application with Express server.

## Features

- 🚀 Express.js server with CORS support
- ⚛️ React frontend with TypeScript
- 🔄 API endpoints for health checks and data
- 📱 Responsive design with modern UI
- 🛠️ Development and production builds

## Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
npm install

# Install React app dependencies
npm run install:client
```

### 2. Development Mode

```bash
# Run both server and React app in development mode
npm run dev:full

# Or run them separately:
# Terminal 1: Start the server
npm run dev

# Terminal 2: Start the React app
npm run dev:client
```

### 3. Production Build

```bash
# Build the React app for production
npm run build

# Start the production server
npm start
```

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/hello` - Server information and status

## Project Structure

```
godaddy_server/
├── server.js              # Express server
├── package.json           # Server dependencies
├── client/                # React application
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.tsx      # React entry point
│   └── package.json       # React dependencies
└── README.md              # This file
```

## Development

The server runs on port 3001 by default. The React app will be served from the same port in production, or on port 3000 in development mode.

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build React app for production
- `npm run dev:client` - Start React development server
- `npm run dev:full` - Run both server and client in development mode
