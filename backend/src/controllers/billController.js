const Bill = require('../models/Bill');

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.getAll();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.getById(id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new bill
exports.createBill = async (req, res) => {
  try {
    const bill = await Bill.create(req.body);
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update bill by ID
exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.update(id, req.body);
    res.json(bill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete bill by ID
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    await Bill.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get upcoming bills (due within 7 days)
exports.getUpcomingBills = async (req, res) => {
  try {
    const bills = await Bill.getUpcoming();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
