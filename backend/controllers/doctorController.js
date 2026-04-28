const { Op } = require('sequelize');
const User = require('../models/User');
const HealthData = require('../models/HealthData');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const AIReport = require('../models/AIReport');
const Prescription = require('../models/Prescription');
const { sequelize } = require('../config/db');

// Get all patients (doctors can see all patients)
exports.getPatients = async (req, res) => {
  try {
    const patients = await User.findAll({
      where: { role: 'patient' },
      attributes: ['id', 'name', 'email', 'dateOfBirth', 'gender', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single patient details with all their data
exports.getPatientDetails = async (req, res) => {
  try {
    const patient = await User.findOne({
      where: { id: req.params.patientId, role: 'patient' },
      attributes: ['id', 'name', 'email', 'dateOfBirth', 'gender', 'createdAt']
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get patient's health data (limit sensitive fields returned)
    const healthData = await HealthData.findAll({
      where: { userId: req.params.patientId },
      attributes: ['id', 'date', 'bloodPressureSystolic', 'bloodPressureDiastolic', 
                  'heartRate', 'oxygenSaturation', 'temperature', 'weight', 'height',
                  'glucose', 'cholesterol', 'riskLevel', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Get patient's medications (limit fields)
    const medications = await Medication.findAll({
      where: { userId: req.params.patientId },
      attributes: ['id', 'name', 'dosage', 'frequency', 'active', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Get patient's appointments
    const appointments = await Appointment.findAll({
      where: { userId: req.params.patientId },
      order: [['date', 'DESC']]
    });

    // Get patient's AI reports
    const reports = await AIReport.findAll({
      where: { userId: req.params.patientId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Get prescriptions from this doctor
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.params.patientId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      patient,
      healthData,
      medications,
      appointments,
      reports,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new prescription for a patient
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medicationName, dosage, frequency, duration, instructions, startDate, endDate, notes } = req.body;

    const patient = await User.findOne({ where: { id: patientId, role: 'patient' } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user.id,
      medicationName,
      dosage,
      frequency,
      duration,
      instructions,
      startDate,
      endDate,
      notes
    });

    res.status(201).json({ message: 'Prescription created', prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update prescription
exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      where: { id: req.params.id, doctorId: req.user.id }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Whitelist allowed fields to prevent mass assignment
    const allowedUpdates = ['medicationName', 'dosage', 'frequency', 'duration', 'instructions', 'startDate', 'endDate', 'notes'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await prescription.update(updates);
    res.json({ message: 'Prescription updated', prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel/Deactivate prescription
exports.cancelPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      where: { id: req.params.id, doctorId: req.user.id }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    await prescription.update({ status: 'cancelled', isActive: false });
    res.json({ message: 'Prescription cancelled', prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all prescriptions written by this doctor
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { doctorId: req.user.id },
      include: [{
        model: User,
        as: 'patient',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all appointments for doctor's patients
exports.getAllAppointments = async (req, res) => {
  try {
    // Get appointments where this doctor is assigned (doctorId matches current user)
    const appointments = await Appointment.findAll({
      where: { doctorId: req.user.id },
      include: [{
        model: User,
        as: 'patient',
        attributes: ['id', 'name', 'email']
      }],
      order: [['date', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor statistics
exports.getDoctorStats = async (req, res) => {
  try {
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalPrescriptions = await Prescription.count({ where: { doctorId: req.user.id } });
    const activePrescriptions = await Prescription.count({ 
      where: { doctorId: req.user.id, status: 'active' } 
    });
    const pendingReports = await AIReport.count({ where: { reviewedByDoctor: false } });
    const criticalCases = await AIReport.count({ 
      where: { riskLevel: 'critical', reviewedByDoctor: false } 
    });

    // Today's appointments - use proper date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.count({
      where: { 
        doctorId: req.user.id,
        date: { [require('sequelize').Op.gte]: today, [require('sequelize').Op.lt]: tomorrow }
      }
    });

    res.json({
      totalPatients,
      totalPrescriptions,
      activePrescriptions,
      pendingReports,
      criticalCases,
      todayAppointments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search patients
exports.searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    const patients = await User.findAll({
      where: { 
        role: 'patient',
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'name', 'email', 'dateOfBirth', 'gender'],
      limit: 20
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
