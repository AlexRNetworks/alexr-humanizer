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

        const transformationPrompt = `Transform the text within the <input> tags according to these rules:

1. Remove all commas and question marks.
2. Swap 'is' with 'are' and 'are' with 'is'.
3. Swap pronouns like 'he' with 'they', 'she' with 'it', and 'it' with 'he'.
4. Swap the positions of adjacent words within sentences.
5. Add the phrase 'you know' after each sentence ending.
6. Add the phrase 'like really think about it' to the end of the text.

<input>
${prompt}
</input>

Output:`;

        const requestBody = JSON.stringify({
            contents: [{ parts: [{ text: transformationPrompt }] }],
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
