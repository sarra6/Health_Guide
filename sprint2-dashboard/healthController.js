const { Op } = require('sequelize');
const HealthData = require('../models/HealthData');
const { generateRecommendations } = require('../services/recommendationService');

exports.addHealthData = async (req, res) => {
  try {
    const body = req.body;
    // Flatten vitals/bloodWork if sent nested
    const flat = {
      userId: req.user.id,
      bloodPressureSystolic:  body.vitals?.bloodPressureSystolic  || body.bloodPressureSystolic,
      bloodPressureDiastolic: body.vitals?.bloodPressureDiastolic || body.bloodPressureDiastolic,
      heartRate:              body.vitals?.heartRate              || body.heartRate,
      temperature:            body.vitals?.temperature            || body.temperature,
      oxygenSaturation:       body.vitals?.oxygenSaturation       || body.oxygenSaturation,
      weight:                 body.vitals?.weight                 || body.weight,
      height:                 body.vitals?.height                 || body.height,
      glucose:                body.bloodWork?.glucose             || body.glucose,
      cholesterol:            body.bloodWork?.cholesterol         || body.cholesterol,
      hemoglobin:             body.bloodWork?.hemoglobin          || body.hemoglobin,
      whiteBloodCells:        body.bloodWork?.whiteBloodCells     || body.whiteBloodCells,
      symptoms:    body.symptoms    || [],
      medications: body.medications || [],
      notes:       body.notes,
      riskLevel:   body.riskLevel   || 'low'
    };

    const healthData = await HealthData.create(flat);

    const recommendations = generateRecommendations(
      { vitals: flat, bloodWork: flat },
      { age: req.user.dateOfBirth
          ? Math.floor((new Date() - new Date(req.user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
          : null }
    );

    res.status(201).json({ healthData, recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHealthHistory = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await HealthData.findAndCountAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.json({ data: rows, total: count, page: Number(page), pages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLatestHealthData = async (req, res) => {
  try {
    const data = await HealthData.findOne({
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });
    if (!data) return res.status(404).json({ error: 'No health data found.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateHealthData = async (req, res) => {
  try {
    // Whitelist allowed fields to prevent mass assignment
    const allowedUpdates = ['bloodPressureSystolic', 'bloodPressureDiastolic', 'heartRate', 'temperature', 'oxygenSaturation', 'weight', 'height', 'glucose', 'cholesterol', 'hemoglobin', 'whiteBloodCells', 'symptoms', 'medications', 'notes', 'riskLevel'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const [updated] = await HealthData.update(updates, {
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!updated) return res.status(404).json({ error: 'Record not found.' });
    const data = await HealthData.findByPk(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteHealthData = async (req, res) => {
  try {
    const data = await HealthData.findByPk(req.params.id);
    if (!data) return res.status(404).json({ error: 'Record not found.' });
    
    // Verify ownership
    if (data.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this record.' });
    }
    
    await HealthData.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Record deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientData = async (req, res) => {
  try {
    const data = await HealthData.findAll({
      where: { userId: req.params.patientId },
      order: [['date', 'DESC']],
      limit: 50
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

