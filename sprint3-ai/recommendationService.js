/**
 * recommendationService.js
 * Rule-based health recommendation engine
 * Provides intelligent recommendations based on patient data without heavy ML
 */

const RISK_RULES = [
  // Blood Pressure Rules
  {
    condition: (data) => data.bloodPressureSystolic > 180 || data.bloodPressureDiastolic > 120,
    riskLevel: 'critical',
    recommendation: 'Hypertensive crisis detected. Seek emergency medical care immediately.',
    specialist: 'emergency',
    urgent: true
  },
  {
    condition: (data) => data.bloodPressureSystolic > 140 && data.age > 50,
    riskLevel: 'high',
    recommendation: 'Elevated blood pressure in an older patient. Cardiology consultation recommended.',
    specialist: 'cardiologist'
  },
  {
    condition: (data) => data.bloodPressureSystolic > 130,
    riskLevel: 'moderate',
    recommendation: 'Pre-hypertension detected. Lifestyle modifications and regular monitoring advised.',
    specialist: null
  },

  // Heart Rate Rules
  {
    condition: (data) => data.heartRate > 150,
    riskLevel: 'high',
    recommendation: 'Tachycardia detected. Immediate medical evaluation recommended.',
    specialist: 'cardiologist',
    urgent: true
  },
  {
    condition: (data) => data.heartRate < 50 && data.heartRate > 0,
    riskLevel: 'moderate',
    recommendation: 'Bradycardia detected. Cardiac evaluation recommended.',
    specialist: 'cardiologist'
  },

  // Oxygen Saturation
  {
    condition: (data) => data.oxygenSaturation < 90 && data.oxygenSaturation > 0,
    riskLevel: 'critical',
    recommendation: 'Critically low oxygen saturation. Emergency medical attention required immediately.',
    specialist: 'emergency',
    urgent: true
  },
  {
    condition: (data) => data.oxygenSaturation < 95 && data.oxygenSaturation >= 90,
    riskLevel: 'high',
    recommendation: 'Low oxygen saturation. Pulmonology consultation recommended.',
    specialist: 'pulmonologist'
  },

  // BMI Rules
  {
    condition: (data) => data.bmi > 40,
    riskLevel: 'high',
    recommendation: 'Severe obesity. Bariatric medicine consultation and comprehensive lifestyle plan recommended.',
    specialist: 'endocrinologist'
  },
  {
    condition: (data) => data.bmi > 30,
    riskLevel: 'moderate',
    recommendation: 'Obesity detected. Nutrition and exercise counseling strongly recommended.',
    specialist: 'nutritionist'
  },
  {
    condition: (data) => data.bmi < 18.5 && data.bmi > 0,
    riskLevel: 'moderate',
    recommendation: 'Underweight detected. Nutritional assessment recommended.',
    specialist: 'nutritionist'
  },

  // Blood Glucose Rules
  {
    condition: (data) => data.glucose > 400,
    riskLevel: 'critical',
    recommendation: 'Dangerously high blood glucose. Seek emergency care immediately.',
    specialist: 'emergency',
    urgent: true
  },
  {
    condition: (data) => data.glucose > 200,
    riskLevel: 'high',
    recommendation: 'High blood glucose suggests uncontrolled diabetes. Endocrinology consultation required.',
    specialist: 'endocrinologist'
  },
  {
    condition: (data) => data.glucose > 126,
    riskLevel: 'moderate',
    recommendation: 'Pre-diabetes or diabetes suspected. Lifestyle changes and medical evaluation needed.',
    specialist: 'physician'
  },
  {
    condition: (data) => data.glucose < 70 && data.glucose > 0,
    riskLevel: 'high',
    recommendation: 'Hypoglycemia detected. Immediate sugar intake and medical evaluation required.',
    specialist: 'endocrinologist',
    urgent: true
  },

  // Cholesterol Rules
  {
    condition: (data) => data.cholesterol > 240,
    riskLevel: 'high',
    recommendation: 'High cholesterol detected. Cardiology or internal medicine consultation recommended.',
    specialist: 'cardiologist'
  },
  {
    condition: (data) => data.cholesterol > 200,
    riskLevel: 'moderate',
    recommendation: 'Borderline high cholesterol. Diet modification and monitoring recommended.',
    specialist: null
  },

  // Temperature Rules
  {
    condition: (data) => data.temperature > 39.5,
    riskLevel: 'high',
    recommendation: 'High fever detected. Medical evaluation required to determine cause.',
    specialist: 'physician',
    urgent: true
  },
  {
    condition: (data) => data.temperature > 38,
    riskLevel: 'moderate',
    recommendation: 'Fever present. Monitor closely and consult a doctor if it persists.',
    specialist: null
  },
  {
    condition: (data) => data.temperature < 35 && data.temperature > 0,
    riskLevel: 'high',
    recommendation: 'Hypothermia detected. Seek medical care immediately.',
    specialist: 'emergency',
    urgent: true
  }
];

