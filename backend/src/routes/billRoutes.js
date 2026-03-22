const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// Get all bills
router.get('/', billController.getAllBills);

// Get bill by ID
router.get('/:id', billController.getBillById);

// Create a new bill
router.post('/', billController.createBill);

// Update bill by ID
router.put('/:id', billController.updateBill);

// Delete bill by ID
router.delete('/:id', billController.deleteBill);

// Get upcoming bills (due within 7 days)
router.get('/upcoming', billController.getUpcomingBills);

module.exports = router;
