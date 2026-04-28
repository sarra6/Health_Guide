const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

// AI Analysis endpoints
router.post('/symptoms', aiController.analyzeSymptoms);
router.post('/vitals', aiController.analyzeVitals);
router.post('/image', aiController.upload.single('image'), aiController.analyzeImage);

// Reports
router.get('/reports', aiController.getMyReports);
router.get('/reports/:id', aiController.getReport);

// Doctor endpoints
router.get('/dashboard', restrictTo('doctor', 'admin'), aiController.getDoctorDashboard);
router.get('/patient/:patientId/reports', restrictTo('doctor', 'admin'), aiController.getPatientReports);
router.patch('/reports/:id/review', restrictTo('doctor', 'admin'), aiController.reviewReport);

module.exports = router;
