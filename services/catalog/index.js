const express = require('express');
const cors = require('cors');
const products = require('./products');

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check for Kubernetes
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Get all products, optionally filter by category
app.get('/api/products', (req, res) => {
  const category = req.query.category;
  // Simulate slight delay for real-world tracing demo
  setTimeout(() => {
    if(category && category !== 'all') {
      return res.json(products.filter(p => p.category === category));
    }
    res.json(products);
  }, 100);
});

// Get product details
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if(!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Catalog Service running on port ${PORT}`));
