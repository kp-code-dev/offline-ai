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

    // 1. Determine if we are using Groq (Cloud) or Ollama (Local)
    const useGroq = !!process.env.GROQ_API_KEY;
    const fetch = (await import('node-fetch')).default;
    
    let url, headers, body;

    if (useGroq) {
      url = 'https://api.groq.com/openai/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      };
      body = JSON.stringify({
        model: 'gemma2-9b-it',
        messages: [{ role: 'user', content: prompt }],
        stream: true
      });
    } else {
      url = process.env.LLM_URL || 'http://127.0.0.1:11434/api/generate';
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({ model: 'gemma', prompt: prompt });
    }

    const response = await fetch(url, { method: 'POST', headers, body });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    let fullAiResponse = '';

    response.body.on('data', (chunk) => {
      try {
        const textChunk = chunk.toString();
        
        if (useGroq) {
          // Parse Groq/OpenAI SSE format
          const lines = textChunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '');
              if (dataStr === '[DONE]') continue;
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                res.write(content);
                fullAiResponse += content;
              }
            }
          }
        } else {
          // Parse Ollama raw JSON format
          const jsonChunks = textChunk.split('\n').filter(Boolean);
          for (const jsonStr of jsonChunks) {
            const parsed = JSON.parse(jsonStr);
            if (parsed.response) {
              res.write(parsed.response);
              fullAiResponse += parsed.response;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing AI chunk:", e);
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
