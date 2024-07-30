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

// exports.submitOrder = async (req, res) => {
//   try {
//     console.log('Submitting order. User:', req.user);
//     console.log('Order data:', req.body);
//     const { orderItems, customerName } = req.body;
//     const orderId = await googleSheetsService.submitOrder(req.tenantId, req.organizationId, orderItems, customerName);
//     res.json({ message: 'Order submitted successfully', orderId });
//     const orderId = await googleSheetsService.submitOrder(req.user.tenantId, req.user.organizationId, orderItems, customerName);
//     res.json({ message: 'Order submitted successfully', orderId });
//   } catch (error) {
//     console.error('Error submitting order:', error);
//     res.status(500).json({ error: 'An error occurred while submitting the order', details: error.message });
//   }
// };

exports.submitOrder = async (req, res) => {
  try {
    console.log('Submitting order. User:', req.user);
    console.log('Order data:', req.body);
    const { orderItems, customerName } = req.body;
    
    // Log the values before passing them
    console.log('Passing to submitOrder:', {
      tenantId: req.user.tenant_id,
      organizationId: req.user.organization_id,
      orderItems,
      customerName
    });

    const orderId = await googleSheetsService.submitOrder(
      req.user.tenant_id,
      req.user.organization_id,
      orderItems,
      customerName
    );
    res.json({ message: 'Order submitted successfully', orderId });
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).json({ error: 'An error occurred while submitting the order', details: error.message });
  }
};



