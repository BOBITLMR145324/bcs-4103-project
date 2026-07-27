const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- SWAGGER UI CONFIGURATION ---
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Horizon FinTech Product Catalog API',
      version: '1.0.0',
      description: 'API documentation for Horizon Financial Institutional Deposit & Retail Portfolios',
    },
    servers: [
      {
        url: 'https://bcs-4103-ecom-api.onrender.com',
        description: 'Production Server (Render)',
      },
      {
        url: 'http://localhost:10000',
        description: 'Local Server',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- AUTO-CREATE DATABASE TABLE ---
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

// --- API ENDPOINT ANNOTATIONS & HANDLERS ---

/**
 * @openapi
 * /api/products/stats:
 *   get:
 *     summary: Retrieve total records, average balance, and total portfolio value
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Live database statistics retrieved successfully
 */
app.get('/api/products/stats', async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) AS total_records,
        COALESCE(AVG(price), 0) AS avg_balance,
        COALESCE(SUM(price), 0) AS total_portfolio_value
      FROM products
    `);
    res.json(statsResult.rows[0]);
  } catch (err) {
    console.error('DATABASE ERROR [GET /api/products/stats]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/products/export:
 *   get:
 *     summary: Download a CSV export of products matching criteria
 *     tags: [Export]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *     responses:
 *       200:
 *         description: Binary CSV file stream
 */
app.get('/api/products/export', async (req, res) => {
  try {
    const { search = '', category = 'ALL' } = req.query;
    let whereClauses = [];
    let queryParams = [];

    if (search.trim() !== '') {
      queryParams.push(`%${search.trim()}%`);
      whereClauses.push(`(name ILIKE $${queryParams.length} OR sku ILIKE $${queryParams.length})`);
    }

    if (category !== 'ALL') {
      queryParams.push(`%${category}%`);
      whereClauses.push(`name ILIKE $${queryParams.length}`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `SELECT sku, name, price, stock_quantity, created_at FROM products ${whereSQL} ORDER BY created_at DESC`;

    const result = await pool.query(query, queryParams);

    let csv = 'SKU,Name,Balance (KES),Term (Months),Created At\n';
    result.rows.forEach(row => {
      csv += `"${row.sku}","${row.name.replace(/"/g, '""')}",${row.price},${row.stock_quantity},"${row.created_at}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error('DATABASE ERROR [GET /api/products/export]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get paginated, searched, and sorted products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, price, name, sku]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of products with pagination metadata
 *   post:
 *     summary: Create a new product entry
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sku, name, price]
 *             properties:
 *               sku:
 *                 type: string
 *                 example: "BANK-CUST-999"
 *               name:
 *                 type: string
 *                 example: "Term Deposit Prospect - EXECUTIVE"
 *               price:
 *                 type: number
 *                 example: 15000.00
 *               stock_quantity:
 *                 type: integer
 *                 example: 12
 *               attributes:
 *                 type: object
 *     responses:
 *       201:
 *         description: Product created successfully
 */
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || 'ALL';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const allowedSortCols = ['created_at', 'price', 'name', 'sku'];
    const safeSortBy = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';

    let whereClauses = [];
    let queryParams = [];

    if (search.trim() !== '') {
      queryParams.push(`%${search.trim()}%`);
      whereClauses.push(`(name ILIKE $${queryParams.length} OR sku ILIKE $${queryParams.length})`);
    }

    if (category !== 'ALL') {
      queryParams.push(`%${category}%`);
      whereClauses.push(`name ILIKE $${queryParams.length}`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM products ${whereSQL}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalProducts = parseInt(countResult.rows[0].count);

    const dataQueryParams = [...queryParams, limit, offset];
    const dataQuery = `
      SELECT * FROM products 
      ${whereSQL} 
      ORDER BY ${safeSortBy} ${sortOrder} 
      LIMIT $${dataQueryParams.length - 1} OFFSET $${dataQueryParams.length}
    `;

    const result = await pool.query(dataQuery, dataQueryParams);

    res.json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit) || 1,
      currentPage: page,
      limit,
      products: result.rows
    });
  } catch (err) {
    console.error('DATABASE ERROR [GET /api/products]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by UUID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product record details
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
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
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, price, stock_quantity, attributes } = req.body;
    const attrValue = typeof attributes === 'object' ? JSON.stringify(attributes) : (attributes || '{}');
    const result = await pool.query(
      'UPDATE products SET sku = $1, name = $2, price = $3, stock_quantity = $4, attributes = $5 WHERE product_id = $6 RETURNING *',
      [sku, name, price, stock_quantity, attrValue, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));