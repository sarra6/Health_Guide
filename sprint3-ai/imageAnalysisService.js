const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AIReport = require('../models/AIReport');

/**
 * imageAnalysisService.js
 * Uses OpenRouter AI (free vision models) for medical image analysis
 */

// Free vision models tried in order
const MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-haiku',
];

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const isRetryable = (status) => [429, 502, 503, 504].includes(status);

/**
 * Analyze medical image using OpenRouter vision models
 */
const analyzeMedicalImage = async (userId, imagePath, imageType = 'xray') => {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const prompt = getImagePromptByType(imageType);
  const errors = [];

  for (const model of MODELS) {
    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Image}` }
                }
              ]
            }
          ],
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
          timeout: 60000, // Longer timeout for image analysis
        }
      );

      const rawText = response.data.choices?.[0]?.message?.content;
      if (!rawText) throw new Error('Empty response from model');
      
      console.log(`✅ OpenRouter image analysis model used: ${model}`);
      const parsed = parseImageResponse(rawText);

      const report = await AIReport.create({
        userId,
        inputType: 'image',
        inputData: { imageType, imagePath: path.basename(imagePath) },
        prediction: parsed.findings,
        confidenceScore: parsed.confidence,
        recommendation: parsed.recommendation,
        riskLevel: parsed.riskLevel,
        specialistReferral: parsed.specialistReferral
      });

      return { ...parsed, reportId: report.id };

    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.error?.message || error.message;
      console.warn(`⚠️  Model ${model} failed (${status || 'timeout'}): ${msg}`);
      errors.push({ model, status, msg });

      if (isRetryable(status) || error.code === 'ECONNABORTED') {
        continue;
      }
      // Non-retryable error — try next model
      if (status === 400) {
        // This model doesn't support vision — skip to next
        continue;
      }
      break;
    }
  }

  const lastError = errors[errors.length - 1];
  if (lastError?.status === 401) {
    throw new Error('Invalid OpenRouter API key. Check your OPENROUTER_API_KEY in .env');
  }
  throw new Error('All AI image analysis models are currently unavailable. Please try again in a moment.');
};

const getImagePromptByType = (type) => {
  const prompts = {
    xray: `You are a medical imaging AI assistant. Analyze this chest X-ray image.
Respond ONLY in this exact JSON format with no extra text or markdown:
{"findings":"description","possibleConditions":["condition1"],"confidence":75,"riskLevel":"low","recommendation":"string","specialistReferral":"radiologist","disclaimer":"This AI analysis does not replace professional radiologist review."}`,
    skin: `You are a dermatology AI assistant. Analyze this skin image.
Respond ONLY in this exact JSON format with no extra text or markdown:
{"findings":"description","possibleConditions":["condition1"],"confidence":70,"riskLevel":"low","recommendation":"string","specialistReferral":"dermatologist","disclaimer":"This AI analysis does not replace professional dermatologist review."}`,
    general: `Analyze this medical image.
Respond ONLY in this exact JSON format with no extra text or markdown:
{"findings":"description","possibleConditions":["condition1"],"confidence":60,"riskLevel":"low","recommendation":"string","specialistReferral":"physician","disclaimer":"This AI analysis does not replace professional medical review."}`
  };
  return prompts[type] || prompts.general;
};

const parseImageResponse = (rawText) => {
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      findings: rawText,
      possibleConditions: [],
      confidence: 50,
      riskLevel: 'moderate',
      recommendation: 'Please consult a medical professional for proper diagnosis.',
      specialistReferral: 'physician',
      disclaimer: 'This AI analysis does not replace professional medical diagnosis.'
    };
  }
};

module.exports = { analyzeMedicalImage };
