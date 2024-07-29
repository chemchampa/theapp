const express = require('express');
const router = express.Router();
const wholesaleCustomersDetailsController = require('../controllers/wholesaleCustomersDetailsController');
const { protect } = require('../auth/middleware/authMiddleware');

router.get('/whcustomer-details', protect, wholesaleCustomersDetailsController.getWholesaleCustomersDetails);
router.post('/whcustomer-details', protect, wholesaleCustomersDetailsController.addWholesaleCustomer);
router.get('/coffees', protect, wholesaleCustomersDetailsController.getCoffees);

module.exports = router;