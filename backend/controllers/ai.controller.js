const config = require('../config/gemma.config');
const dbManager = require('../database');

const generateText = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Save User message to SQLite
    dbManager.insertMessage.run('user', prompt);

    // Call Ollama natively without Python
    const fetch = (await import('node-fetch')).default;
    const ollamaUrl = 'http://127.0.0.1:11434/api/generate';

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gemma', prompt: prompt })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    let fullAiResponse = '';

    response.body.on('data', (chunk) => {
      try {
        const jsonChunks = chunk.toString().split('\n').filter(Boolean);
        for (const jsonStr of jsonChunks) {
          const parsed = JSON.parse(jsonStr);
          if (parsed.response) {
            res.write(parsed.response);
            fullAiResponse += parsed.response;
          }
        }
      } catch (e) {
        console.error("Error parsing Ollama chunk:", e);
      }
    });

    response.body.on('end', () => {
      if (fullAiResponse.trim()) {
        dbManager.insertMessage.run('ai', fullAiResponse);
      }
      res.end();
    });

    response.body.on('error', (err) => {
      console.error("Stream proxy error:", err);
      res.end();
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateText
};
