const { Pool } = require('pg');
require('dotenv').config();

// Automatically detect if we are connecting to a cloud database (Render, OCI, Heroku) or a local machine
const isCloudDatabase = process.env.NODE_ENV === 'production' || 
                        process.env.DATABASE_URL?.includes('render') || 
                        process.env.DATABASE_URL?.includes('oregon-postgres');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use SSL for cloud deployments, disable SSL for local PostgreSQL
  ssl: isCloudDatabase ? { rejectUnauthorized: false } : false
});

module.exports = pool;