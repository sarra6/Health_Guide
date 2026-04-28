const axios = require('axios');

/**
 * aiProvider.js
 * Single unified AI provider using OpenRouter (free models)
 * To swap models, change MODELS array only — nothing else changes
 *
 * Free models on OpenRouter (no billing required):
 * https://openrouter.ai/models?q=free
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
 * Call OpenRouter with automatic model fallback
 * @param {Array} messages  - OpenAI-format messages [{role, content}]
 * @param {number} timeout  - ms before giving up (default 30s)
 */
const callAI = async (messages, timeout = 30000) => {
  const errors = [];

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
      console.log(`✅ AI response from: ${model}`);
      return text;

    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.error?.message || error.message;
      console.warn(`⚠️  Model ${model} failed (${status || 'timeout'}): ${msg}`);
      errors.push({ model, status, msg });

      if (isRetryable(status) || error.code === 'ECONNABORTED') {
        continue; // try next model
      }
      // Non-retryable error (401, 400, etc.) — stop immediately
      break;
    }
  }

  const lastError = errors[errors.length - 1];
  if (lastError?.status === 401) {
    throw new Error('Invalid OpenRouter API key. Check your OPENROUTER_API_KEY in .env');
  }
  throw new Error('All AI models are currently unavailable. Please try again in a moment.');
};

module.exports = { callAI };
