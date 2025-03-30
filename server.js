require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Ensure API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in the .env file');
  process.exit(1);
}

// Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Simple GET endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the Government Schemes API!');
});

// POST endpoint to receive user data and get recommendations from Gemini
app.post('/get-schemes', async (req, res) => {
  try {
    const userData = req.body;
    if (!userData || Object.keys(userData).length === 0) {
      return res.status(400).json({ error: 'Invalid or missing user data' });
    }

    const prompt = `Based on the following user details, recommend appropriate government schemes in India:\n${JSON.stringify(userData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    res.json({ schemes: response.text });
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    res.status(500).json({ error: 'Error fetching recommendations from Gemini' });
  }
});

// Set the PORT and bind to 0.0.0.0 for Render compatibility
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
