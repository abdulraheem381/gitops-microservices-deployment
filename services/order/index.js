const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const CART_URL = process.env.CART_URL || 'http://localhost:3002';
const PAYMENT_URL = process.env.PAYMENT_URL || 'http://localhost:3004';

// In-memory simple store for orders
const orders = [];

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/api/orders/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.params.userId);
  res.json(userOrders);
});

app.post('/api/orders', async (req, res) => {
  const { userId, email, shippingAddress } = req.body;
  if (!userId || !email || !shippingAddress) {
    return res.status(400).json({ error: 'userId, email, and shippingAddress required' });
  }

  try {
    // 1. Get cart items
    const cartRes = await axios.get(`${CART_URL}/api/cart/${userId}`);
    const cartItems = cartRes.data;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // 2. Process payment (Call payment service)
    await axios.post(`${PAYMENT_URL}/api/payment`, {
      amount: totalAmount,
      currency: 'USD',
      userId
    });

    // 3. Create order
    const order = {
      orderId: uuidv4(),
      userId,
      email,
      shippingAddress,
      items: cartItems,
      totalAmount,
      status: 'CONFIRMED',
      createdAt: new Date()
    };
    orders.push(order);

    // 4. Empty cart
    try {
      await axios.delete(`${CART_URL}/api/cart/${userId}`);
    } catch (clearErr) {
      console.warn("Could not clear cart, but continuing:", clearErr.message);
    }

    res.status(201).json(order);

  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
