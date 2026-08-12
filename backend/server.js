const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const transactionRoutes = require('./src/routes/transactionRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const billRoutes = require('./src/routes/billRoutes');

app.use('/api/transactions', transactionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/bills', billRoutes);

app.get('/', (req, res) => {
  res.send('Transaction Intelligence API is running');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
