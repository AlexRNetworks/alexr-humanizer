const fetch = require('node-fetch');
require('dotenv').config();

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { prompt } = body;

        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: 'API key not found' }) };
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        let text = prompt;

        // Stage 1: Word Scrambling and Rearrangement
        text = text.split('. ').map(sentence => {
            const words = sentence.split(' ');
            for (let i = words.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [words[i], words[j]] = [words[j], words[i]];
            }
            return words.join(' ');
        }).sort(() => Math.random() - 0.5).join('. ');

        // Stage 2: Pronoun and Verb Tense Inconsistencies
        text = text.replace(/(is|are)\b/gi, (match) => match === 'is' ? 'are' : 'is');
        text = text.replace(/(he|she|it)\b/gi, (match) => match === 'he' ? 'they' : match === 'she' ? 'it' : 'he');
        text = text.replace(/(ed|ing)\b/gi, () => Math.random() < 0.5 ? 'ed' : 'ing'); // Random verb tense

        // Stage 3: Redundancy and Repetition (Subtle)
        text = text.replace(/([.?!])\s+(?=[A-Z])/g, '$1 you know ');
        text = text + ' really think about it ';

        // Stage 4: Structural Distortion
        text = text.replace(/[,?]/g, '');
        text = text.replace(/([.?!])\s+(?=[A-Z])/g, '$1 ');

        const requestBody = JSON.stringify({
            contents: [{ parts: [{ text: text }] }],
        });

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });

        if (!response.ok) {
            console.error("Gemini API Error:", response.status, response.statusText);
            return { statusCode: response.status, body: JSON.stringify({ error: `Gemini API Error: ${response.status} ${response.statusText}` }) };
        }

        const data = await response.json();

        let responseText = "";
        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0 && data.candidates[0].content.parts[0].text) {
            responseText = data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected Gemini API response structure:", data);
            return { statusCode: 500, body: JSON.stringify({ error: "Unexpected Gemini API response structure" }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(responseText),
        };
    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 502,
            body: JSON.stringify({ error: "Failed to process request: " + error.message }),
        };
    }
};
