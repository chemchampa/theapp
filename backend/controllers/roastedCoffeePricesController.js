const googleSheetsService = require('../services/googleSheetsService');

exports.getRoastedCoffeePrices = async (req, res) => {
  try {
    // const { tenantId, organizationId } = req.user;
    // const prices = await googleSheetsService.getRoastedCoffeePrices(tenantId, organizationId);
    const prices = await googleSheetsService.getRoastedCoffeePrices(req.tenantId, req.organizationId);
    res.json(prices);
  } catch (error) {
    console.error('Error fetching roasted coffee prices:', error);
    res.status(500).json({ message: 'Failed to fetch roasted coffee prices' });
  }
};