/**
 * Generate recommendations based on health data
 * @param {Object} healthData - patient vitals and metrics
 * @param {Object} patientInfo - age, gender, conditions
 */
const generateRecommendations = (healthData, patientInfo = {}) => {
  const flatData = { ...healthData?.vitals, ...healthData?.bloodWork, ...patientInfo };
  
  const triggered = [];
  let highestRisk = 'low';
  const riskOrder = ['low', 'moderate', 'high', 'critical'];

  for (const rule of RISK_RULES) {
    try {
      if (rule.condition(flatData)) {
        triggered.push({
          riskLevel: rule.riskLevel,
          recommendation: rule.recommendation,
          specialist: rule.specialist,
          urgent: rule.urgent || false
        });
        if (riskOrder.indexOf(rule.riskLevel) > riskOrder.indexOf(highestRisk)) {
          highestRisk = rule.riskLevel;
        }
      }
    } catch {
      // Skip rule if data missing
    }
  }

  // Add general wellness recommendations if low risk
  if (triggered.length === 0) {
    triggered.push({
      riskLevel: 'low',
      recommendation: 'All measured vitals appear within normal range. Continue healthy lifestyle habits.',
      specialist: null,
      urgent: false
    });
  }

  const specialists = [...new Set(triggered.map(r => r.specialist).filter(Boolean))];
  const hasUrgent = triggered.some(r => r.urgent);

  return {
    overallRiskLevel: highestRisk,
    findings: triggered,
    specialistReferrals: specialists,
    urgentCareNeeded: hasUrgent,
    summary: buildSummary(highestRisk, triggered, specialists, hasUrgent),
    disclaimer: 'These recommendations are generated by a rule-based system and should be reviewed by a qualified medical professional.'
  };
};

const buildSummary = (riskLevel, findings, specialists, urgent) => {
  if (urgent) {
    return `⚠️ URGENT: Critical health indicators detected. Seek immediate medical care.`;
  }
  if (riskLevel === 'high') {
    return `High-risk indicators found. Medical consultation recommended soon with: ${specialists.join(', ') || 'your physician'}.`;
  }
  if (riskLevel === 'moderate') {
    return `Moderate health concerns detected. Schedule a check-up${specialists.length ? ` with ${specialists.join(', ')}` : ''}.`;
  }
  return `Health metrics look generally good. Maintain regular check-ups and healthy lifestyle.`;
};

/**
 * Symptom-based risk triage
 */
const triageSymptoms = (symptoms) => {
  const emergencyKeywords = ['chest pain', 'difficulty breathing', 'unconscious', 'stroke', 'seizure', 'severe bleeding', 'heart attack'];
  const urgentKeywords = ['high fever', 'severe headache', 'sudden vision loss', 'severe pain', 'confusion', 'vomiting blood'];

  const lowerSymptoms = symptoms.map(s => s.toLowerCase());

  const isEmergency = emergencyKeywords.some(kw => lowerSymptoms.some(s => s.includes(kw)));
  const isUrgent = urgentKeywords.some(kw => lowerSymptoms.some(s => s.includes(kw)));

  if (isEmergency) {
    return { triage: 'emergency', message: '🚨 Emergency symptoms detected. Call emergency services immediately (911/112).' };
  }
  if (isUrgent) {
    return { triage: 'urgent', message: '⚠️ Urgent symptoms present. Seek medical care within the next few hours.' };
  }
  return { triage: 'routine', message: 'Symptoms suggest a routine medical consultation is advisable.' };
};

module.exports = { generateRecommendations, triageSymptoms };
