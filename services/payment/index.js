const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/api/payment', (req, res) => {
  const { amount, currency, userId } = req.body;
  if (!amount || !userId) {
    return res.status(400).json({ error: 'amount and userId required' });
  }

  // Simulate remote processing delay
  setTimeout(() => {
    res.status(200).json({
      status: 'SUCCESS',
      transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
      amount,
      currency: currency || 'USD',
      userId
    });
  }, 200);
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
