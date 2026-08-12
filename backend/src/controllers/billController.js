const Bill = require('../models/Bill');

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.getAll(req);
    res.json(bills);
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 500).json({ error: error.message });
  }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.getById(req, id);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 500).json({ error: error.message });
  }
};

// Create a new bill
exports.createBill = async (req, res) => {
  try {
    const bill = await Bill.create(req, req.body);
    res.status(201).json(bill);
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 400).json({ error: error.message });
  }
};

// Update bill by ID
exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.update(req, id, req.body);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 400).json({ error: error.message });
  }
};

// Delete bill by ID
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    await Bill.delete(req, id);
    res.status(204).send();
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 500).json({ error: error.message });
  }
};

// Get upcoming bills (due within 7 days)
exports.getUpcomingBills = async (req, res) => {
  try {
    const bills = await Bill.getUpcoming(req);
    res.json(bills);
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 500).json({ error: error.message });
  }
};
