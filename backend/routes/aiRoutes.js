// backend/routes/aiRoutes.js
const express = require('express');
const { getAiResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware'); // Optional: protect AI endpoint
const router = express.Router();

// You might want to protect this endpoint, or allow it for public access
// For a general chatbot, public access might be desired.
// For appointment booking, you'd likely want it protected.
router.post('/chat', getAiResponse); // No protection for now for easy testing

module.exports = router;
