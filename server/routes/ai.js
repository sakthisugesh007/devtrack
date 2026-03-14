const express = require('express');
const router = express.Router();
const { getAIInsights, chatWithAI } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Get AI-powered insights based on GitHub data
router.get('/insights', authMiddleware, getAIInsights);

// Chat with AI about productivity
router.post('/chat', authMiddleware, chatWithAI);

module.exports = router;
