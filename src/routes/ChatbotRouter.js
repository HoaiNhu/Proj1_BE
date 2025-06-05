const express = require('express');
const chatbotController = require('../controllers/ChatbotController');
const router = express.Router();

// Process user query
router.post('/process-query', chatbotController.processQuery);

// Get article details
router.get("/get-detail-product/:id", chatbotController.getDetailsProduct);

module.exports = router;