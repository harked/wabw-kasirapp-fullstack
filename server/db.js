/**
 * Database Connection
 * Manages PostgreSQL connection pool using the pg library
 *  - Loads environment variables from .env file
 *  - Supports multiple connection methods:
 *    - Individual variables: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
 *    - Connection string: DATABASE_URL
 *    - Optional SSL configuration
 *  - Exports two functions:
 *    - query(text, params): For simple queries
 *    - getClient(): For transactions (used in order creation)
*/

const { Pool } = require('pg');
const path = require('path');

const loadEnv = () => {
  try {
    // Load environment variables from project root .env if available
    // eslint-disable-next-line global-require
    require('dotenv').config({
      path: path.join(__dirname, '..', '.env'),
    });
  } catch (error) {
    // dotenv is optional; ignore if it's not installed
  }
};
loadEnv();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl:
    process.env.PGSSL === 'true'
      ? {
          rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : undefined,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
