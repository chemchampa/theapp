const googleSheetsService = require('../services/googleSheetsService');

exports.getWholesaleCustomersDetails = async (req, res) => {
  try {
    const customers = await googleSheetsService.getWholesaleCustomersDetails(req.tenantId, req.organizationId);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching wholesale customers details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addWholesaleCustomer = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    console.log('tenantId:', tenantId, 'organizationId:', organizationId);
    
    const newCustomer = { ...req.body, tenantId, organizationId };
    const detailsResult = await googleSheetsService.appendCustomerToDetailsSheet(newCustomer);
    const pricesResult = await googleSheetsService.appendCustomerToPricesSheet(tenantId, organizationId, newCustomer);
    
    if (newCustomer.customPricing) {
      await googleSheetsService.setCustomPrices(newCustomer);
    }

    res.status(201).json({ 
      message: 'Customer added successfully to both sheets', 
      detailsResult,
      pricesResult
    });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCoffees = async (req, res) => {
  try {
    const coffees = await googleSheetsService.getCoffeeList(req.tenantId, req.organizationId);
    res.json(coffees);
  } catch (error) {
    console.error('Error fetching coffee list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};