const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require doctor or admin role
router.use(protect);
router.use(restrictTo('doctor', 'admin'));

// Patient management
router.get('/patients', doctorController.getPatients);
router.get('/patients/search', doctorController.searchPatients);
router.get('/patients/:patientId', doctorController.getPatientDetails);

// Appointments
router.get('/appointments', doctorController.getAllAppointments);

// Prescriptions
router.get('/prescriptions', doctorController.getMyPrescriptions);
router.post('/prescriptions', doctorController.createPrescription);
router.patch('/prescriptions/:id', doctorController.updatePrescription);
router.delete('/prescriptions/:id', doctorController.cancelPrescription);

// Statistics
router.get('/stats', doctorController.getDoctorStats);

module.exports = router;
