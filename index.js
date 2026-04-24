import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// convert import.meta.url --> path file and current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
const AI_MODEL = "gemini-2.5-flash";
const PORT = process.env.PORT;

app.use(cors()); // grant API access from other domain
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve static file from folder named 'public'
app.listen(PORT, () => console.log('Server is running!'));

function extractText(res) { // make sure the response match with different SDK version and multimodal response format
    try {
        const text =
            res?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
            res?.candidates?.[0]?.content?.parts?.[0]?.text ??
            res?.response?.candidates?.[0]?.content?.text;
        return text ?? JSON.stringify(res, null, 2);
    } catch (error) {
        console.error("Error extracting text:", err);
        return JSON.stringify(res, null, 2);
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const messages = req.body?.messages;
        if (!messages) return res.status(400).json({ error: "Missing message in request body." })
        if (!Array.isArray(messages)) throw new Error("messages must be an array.");
        const contents = messages.map(message => ({
            role: message.role,
            parts: [{ text: message.content }]
        }));
        const response = await ai.models.generateContent({
            model: AI_MODEL,
            contents
        });
        res.json({ result: extractText(response) });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})