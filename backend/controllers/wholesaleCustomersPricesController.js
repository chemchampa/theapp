const googleSheetsService = require('../services/googleSheetsService');

exports.getWholesaleCustomersPrices = async (req, res) => {
  try {
    const prices = await googleSheetsService.getWholesaleCustomersPrices(req.tenantId, req.organizationId);
    res.json(prices);
  } catch (error) {
    console.error('Error fetching wholesale customer prices:', error);
    res.status(500).json({ message: 'Error fetching wholesale customer prices' });
  }
};

exports.updateCustomerPrice = async (req, res) => {
  try {
    const { customerId, column, newValue } = req.body;
    console.log('Received update request:', { customerId, column, newValue });
    await googleSheetsService.updateCustomerPrice(req.tenantId, req.organizationId, customerId, column, newValue);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating customer price:', error);
    res.status(500).json({ message: 'Error updating customer price', error: error.message });
  }
};