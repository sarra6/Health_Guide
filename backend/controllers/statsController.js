const { Op, fn, col } = require('sequelize');
const HealthData = require('../models/HealthData');
const AIReport = require('../models/AIReport');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');

/**
 * GET /api/stats/overview
 * Summary numbers for the dashboard
 */
exports.getOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [totalRecords, recentRecords, totalReports, activeMeds, upcomingAppts, latest] = await Promise.all([
      HealthData.count({ where: { userId } }),
      HealthData.count({ where: { userId, createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      AIReport.count({ where: { userId } }),
      Medication.count({ where: { userId, active: true } }),
      Appointment.count({ where: { userId, status: 'upcoming', date: { [Op.gte]: now } } }),
      HealthData.findOne({ where: { userId }, order: [['createdAt', 'DESC']] })
    ]);

    // Risk distribution
    const riskCounts = await AIReport.findAll({
      where: { userId },
      attributes: ['riskLevel', [fn('COUNT', col('riskLevel')), 'count']],
      group: ['riskLevel'],
      raw: true
    });

    // Health score calculation
    const healthScore = calculateHealthScore(latest);

    res.json({
      totalRecords,
      recentRecords,
      totalReports,
      activeMedications: activeMeds,
      upcomingAppointments: upcomingAppts,
      healthScore,
      latestVitals: latest || null,
      riskDistribution: riskCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/stats/trends
 * Time-series data for charts (last 30 records)
 */
exports.getTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { metric = 'all', limit = 30 } = req.query;

    const records = await HealthData.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
      limit: Number(limit),
      attributes: [
        'id', 'createdAt', 'date',
        'bloodPressureSystolic', 'bloodPressureDiastolic',
        'heartRate', 'temperature', 'oxygenSaturation',
        'weight', 'bmi', 'glucose', 'cholesterol', 'riskLevel'
      ],
      raw: true
    });

    // Format for recharts
    const formatted = records.map(r => ({
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: r.createdAt,
      bloodPressure: r.bloodPressureSystolic ? `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}` : null,
      systolic: r.bloodPressureSystolic,
      diastolic: r.bloodPressureDiastolic,
      heartRate: r.heartRate,
      temperature: r.temperature,
      oxygenSaturation: r.oxygenSaturation,
      weight: r.weight,
      bmi: r.bmi,
      glucose: r.glucose,
      cholesterol: r.cholesterol,
      riskLevel: r.riskLevel
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/stats/alerts
 * Active health alerts based on latest vitals
 */
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const latest = await HealthData.findOne({ where: { userId }, order: [['createdAt', 'DESC']] });
    if (!latest) return res.json({ alerts: [] });

    const alerts = generateAlerts(latest);
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---- Helpers ----

function calculateHealthScore(data) {
  if (!data) return null;
  let score = 100;
  let factors = [];

  // Blood pressure
  if (data.bloodPressureSystolic > 180) { score -= 25; factors.push({ label: 'BP Critical', impact: -25 }); }
  else if (data.bloodPressureSystolic > 140) { score -= 15; factors.push({ label: 'BP High', impact: -15 }); }
  else if (data.bloodPressureSystolic > 120) { score -= 5; factors.push({ label: 'BP Elevated', impact: -5 }); }

  // Heart rate
  if (data.heartRate > 150 || data.heartRate < 40) { score -= 20; factors.push({ label: 'Heart Rate Abnormal', impact: -20 }); }
  else if (data.heartRate > 100 || data.heartRate < 55) { score -= 8; factors.push({ label: 'Heart Rate Irregular', impact: -8 }); }

  // Oxygen
  if (data.oxygenSaturation < 90) { score -= 25; factors.push({ label: 'Low O2', impact: -25 }); }
  else if (data.oxygenSaturation < 95) { score -= 10; factors.push({ label: 'O2 Below Normal', impact: -10 }); }

  // BMI
  if (data.bmi > 35 || data.bmi < 16) { score -= 15; factors.push({ label: 'BMI Critical', impact: -15 }); }
  else if (data.bmi > 30 || data.bmi < 18.5) { score -= 7; factors.push({ label: 'BMI Abnormal', impact: -7 }); }

  // Glucose
  if (data.glucose > 300 || data.glucose < 60) { score -= 20; factors.push({ label: 'Glucose Critical', impact: -20 }); }
  else if (data.glucose > 126) { score -= 8; factors.push({ label: 'Glucose High', impact: -8 }); }

  // Cholesterol
  if (data.cholesterol > 240) { score -= 10; factors.push({ label: 'Cholesterol High', impact: -10 }); }

  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    grade: finalScore >= 85 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 55 ? 'C' : finalScore >= 40 ? 'D' : 'F',
    status: finalScore >= 85 ? 'Excellent' : finalScore >= 70 ? 'Good' : finalScore >= 55 ? 'Fair' : finalScore >= 40 ? 'Poor' : 'Critical',
    color: finalScore >= 85 ? '#10B981' : finalScore >= 70 ? '#3B82F6' : finalScore >= 55 ? '#F59E0B' : '#EF4444',
    factors
  };
}

function generateAlerts(data) {
  const alerts = [];
  if (data.bloodPressureSystolic > 180) alerts.push({ type: 'critical', message: `BP ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} — Hypertensive crisis. Seek emergency care.`, icon: '🚨' });
  else if (data.bloodPressureSystolic > 140) alerts.push({ type: 'warning', message: `BP ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} — High blood pressure detected.`, icon: '⚠️' });
  if (data.oxygenSaturation && data.oxygenSaturation < 90) alerts.push({ type: 'critical', message: `O2 saturation ${data.oxygenSaturation}% — Critically low. Seek immediate care.`, icon: '🚨' });
  if (data.heartRate > 150) alerts.push({ type: 'warning', message: `Heart rate ${data.heartRate} bpm — Tachycardia detected.`, icon: '⚠️' });
  if (data.glucose > 400) alerts.push({ type: 'critical', message: `Blood glucose ${data.glucose} mg/dL — Dangerously high.`, icon: '🚨' });
  else if (data.glucose > 200) alerts.push({ type: 'warning', message: `Blood glucose ${data.glucose} mg/dL — High. Monitor closely.`, icon: '⚠️' });
  if (data.temperature > 39.5) alerts.push({ type: 'warning', message: `Temperature ${data.temperature}°C — High fever detected.`, icon: '🌡️' });
  return alerts;
}
