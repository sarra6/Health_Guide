/**
 * promptBuilder.js
 * Builds structured prompts for AI health analysis
 */

const buildSymptomPrompt = (symptoms, userContext = {}) => {
  const { age, gender, existingConditions, medications } = userContext;

  let contextBlock = '';
  if (age) contextBlock += `- Age: ${age}\n`;
  if (gender) contextBlock += `- Gender: ${gender}\n`;
  if (existingConditions?.length) contextBlock += `- Known conditions: ${existingConditions.join(', ')}\n`;
  if (medications?.length) contextBlock += `- Current medications: ${medications.join(', ')}\n`;

  return `You are a helpful medical AI assistant. Analyze the following symptoms and provide:
1. Possible conditions (list up to 3)
2. Risk level: low / moderate / high / critical
3. Recommended actions
4. Whether specialist referral is needed and which type

IMPORTANT DISCLAIMER: Always remind the user this is not a substitute for professional medical advice.

${contextBlock ? `Patient Context:\n${contextBlock}` : ''}

Reported Symptoms: ${symptoms.join(', ')}

Respond in this JSON format:
{
  "possibleConditions": ["condition1", "condition2"],
  "riskLevel": "low|moderate|high|critical",
  "recommendation": "detailed recommendation string",
  "specialistReferral": "type or null",
  "urgency": "routine|soon|urgent|emergency",
  "disclaimer": "standard disclaimer"
}`;
};

const buildChatPrompt = (userMessage, chatHistory = [], healthContext = {}) => {
  const systemMessage = `You are a compassionate and knowledgeable medical AI assistant called HealthGuide AI.
You help users understand their health concerns, interpret symptoms, explain medical terms, and guide them toward appropriate care.
You always remind users that your advice does not replace professional medical consultation.
Be empathetic, clear, and evidence-based in your responses.`;

  const historyText = chatHistory
    .slice(-6) // last 6 messages for context
    .map(m => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`)
    .join('\n');

  return {
    system: systemMessage,
    history: historyText,
    message: userMessage,
    healthContext
  };
};

const buildVitalsAnalysisPrompt = (vitals) => {
  return `Analyze the following patient vital signs and health metrics. Identify any abnormalities, calculate risk levels, and provide recommendations.

Vitals:
${vitals.bloodPressureSystolic ? `- Blood Pressure: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg` : ''}
${vitals.heartRate ? `- Heart Rate: ${vitals.heartRate} bpm` : ''}
${vitals.temperature ? `- Temperature: ${vitals.temperature}°C` : ''}
${vitals.oxygenSaturation ? `- O2 Saturation: ${vitals.oxygenSaturation}%` : ''}
${vitals.bmi ? `- BMI: ${vitals.bmi}` : ''}
${vitals.glucose ? `- Blood Glucose: ${vitals.glucose} mg/dL` : ''}
${vitals.cholesterol ? `- Cholesterol: ${vitals.cholesterol} mg/dL` : ''}

Respond in JSON format:
{
  "abnormalities": ["list of abnormal findings"],
  "riskLevel": "low|moderate|high|critical",
  "recommendation": "detailed string",
  "specialistReferral": "type or null",
  "disclaimer": "this analysis does not replace professional diagnosis"
}`;
};

module.exports = { buildSymptomPrompt, buildChatPrompt, buildVitalsAnalysisPrompt };
