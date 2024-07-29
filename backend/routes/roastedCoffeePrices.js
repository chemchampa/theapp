const express = require('express');
const router = express.Router();
const roastedCoffeePricesController = require('../controllers/roastedCoffeePricesController');
const { protect } = require('../auth/middleware/authMiddleware');

router.get('/roasted-coffee-prices', protect, roastedCoffeePricesController.getRoastedCoffeePrices);

module.exports = router;