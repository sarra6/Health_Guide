const axios = require('axios');
const { buildSymptomPrompt, buildChatPrompt, buildVitalsAnalysisPrompt } = require('../utils/promptBuilder');
const AIReport = require('../models/AIReport');

/**
 * smartAssistantService.js
 * Uses OpenRouter AI (free models) with automatic model fallback
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free models tried in order — fallback if one is busy/rate-limited
const MODELS = [
  'openai/gpt-4o-mini',
  'deepseek/deepseek-chat',
  'anthropic/claude-3-haiku',
  'meta-llama/llama-3-8b-instruct',
];

const isRetryable = (status) => [429, 502, 503, 504].includes(status);

/**
 * Call OpenRouter API with automatic model fallback
 */
const callOpenRouterAPI = async (prompt, timeout = 30000) => {
  const errors = [];

  for (const model of MODELS) {
    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'HealthGuide AI',
          },
          timeout,
        }
      );

      const text = response.data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from model');
      console.log(`✅ OpenRouter model used: ${model}`);
      return text;

    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.error?.message || error.message;
      console.warn(`⚠️  Model ${model} failed (${status || 'timeout'}): ${msg}`);
      errors.push({ model, status, msg });

      if (isRetryable(status) || error.code === 'ECONNABORTED') {
        continue;
      }
      break;
    }
  }

  const lastError = errors[errors.length - 1];
  if (lastError?.status === 401) {
    throw new Error('Invalid OpenRouter API key. Check your OPENROUTER_API_KEY in .env');
  }
  throw new Error('All AI models are currently unavailable. Please try again in a moment.');
};

/**
 * Call OpenRouter API for chat with history
 */
const callOpenRouterChat = async (systemPrompt, history, userMessage, timeout = 30000) => {
  const errors = [];

  // Build messages array with system prompt and history
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  // Add chat history (last 8 messages)
  const historyMessages = history.slice(-8);
  for (const m of historyMessages) {
    messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
  }
  
  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  for (const model of MODELS) {
    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'HealthGuide AI',
          },
          timeout,
        }
      );

      const text = response.data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from model');
      console.log(`✅ OpenRouter chat model used: ${model}`);
      return text;

    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.error?.message || error.message;
      console.warn(`⚠️  Model ${model} failed (${status || 'timeout'}): ${msg}`);
      errors.push({ model, status, msg });

      if (isRetryable(status) || error.code === 'ECONNABORTED') {
        continue;
      }
      break;
    }
  }

  throw new Error('All AI models are currently unavailable. Please try again in a moment.');
};

const analyzeSymptoms = async (userId, symptoms, userContext = {}) => {
  const prompt = buildSymptomPrompt(symptoms, userContext);
  const rawResponse = await callOpenRouterAPI(prompt);

  let parsed;
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = {
      possibleConditions: ['Unable to parse response'],
      riskLevel: 'moderate',
      recommendation: rawResponse,
      specialistReferral: null,
      urgency: 'soon',
      disclaimer: 'This analysis does not replace professional medical advice.'
    };
  }

  const report = await AIReport.create({
    userId,
    inputType: 'symptoms',
    inputData: { symptoms, userContext },
    prediction: parsed.possibleConditions?.join(', '),
    confidenceScore: parsed.riskLevel === 'low' ? 70 : parsed.riskLevel === 'moderate' ? 60 : 80,
    recommendation: parsed.recommendation,
    riskLevel: parsed.riskLevel,
    specialistReferral: parsed.specialistReferral
  });

  return { ...parsed, reportId: report.id };
};

const generateChatResponse = async (userId, userMessage, chatHistory = [], healthContext = {}) => {
  const { system, history, message } = buildChatPrompt(userMessage, chatHistory, healthContext);

  const response = await callOpenRouterChat(system, chatHistory, userMessage);
  return { response, timestamp: new Date() };
};

const analyzeVitals = async (userId, vitals) => {
  const prompt = buildVitalsAnalysisPrompt(vitals);
  const rawResponse = await callOpenRouterAPI(prompt);

  let parsed;
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = {
      abnormalities: [],
      riskLevel: 'low',
      recommendation: rawResponse,
      specialistReferral: null
    };
  }

  const report = await AIReport.create({
    userId,
    inputType: 'vitals',
    inputData: vitals,
    prediction: parsed.abnormalities?.join(', ') || 'Normal',
    recommendation: parsed.recommendation,
    riskLevel: parsed.riskLevel,
    specialistReferral: parsed.specialistReferral
  });

  return { ...parsed, reportId: report.id };
};

module.exports = { analyzeSymptoms, generateChatResponse, analyzeVitals };
