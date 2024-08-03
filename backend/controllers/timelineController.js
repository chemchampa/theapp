const googleSheetsService = require('../services/googleSheetsService');

exports.getTimelineData = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    const timelineData = await googleSheetsService.getTimelineData(tenantId, organizationId);
    res.json(timelineData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timeline data', error: error.message });
  }
};

exports.createTimelineItem = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    const newItem = req.body;
    const createdItem = await googleSheetsService.createTimelineItem(tenantId, organizationId, newItem);
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating timeline item', error: error.message });
  }
};

exports.updateTimelineItem = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    const { id } = req.params;
    const updatedItem = req.body;
    const result = await googleSheetsService.updateTimelineItem(tenantId, organizationId, id, updatedItem);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating timeline item', error: error.message });
  }
};

exports.deleteTimelineItem = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    const { id } = req.params;
    await googleSheetsService.deleteTimelineItem(tenantId, organizationId, id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting timeline item', error: error.message });
  }
};