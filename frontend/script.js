// API endpoint configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const productSelect = document.getElementById('productSelect');
const productDetails = document.getElementById('productDetails');
const articleNumberSpan = document.getElementById('articleNumber');
const descriptionSpan = document.getElementById('description');
const priceSpan = document.getElementById('price');
const orderForm = document.getElementById('orderForm');
const quantityInput = document.getElementById('quantity');
const orderStatus = document.getElementById('orderStatus');
const statusMessage = document.getElementById('statusMessage');
const orderList = document.getElementById('orderList');

// Load products when page loads
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        // Clear existing options except the default one
        productSelect.innerHTML = '<option value="">Select a product...</option>';
        
        // Add product options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.articleNumber;
            option.textContent = `${product.articleNumber} - ${product.description}`;
            productSelect.appendChild(option);
        });
    } catch (error) {
        showError('Error loading products. Please try again later.');
    }
}

// Handle product selection
async function handleProductSelection(event) {
    const articleNumber = event.target.value;
    
    if (!articleNumber) {
        productDetails.classList.add('hidden');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${articleNumber}`);
        const product = await response.json();
        
        articleNumberSpan.textContent = product.articleNumber;
        descriptionSpan.textContent = product.description;
        priceSpan.textContent = `$${product.price}`;
        
        productDetails.classList.remove('hidden');
    } catch (error) {
        showError('Error loading product details. Please try again later.');
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const articleNumber = productSelect.value;
    const quantity = parseInt(quantityInput.value);
    
    if (!articleNumber || !quantity) {
        showError('Please select a product and specify quantity.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: articleNumber,
                quantity: quantity
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`Order created successfully! Order ID: ${result.order_id}`);
            orderForm.reset();
            productDetails.classList.add('hidden');
            loadOrders(); // Refresh the order list
        } else {
            showError(result.message || 'Error creating order. Please try again.');
        }
    } catch (error) {
        showError('Error submitting order. Please try again later.');
    }
}

// Load and display orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        const orders = await response.json();
        
        orderList.innerHTML = ''; // Clear existing orders
        
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <h4>Order ID: ${order.order_id}</h4>
                <p>Product ID: ${order.product_id}</p>
                <p>Quantity: ${order.quantity}</p>
                <p>Order Date: ${new Date(order.order_date).toLocaleString()}</p>
                <div class="order-actions">
                    <button class="btn btn-update" onclick="showEditForm('${order.order_id}', ${order.quantity})">Update</button>
                    <button class="btn btn-delete" onclick="deleteOrder('${order.order_id}')">Delete</button>
                </div>
                <div class="edit-form" id="edit-${order.order_id}">
                    <input type="number" min="1" value="${order.quantity}" id="quantity-${order.order_id}">
                    <button class="btn btn-update" onclick="updateOrder('${order.order_id}')">Save</button>
                </div>
            `;
            orderList.appendChild(orderElement);
        });
    } catch (error) {
        showError('Error loading orders. Please try again later.');
    }
}

// Show edit form for an order
function showEditForm(orderId, quantity) {
    const editForm = document.getElementById(`edit-${orderId}`);
    editForm.classList.add('active');
    document.getElementById(`quantity-${orderId}`).value = quantity;
}

// Update order quantity
async function updateOrder(orderId) {
    const quantityInput = document.getElementById(`quantity-${orderId}`);
    const newQuantity = parseInt(quantityInput.value);
    
    if (!newQuantity || newQuantity < 1) {
        showError('Please enter a valid quantity.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantity: newQuantity
            })
        });
        
        if (response.ok) {
            showSuccess('Order updated successfully!');
            loadOrders(); // Refresh the order list
        } else {
            const error = await response.json();
            showError(error.message || 'Error updating order.');
        }
    } catch (error) {
        showError('Error updating order. Please try again later.');
    }
}

// Delete order
async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Order deleted successfully!');
            loadOrders(); // Refresh the order list
        } else {
            const error = await response.json();
            showError(error.message || 'Error deleting order.');
        }
    } catch (error) {
        showError('Error deleting order. Please try again later.');
    }
}

// Utility functions for showing status messages
function showSuccess(message) {
    statusMessage.textContent = message;
    orderStatus.classList.remove('hidden', 'error');
    orderStatus.classList.add('success');
}

function showError(message) {
    statusMessage.textContent = message;
    orderStatus.classList.remove('hidden', 'success');
    orderStatus.classList.add('error');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadOrders();
});
productSelect.addEventListener('change', handleProductSelection);
orderForm.addEventListener('submit', handleSubmit);
