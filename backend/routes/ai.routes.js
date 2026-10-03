const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const dbManager = require('../database');

// Health check endpoint (for Render/Cloud deployments)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running!' });
});

// Stream generation
router.post('/generate', aiController.generateText);

// Chat history endpoints
router.get('/history', (req, res) => {
  try {
    const history = dbManager.getMessages.all();
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/history', (req, res) => {
  try {
    dbManager.clearMessages.run();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
