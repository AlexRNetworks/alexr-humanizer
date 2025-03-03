const express = require('express');
const { OpenAI } = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

app.post('/humanize', async (req, res) => {
    try {
        const { prompt, tone, context, audience, purpose } = req.body;

        // Construct a detailed system prompt with explicit instructions
        let systemPrompt = `
            Please humanize the following text, strictly adhering to these requirements:

            Tone: ${tone}
            Context: ${context || 'N/A'}
            Audience: ${audience || 'N/A'}
            Purpose: ${purpose || 'N/A'}

            Instructions:

            * Rephrase the text to sound more human-like and natural, as if written by a person.
            * Maintain the original meaning and information; do not add any new content or opinions.
            * Use vocabulary and sentence structures appropriate for the specified tone and audience.
            * Avoid any patterns or phrases that might make the text seem AI-generated.

            Please be very careful to follow these instructions precisely. 
            The goal is to create text that is indistinguishable from human writing.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, // Lower temperature for more focused output
            top_p: 0.7,
            frequency_penalty: 0.6, // Increased penalties to further discourage repetition
            presence_penalty: 0.6 
        });

        res.status(200).json(response.choices[0].message.content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
