# Kasir App - Point of Sale Application

A React-based point-of-sale (POS) application for managing sales transactions, designed for small restaurants or cafés.

## Project Structure

```
kasirapp/
├── public/
│   ├── assets/
│   │   └── images/          # Menu item images (foods, drinks, snacks)
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page-level components
│   ├── utils/              # Utility functions and constants
│   └── App.js
├── db.json                 # Backend data (JSON Server)
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
- npm or yarn

## Backend Setup (JSON Server)

This project uses JSON Server to create a REST API from a JSON file.

### Step 1: Install JSON Server

```bash
# Install json-server globally
npm install -g json-server

# Or install as dev dependency
npm install --save-dev json-server
```

### Step 2: Move db.json to Root Directory

Ensure your `db.json` file is in the project root directory:

```bash
mv src/db.json ./db.json
```

### Step 3: Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "server": "json-server --watch db.json --port 3004",
    "dev": "concurrently \"npm run server\" \"npm start\""
  },
  "devDependencies": {
    "json-server": "^0.17.4",
    "concurrently": "^8.2.2"
  }
}
```

### Step 4: Install Concurrently (Optional)

To run both frontend and backend simultaneously:

```bash
npm install --save-dev concurrently
```

### Step 5: Start the Backend Server

Choose one of these options:

```bash
# Option 1: Start JSON server only
npm run server

# Option 2: Start both backend and frontend
npm run dev

# Option 3: Manual start
json-server --watch db.json --port 3004
```

### Step 6: API Endpoints

Your API will be available at `http://localhost:3004/` with these endpoints:

- **Categories**: `GET http://localhost:3004/categories`
- **Products**: `GET http://localhost:3004/products`
- **Cart Items**: `GET/POST http://localhost:3004/keranjangs`
- **Orders**: `GET/POST http://localhost:3004/pesanans`

### Step 7: Test API Endpoints

```bash
# Get all products
curl http://localhost:3004/products

# Get products by category
curl http://localhost:3004/products?category.id=1

# Get all categories
curl http://localhost:3004/categories
```

## Frontend Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Node.js Version Compatibility

If you encounter OpenSSL errors with Node.js v22+, use one of these solutions:

**Option A: Use Legacy OpenSSL Provider**
```bash
export NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

**Option B: Use Node.js v18 (Recommended)**
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Step 3: Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Alternative Backend Setup (Express Server)

For a more robust backend solution, create an Express server:

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
   - JSON Server enables CORS by default
   - For Express server, ensure `cors()` middleware is included

3. **API endpoints not found**
   - Verify `db.json` is in the root directory
   - Check that JSON Server is running on port 3004
   - Confirm `constants.js` has correct API_URL

### Development Workflow

1. Start JSON Server: `npm run server`
2. Start React app: `npm start`
3. Or run both: `npm run dev`