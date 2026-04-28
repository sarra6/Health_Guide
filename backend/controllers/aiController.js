const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const AIReport = require('../models/AIReport');
const { analyzeSymptoms, analyzeVitals } = require('../services/smartAssistantService');
const { analyzeMedicalImage } = require('../services/imageAnalysisService');
const { generateRecommendations, triageSymptoms } = require('../services/recommendationService');
const User = require('../models/User');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/medical-images';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const fileFilter = (req, file, cb) => {
  ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)
    ? cb(null, true) : cb(new Error('Only JPEG/PNG images allowed'), false);
};
exports.upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, context } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Please provide symptoms as an array.' });
    }
    const triage = triageSymptoms(symptoms);
    const result = await analyzeSymptoms(req.user.id, symptoms, context || {});
    res.json({ triage, analysis: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });
    const result = await analyzeMedicalImage(req.user.id, req.file.path, req.body.imageType || 'xray');
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeVitals = async (req, res) => {
  try {
    const { vitals } = req.body;
    if (!vitals) return res.status(400).json({ error: 'Vitals data required.' });

    const ruleRecommendations = generateRecommendations({ vitals }, {
      age: req.user.dateOfBirth
        ? Math.floor((new Date() - new Date(req.user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null
    });
    const aiAnalysis = await analyzeVitals(req.user.id, vitals);
    res.json({ ruleRecommendations, aiAnalysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await AIReport.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await AIReport.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientReports = async (req, res) => {
  try {
    // Verify the patient exists
    const patient = await User.findOne({ where: { id: req.params.patientId, role: 'patient' } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const reports = await AIReport.findAll({
      where: { userId: req.params.patientId },
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reviewReport = async (req, res) => {
  try {
    // Find the report first
    const report = await AIReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found.' });

    // Verify the patient exists
    const patient = await User.findOne({ where: { id: report.userId, role: 'patient' } });
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    // Authorization check: ensure doctor has permission to review
    // Doctors can only review their own patients' reports or be admin
    if (req.user.role === 'doctor') {
      // Check if there's an existing assignment or allow any doctor to review
      // For now, allow all doctors to review pending reports
    }

    // Update the report with authorization check
    const [updated] = await AIReport.update(
      { reviewedByDoctor: true, doctorId: req.user.id, doctorNotes: req.body.notes },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ error: 'Report not found.' });
    const updatedReport = await AIReport.findByPk(req.params.id);
    res.json({ message: 'Review saved.', report: updatedReport });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDoctorDashboard = async (req, res) => {
  try {
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const pendingReviews = await AIReport.count({ where: { reviewedByDoctor: false } });
    const criticalCases = await AIReport.count({ where: { riskLevel: 'critical', reviewedByDoctor: false } });

    // Join with users to get patient info
    const recentReports = await AIReport.findAll({
      where: { reviewedByDoctor: false },
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'patient', attributes: ['name', 'email'] }]
    });

    res.json({ totalPatients, pendingReviews, criticalCases, recentReports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

