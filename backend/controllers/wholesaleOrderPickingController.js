const googleSheetsService = require('../services/googleSheetsService');

exports.getPickingList = async (req, res) => {
  try {
    const dateFilter = req.query.date;
    console.log('Received request for date:', dateFilter);
    const pickingList = await googleSheetsService.generatePickingList(req.tenantId, req.organizationId, dateFilter);

    console.log('Generated picking list:', pickingList);
    
    if (pickingList.length === 0) {
      console.log('No data found for the requested date');
    }
    
    res.json(pickingList);
  } catch (error) {
    console.error('Error generating picking list:', error);
    res.status(500).json({ error: 'An error occurred while generating the picking list', details: error.message });
  }
};
