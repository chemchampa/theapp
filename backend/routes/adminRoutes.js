const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getUsers);
router.get('/organizations', adminController.getOrganizations);
router.get('/spreadsheets', adminController.getSpreadsheets);
router.post('/assign-spreadsheet', adminController.assignSpreadsheet);
router.put('/user-role/:userId', adminController.updateUserRole);

module.exports = router;
