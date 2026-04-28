const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', healthController.addHealthData);
router.get('/', healthController.getHealthHistory);
router.get('/latest', healthController.getLatestHealthData);
router.patch('/:id', healthController.updateHealthData);
router.delete('/:id', healthController.deleteHealthData);

// Doctor only
router.get('/patient/:patientId', restrictTo('doctor', 'admin'), healthController.getPatientData);

module.exports = router;
