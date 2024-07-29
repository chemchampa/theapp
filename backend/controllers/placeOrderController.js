const googleSheetsService = require('../services/googleSheetsService');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await googleSheetsService.getCustomers(req.tenantId, req.organizationId);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'An error occurred while fetching customers' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const productType = req.query.type || 'Coffee'; // Default to 'Coffee' if no type is specified
    const products = await googleSheetsService.getProducts(req.tenantId, req.organizationId, productType);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products' });
  }
};

exports.submitOrder = async (req, res) => {
  try {
    const { orderItems, customerName } = req.body;
    const orderId = await googleSheetsService.submitOrder(req.tenantId, req.organizationId, req.orderItems, req.customerName);
    res.json({ message: 'Order submitted successfully', orderId });
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).json({ error: 'An error occurred while submitting the order' });
  }
};
