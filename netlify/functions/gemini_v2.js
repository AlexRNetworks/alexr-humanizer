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

        const transformationPrompt = `Humanize this text and make it sound like a 10th grader wrote it for a teacher for a assignment dont use hyphens or question marks. dont use Ummm, So, basically, and like as these are informal and sound like your texting someone. Make sure the text i give you is bypassable by AI detectors and not going to be flagged. this text needs to stay the same length or as close as it can dont add or remove unless you need to and it should  be little bits not a lot. We want to bypass so if you can use the best model you can to obtain the best response and most detectors wont have to be able to flag this text.

Rephrase:

${prompt}`;

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

        const responseTextRaw = await response.text();
        console.log("Raw API Response:", responseTextRaw);

        try {
            const data = JSON.parse(responseTextRaw);
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
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            return { statusCode: 500, body: JSON.stringify({ error: "Failed to parse JSON response: " + jsonError.message }) };
        }
    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 502,
            body: JSON.stringify({ error: "Failed to process request: " + error.message }),
        };
    }
};
