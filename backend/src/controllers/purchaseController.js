const Purchase = require('../models/Purchase');

// Get all purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.getAll();
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get purchase by ID
exports.getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.getById(id);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new purchase
exports.createPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.create(req.body);
    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update purchase by ID
exports.updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.update(id, req.body);
    res.json(purchase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete purchase by ID
exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    await Purchase.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
