// const express = require('express');
// const router = express.Router();
// const timelineController = require('../controllers/timelineController');
// const { protect, setTenantAndOrganization } = require('../auth/middleware/authMiddleware');

// router.get('/timeline-data', protect, setTenantAndOrganization, timelineController.getTimelineData);
// router.post('/timeline-data', protect, setTenantAndOrganization, timelineController.createTimelineItem);
// router.put('/timeline-data/:id', protect, setTenantAndOrganization, timelineController.updateTimelineItem);
// router.delete('/timeline-data/:id', protect, setTenantAndOrganization, timelineController.deleteTimelineItem);

// module.exports = router;

// v.2
const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const authMiddleware = require('../auth/middleware/authMiddleware');
const setTenantAndOrganization = require('../middleware/tenantMiddleware').setTenantAndOrganization;

console.log('Timeline Controller:', timelineController);

router.get('/timeline-data', authMiddleware.protect, setTenantAndOrganization, (req, res) => {
    console.log('Entering getTimelineData handler');
    timelineController.getTimelineData(req, res);
});

router.post('/timeline-data', authMiddleware.protect, setTenantAndOrganization, (req, res) => {
    console.log('Entering createTimelineItem handler');
    timelineController.createTimelineItem(req, res);
})

router.put('/timeline-data/:id', authMiddleware.protect, setTenantAndOrganization, (req, res) => {
    console.log('PUT /timeline-data/:id handler:');
    timelineController.updateTimelineItem(req, res);
  });

router.delete('/timeline-data/:id', authMiddleware.protect, setTenantAndOrganization, (req, res) => {
  console.log('DELETE /timeline-data/:id handler:');
  timelineController.deleteTimelineItem(req, res);
});

module.exports = router;

