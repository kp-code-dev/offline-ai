const config = {
  llmUrl: process.env.LLM_URL || 'http://localhost:11434',
  model: 'gemma4', // Assuming Gemma 4 model name in the local setup
  temperature: 0.7,
  maxTokens: 1024
};

module.exports = config;
