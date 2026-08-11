const Transaction = require('../models/Transaction');
const { classifyRecurringTransactions } = require('../lib/classification');

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAll(req);
    res.json(classifyRecurringTransactions(transactions));
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 500).json({ error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.getById(req, req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    const [classified] = classifyRecurringTransactions([transaction]);
    res.json(classified);
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 500).json({ error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req, req.body);
    const [classified] = classifyRecurringTransactions([transaction]);
    res.status(201).json(classified);
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 400).json({ error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.update(req, req.params.id, req.body);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    const [classified] = classifyRecurringTransactions([transaction]);
    res.json(classified);
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 400).json({ error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.delete(req, req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 500).json({ error: error.message });
  }
};
