# Kasir App - Point of Sale Application

A React-based point-of-sale (POS) application for managing sales transactions, designed for small restaurants or cafés.

## Project Structure

```
kasirapp/
├── public/
│   ├── assets/
│   │   └── images/          # Menu item images (foods, drinks, snacks)
│   └── index.html
├── server/
│   ├── dataStore.js         # PostgreSQL-backed data access helpers
│   ├── db.js                # Database connection pool
│   ├── schema.sql           # Database schema definition
│   └── seed.sql             # Sample data for development
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page-level components
│   ├── utils/              # Utility functions and constants
│   └── App.js
├── db.json                 # Legacy sample data (reference only)
├── package.json
└── README.md
```

## Features

- Category-based menu display
- Shopping cart functionality
- Order management
- Payment processing
- Success confirmation page

## Prerequisites

- Node.js (recommended: v16 or v18)
- npm
- PostgreSQL 13+ (local or hosted)

## Database Setup

1. Create a PostgreSQL database (e.g. `kasirapp`):
   ```bash
   createdb kasirapp
   ```

2. Apply the schema and sample seed data:
   ```bash
   psql -d kasirapp -f server/schema.sql
   psql -d kasirapp -f server/seed.sql
   ```

3. Copy `.env.example` to `.env` and adjust the connection settings:
   ```bash
   cp .env.example .env
   ```

   Alternatively, set the standard PostgreSQL env vars (`PGHOST`, `PGUSER`, etc.) or `DATABASE_URL` in your shell.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm run dev
```

This starts both the Hapi backend (port `3004`) and the React frontend (port `3000`) simultaneously.

The application will be available at:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:3004`

## API Endpoints

The Hapi + PostgreSQL backend exposes these REST API endpoints:

- **Categories**: `GET http://localhost:3004/categories`
- **Products**: `GET http://localhost:3004/products`
- **Cart Items**: `GET/POST/PUT/DELETE http://localhost:3004/keranjangs`
- **Orders**: `GET/POST http://localhost:3004/pesanans`

## Alternative Commands

```bash
# Start backend only (Hapi)
npm run server

# Start frontend only (React)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Node.js Version Compatibility

This project uses `react-scripts@3.4.3` which requires the OpenSSL legacy provider for Node.js v17+. The scripts are already configured with `NODE_OPTIONS=--openssl-legacy-provider`.

**Recommended:** Use Node.js v16 or v18 for best compatibility.

If you encounter OpenSSL errors with Node.js v22+:
```bash
# Install and use Node.js 18
nvm install 18
nvm use 18
npm install
```

## Alternative Backend Setup (Express Server)

If you prefer Express instead of Hapi, you can create an alternative server:

### Step 1: Install Express Dependencies

```bash
npm install express cors
```

### Step 2: Create server.js

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Read db.json
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Routes
app.get('/categories', (req, res) => res.json(db.categories));
app.get('/products', (req, res) => res.json(db.products));
app.get('/keranjangs', (req, res) => res.json(db.keranjangs));
app.get('/pesanans', (req, res) => res.json(db.pesanans));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 3: Run Express Server

```bash
node server.js
```

## Troubleshooting

### Common Issues

1. **Port 3004 already in use**
   ```bash
   # Kill process using port 3004
   lsof -ti:3004 | xargs kill -9
   ```

2. **CORS errors**
   - Hapi CORS is enabled in `server/index.js`
   - For Express server, ensure `cors()` middleware is included

3. **API endpoints not found**
   - Verify the PostgreSQL database is running and accessible
   - Confirm the schema has been applied (`server/schema.sql`)
   - Check that the Hapi backend is running on port 3004
   - Confirm `constants.js` has correct API_URL

## Development Workflow

The easiest way to develop is to run `npm run dev` which starts both the backend and frontend together. The app will automatically reload when you make changes to the code.
