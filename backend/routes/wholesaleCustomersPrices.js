const express = require('express');
const router = express.Router();
const wholesaleCustomersPricesController = require('../controllers/wholesaleCustomersPricesController');
const { protect } = require('../auth/middleware/authMiddleware');

router.get('/whcustomer-prices', protect, wholesaleCustomersPricesController.getWholesaleCustomersPrices);
router.post('/update-customer-price', protect, wholesaleCustomersPricesController.updateCustomerPrice);

module.exports = router;