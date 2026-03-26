const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:3001';

// In-memory simple store for carts { userId: [{ product, quantity }] }
const carts = new Map();

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  const userCart = carts.get(userId) || [];
  res.json(userCart);
});

app.post('/api/cart/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { productId, quantity } = req.body;
  
  if (!productId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'productId and quantity required' });
  }

  try {
    // Validate product with catalog service
    const productRes = await axios.get(`${CATALOG_URL}/api/products/${productId}`);
    const product = productRes.data;

    let userCart = carts.get(userId) || [];
    const itemIndex = userCart.findIndex(i => i.product.id === productId);

    if (itemIndex > -1) {
      userCart[itemIndex].quantity += quantity;
    } else {
      userCart.push({ product, quantity });
    }

    carts.set(userId, userCart);
    res.json(userCart);

  } catch (err) {
    console.error("Error communicating with catalog or adding to cart:", err.message);
    res.status(500).json({ error: 'Failed to add item to cart. Product might not exist.' });
  }
});

app.delete('/api/cart/:userId/items/:productId', (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;

  let userCart = carts.get(userId) || [];
  userCart = userCart.filter(i => i.product.id !== productId);
  carts.set(userId, userCart);

  res.json(userCart);
});

app.delete('/api/cart/:userId', (req, res) => {
    carts.delete(req.params.userId);
    res.status(204).send();
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Cart Service running on port ${PORT}`));
