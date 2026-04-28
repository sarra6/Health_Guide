const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/overview', ctrl.getOverview);
router.get('/trends', ctrl.getTrends);
router.get('/alerts', ctrl.getAlerts);

module.exports = router;
