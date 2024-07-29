const express = require('express');
const router = express.Router();
const wholesaleOrderPickingController = require('../controllers/wholesaleOrderPickingController');
const { protect } = require('../auth/middleware/authMiddleware');

router.get('/picking-list', protect, wholesaleOrderPickingController.getPickingList);

module.exports = router;