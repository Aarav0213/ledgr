const Subscription = require('../models/Subscription');

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.getAll();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.getById(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create(req.body);
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update subscription by ID
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.update(id, req.body);
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete subscription by ID
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    await Subscription.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
