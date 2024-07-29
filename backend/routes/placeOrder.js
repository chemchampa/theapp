const express = require('express');
const router = express.Router();
const placeOrderController = require('../controllers/placeOrderController');
const { protect } = require('../auth/middleware/authMiddleware');

router.get('/customers', protect, placeOrderController.getCustomers);
router.get('/products', protect, placeOrderController.getProducts);
router.post('/orders', protect, placeOrderController.submitOrder);

module.exports = router;