const express = require('express');
const router = express.Router();
const pricesCalculatorController = require('../controllers/pricesCalculatorController');
const { protect } = require('../auth/middleware/authMiddleware');

router.post('/add-product', protect, pricesCalculatorController.addProduct);
router.get('/', protect, pricesCalculatorController.getAllProducts);
router.put('/:id', protect, pricesCalculatorController.updateProduct);
router.delete('/', protect, pricesCalculatorController.deleteProducts);

module.exports = router;
