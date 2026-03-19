const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const purchaseRoutes = require('./src/routes/purchaseRoutes');
app.use('/api/purchases', purchaseRoutes);

app.get('/', (req, res) => {
  res.send('Purchase Intelligence API is running');
});

// Start server
app.listen(port, () => {
  console.log(Server is running on port );
});

