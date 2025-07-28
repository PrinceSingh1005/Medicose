// backend/controllers/aiController.js
const asyncHandler = require('express-async-handler');

// You will need to get a Google Cloud API Key for the Gemini API.
// Store it securely in your .env file.
// Example: GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_HERE

// @desc    Get AI response from Gemini API
// @route   POST /api/ai/chat
// @access  Public (or Private if desired)
const getAiResponse = asyncHandler(async (req, res) => {
    const { prompt, chatHistory = [] } = req.body; // chatHistory for conversational context

    if (!prompt) {
        res.status(400);
        throw new Error('Prompt is required');
    }

    // Construct the chat history for the Gemini API
    // Gemini API expects history in a specific format: [{ role: "user", parts: [{ text: "..." }] }, { role: "model", parts: [{ text: "..." }] }]
    const formattedChatHistory = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    // Add the current prompt from the user
    formattedChatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
        contents: formattedChatHistory,
        // Optional: generationConfig for controlling response (e.g., temperature, max output tokens)
        // generationConfig: {
        //     temperature: 0.7,
        //     maxOutputTokens: 200,
        // },
    };

    const apiKey = process.env.GOOGLE_API_KEY || ""; // Get API key from environment variables
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error Response:', errorText);
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const aiText = result.candidates[0].content.parts[0].text;
            res.json({ response: aiText });
        } else {
            console.warn('Gemini API response structure unexpected:', result);
            res.status(500).json({ message: 'Failed to get a valid response from AI.' });
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ message: `Error processing AI request: ${error.message}` });
    }
});

module.exports = { getAiResponse };
