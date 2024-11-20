const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'industrial_orders',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err);
    });

// GET endpoint for products by article number
app.get('/api/products/:articleNumber', async (req, res) => {
    try {
        console.log('GET /api/products/:articleNumber - Params:', req.params);
        const products = require('../frontend/industrial.json');
        const product = products.find(p => p.articleNumber === req.params.articleNumber);
        
        if (!product) {
            console.log('Product not found:', req.params.articleNumber);
            return res.status(404).json({ message: 'Product not found' });
        }
        
        console.log('Product found:', product);
        res.json(product);
    } catch (error) {
        console.error('Error in GET /api/products/:articleNumber:', error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        console.log('GET /api/products - Loading products');
        const products = require('../frontend/industrial.json');
        console.log('Products loaded:', products.length);
        res.json(products);
    } catch (error) {
        console.error('Error in GET /api/products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        console.log('GET /api/orders - Fetching orders');
        const [rows] = await pool.execute('SELECT * FROM orders ORDER BY order_date DESC');
        console.log('Orders fetched:', rows.length);
        res.json(rows);
    } catch (error) {
        console.error('Error in GET /api/orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// POST endpoint for creating orders
app.post('/api/orders', async (req, res) => {
    try {
        console.log('POST /api/orders - Request body:', req.body);
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity) {
            console.log('Validation failed:', { product_id, quantity });
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        const order_id = uuidv4();
        console.log('Generated order_id:', order_id);

        const [result] = await pool.execute(
            'INSERT INTO orders (order_id, product_id, quantity) VALUES (?, ?, ?)',
            [order_id, product_id, quantity]
        );
        console.log('Order inserted:', result);

        res.status(201).json({ 
            message: 'Order created successfully',
            order_id: order_id
        });
    } catch (error) {
        console.error('Error in POST /api/orders:', error);
        res.status(500).json({ 
            message: 'Error creating order',
            error: error.message 
        });
    }
});

// PUT endpoint for updating orders
app.put('/api/orders/:orderId', async (req, res) => {
    try {
        console.log('PUT /api/orders/:orderId - Params:', req.params, 'Body:', req.body);
        const { orderId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            console.log('Invalid quantity:', quantity);
            return res.status(400).json({ message: 'Valid quantity is required' });
        }

        const [result] = await pool.execute(
            'UPDATE orders SET quantity = ? WHERE order_id = ?',
            [quantity, orderId]
        );
        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            console.log('Order not found:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error in PUT /api/orders/:orderId:', error);
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
});

// DELETE endpoint for removing orders
app.delete('/api/orders/:orderId', async (req, res) => {
    try {
        console.log('DELETE /api/orders/:orderId - Params:', req.params);
        const { orderId } = req.params;
        
        const [result] = await pool.execute('DELETE FROM orders WHERE order_id = ?', [orderId]);
        console.log('Delete result:', result);

        if (result.affectedRows === 0) {
            console.log('Order not found:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/orders/:orderId:', error);
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
