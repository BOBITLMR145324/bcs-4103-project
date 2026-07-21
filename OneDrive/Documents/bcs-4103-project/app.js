const express = require('express');
const cors = require('cors');
const pool = require('./db');

// Auto-create 'products' table if it doesn't exist
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        attributes JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database table "products" initialized successfully.');
  } catch (err) {
    console.error('Error initializing database table:', err.message);
  }
};

initDB();

const app = express();

app.use(cors());
app.use(express.json()); // Allows your server to read incoming JSON data

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Standard express setup...
const app = express();
app.use(express.json());

// --- SWAGGER UI CONFIGURATION ---
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce Products API',
      version: '1.0.0',
      description: 'RESTful API for managing e-commerce products with PostgreSQL.',
    },
    servers: [
      {
        url: 'https://bcs-4103-ecom-api.onrender.com',
        description: 'Render Production Server',
      },
      {
        url: 'http://localhost:10000',
        description: 'Local Server',
      },
    ],
  },
  apis: ['./app.js'], // Look for annotations in this file
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - sku
 *         - name
 *         - price
 *       properties:
 *         product_id:
 *           type: string
 *           format: uuid
 *         sku:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         stock_quantity:
 *           type: integer
 *         attributes:
 *           type: object
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve all products
 *     responses:
 *       200:
 *         description: List of all products in database
 *   post:
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product data retrieved successfully
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update an existing product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 */

// 0. HEALTH CHECK ROUTE
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is live and running!' });
});

// 1. GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('DATABASE ERROR [GET /api/products]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET PRODUCT BY ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`DATABASE ERROR [GET /api/products/${req.params.id}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. ADD NEW PRODUCT (Handles JSONB attributes)
app.post('/api/products', async (req, res) => {
  try {
    const { sku, name, price, stock_quantity, attributes } = req.body;
    
    const attrValue = typeof attributes === 'object' ? JSON.stringify(attributes) : (attributes || '{}');

    const result = await pool.query(
      'INSERT INTO products (sku, name, price, stock_quantity, attributes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sku, name, price, stock_quantity, attrValue]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('DATABASE ERROR [POST /api/products]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE EXISTING PRODUCT
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, price, stock_quantity, attributes } = req.body;
    
    const attrValue = typeof attributes === 'object' ? JSON.stringify(attributes) : (attributes || '{}');

    const result = await pool.query(
      'UPDATE products SET sku = $1, name = $2, price = $3, stock_quantity = $4, attributes = $5 WHERE product_id = $6 RETURNING *',
      [sku, name, price, stock_quantity, attrValue, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(`DATABASE ERROR [PUT /api/products/${req.params.id}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE A PRODUCT
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product successfully deleted' });
  } catch (err) {
    console.error(`DATABASE ERROR [DELETE /api/products/${req.params.id}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));