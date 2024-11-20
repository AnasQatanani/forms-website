# Industrial Products Order Management System

A full-stack web application for managing industrial product orders.

## Technology Stack

- Frontend: HTML, JavaScript, CSS
- Backend: Node.js, Express.js
- Database: MySQL

## Setup Instructions

1. Install Dependencies:
```bash
npm install
```

2. Configure Environment Variables:
Create a `.env` file in the root directory with the following content:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=industrial_orders
```

3. Initialize Database:
```bash
node init-db.js
```

4. Start the Server:
```bash
npm start
```

5. Access the Application:
Open `http://localhost:3000` in your web browser.

## Project Structure

```
forms-website/
├── frontend/               # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   ├── script.js          # Frontend JavaScript
│   └── industrial.json    # Product data
├── backend/               # Backend files
│   └── server.js          # Express server and API endpoints
├── database/              # Database files
│   └── schema.sql         # Database schema
├── .env                   # Environment variables
├── init-db.js            # Database initialization script
└── package.json          # Project dependencies
```

## Features

1. Product Management:
   - View product list
   - View product details
   - Dynamic product selection

2. Order Management:
   - Place new orders
   - View existing orders
   - Update order quantities
   - Delete orders

## API Endpoints

- GET `/api/products` - List all products
- GET `/api/products/:articleNumber` - Get specific product
- GET `/api/orders` - Retrieve all orders
- POST `/api/orders` - Create new order
- PUT `/api/orders/:orderId` - Update order quantity
- DELETE `/api/orders/:orderId` - Delete order

## Database Schema

```sql
CREATE TABLE orders (
    row_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
)
```
