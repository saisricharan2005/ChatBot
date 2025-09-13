// Import necessary packages
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // This loads the variables from .env into process.env

const app = express();
const port = 3000;

// Middleware setup
app.use(cors()); // Allows requests from your front-end
app.use(express.json()); // Allows the server to understand JSON from the front-end
app.use(express.static('public')); // Serve static files from the 'public' directory

// --- API Endpoint for the Chatbot ---
app.post('/chat', async (req, res) => {
    // Get the conversation history from the front-end request
    const { conversationHistory } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key is not set on the server.' });
    }
    
    if (!conversationHistory) {
        return res.status(400).json({ error: 'Conversation history is required.' });
    }

    try {
        // Use the built-in fetch for Node.js v18+
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: conversationHistory,
            }),
        });
        
        if (!response.ok) {
            // Forward the error from OpenAI's API if something goes wrong
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        // Send the AI's response back to the front-end
        res.json(data);

    } catch (error) {
        console.error('Error in /chat endpoint:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Your chatbot front-end should be accessible there.');
});

