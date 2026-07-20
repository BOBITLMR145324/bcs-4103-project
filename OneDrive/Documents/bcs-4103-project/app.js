const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json()); // Allows your server to read incoming JSON data

// 1. GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET PRODUCT BY ID
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

// 3. ADD NEW PRODUCT (Handles JSONB attributes)
app.post('/api/products', async (req, res) => {
  try {
    const { sku, name, price, stock_quantity, attributes } = req.body;
    const result = await pool.query(
      'INSERT INTO products (sku, name, price, stock_quantity, attributes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sku, name, price, stock_quantity, JSON.stringify(attributes)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE EXISTING PRODUCT
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, price, stock_quantity, attributes } = req.body;
    const result = await pool.query(
      'UPDATE products SET sku = $1, name = $2, price = $3, stock_quantity = $4, attributes = $5 WHERE product_id = $6 RETURNING *',
      [sku, name, price, stock_quantity, JSON.stringify(attributes), id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE A PRODUCT
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));