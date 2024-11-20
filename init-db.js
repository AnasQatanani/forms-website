const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    // First connection to create database
    const connection1 = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    try {
        // Create database if it doesn't exist
        await connection1.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log('Database created or already exists');
        
        // Close first connection
        await connection1.end();

        // Create second connection to the specific database
        const connection2 = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Create orders table
        await connection2.query(`
            CREATE TABLE IF NOT EXISTS orders (
                row_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(36) NOT NULL,
                product_id VARCHAR(50) NOT NULL,
                quantity INT NOT NULL,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_order_id (order_id),
                INDEX idx_product_id (product_id)
            )
        `);
        console.log('Orders table created or already exists');

        // Close second connection
        await connection2.end();
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
