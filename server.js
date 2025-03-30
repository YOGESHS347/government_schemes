require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Initialize the GoogleGenAI client with your API key from the .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Simple GET endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the Government Schemes API!');
});

// POST endpoint to receive user data and get recommendations from Gemini
app.post('/get-schemes', async (req, res) => {
  try {
    const userData = req.body; // User data received from the frontend

    // Construct a prompt based on user data
    const prompt = `Based on the following user details, recommend appropriate government schemes in India:\n${JSON.stringify(userData, null, 2)}`;

    // Call the Gemini API using the GoogleGenAI client
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // Return the recommended schemes (the text from Gemini's response) to the frontend
    res.json({ schemes: response.text });
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    res.status(500).json({ error: 'Error fetching recommendations from Gemini' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
