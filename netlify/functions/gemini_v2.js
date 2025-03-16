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

        // Stage 1: Input Simplification and Basic Vocabulary
        let text = prompt.replace(/([a-zA-Z]+(?:ly|tion|ment|ness|able|ible|ive|ous|ful)\b)/g, (match) => {
            if (match === 'completely') return 'totally';
            if (match === 'understandable') return 'easy to get';
            return match;
        });
        text = text.replace(/([.?!])\s+(?=[A-Z])/g, '$1\n');
        console.log("Stage 1:", text);

        // Stage 2: Structural Degradation and Grammatical Flaws
        text = text.replace(/[,?]/g, '');
        text = text.replace(/([.?!])\s+(?=[A-Z])/g, '$1 ');
        text = text.replace(/and|but/gi, '');
        text = text.replace(/(is|are)\b/gi, (match) => match === 'is' ? 'are' : 'is');
        text = text.replace(/(he|she|it)\b/gi, (match) => match === 'he' ? 'they' : match === 'she' ? 'it' : 'he');
        text = text.replace(/([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g, '$2 $1');
        text = text.replace(/(\b\w+\b)\s+\1/g, '$1');
        console.log("Stage 2:", text);

        // Stage 3: Output Unorganization
        text = text.replace(/\n+/g, ' ');
        text = text + " " + text.split(" ")[0] + " " + text.split(" ")[1];
        console.log("Stage 3:", text);

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
