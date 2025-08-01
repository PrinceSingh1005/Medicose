// backend/controllers/aiController.js
const asyncHandler = require('express-async-handler');
const getAiResponse = asyncHandler(async (req, res) => {
    const { prompt, chatHistory = [] } = req.body;

    if (!prompt) {
        res.status(400);
        throw new Error('Prompt is required');
    }

    const formattedChatHistory = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    formattedChatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
        contents: formattedChatHistory,
        // Optional: generationConfig for controlling response (e.g., temperature, max output tokens)
        // generationConfig: {
        //     temperature: 0.7,
        //     maxOutputTokens: 200,
        // },
    };

    const apiKey = process.env.GOOGLE_API_KEY || ""; 
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
