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

        const requestBody = JSON.stringify({
            contents: [{ parts: [{ text: `"Rephrase the following text to sound like a student trying to explain a concept. You're not very confident in your understanding, so you're just writing down what you remember. Make it sound like you're thinking out loud, like you're trying to figure it out as you go. Use simple words and short sentences. Repeat phrases. Make it sound unorganized. Use some run-on sentences and don't worry about commas. Make it sound like you're talking, not writing. Here are some examples of the desired style:

Example 1: 'Recycling is a good thing for our world. The throwing away of bottles cans and paper is the enormous to make our land dirty and bad. To begin with bottles is found in almost every area of our homes. From the start of when we drink from a bottle to when we throw it away we are adding to trash.'

Example 2: 'Fast food is a big problem for peoples health. The eating of hamburgers fries and soda is the enormous to make kids fat and sick. To begin with hamburgers is found in almost every area of our eating.'

Now rephrase the following text:

${prompt}"` }] }],
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

        responseText = randomizeText(responseText);

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

function randomizeText(text) {
    let sentences = text.split(".");
    sentences = sentences.filter(sentence => sentence.trim() !== "");

    sentences = sentences.map(sentence => {
        let words = sentence.trim().split(" ");
        if (Math.random() < 0.1) {
            let randomIndex = Math.floor(Math.random() * words.length);
            if (words[randomIndex]) {
                words.splice(randomIndex, 0, words[randomIndex]);
            }
        }
        return words.join(" ");
    });

    sentences = sentences.map(sentence => {
        if (Math.random() < 0.1) {
            sentence = sentence.replace(/is/g, "are").replace(/are/g, "is");
        }
        if (Math.random() < 0.05) {
            sentence = sentence.replace(/he/g, "they").replace(/she/g, "it");
        }
        return sentence;
    });

    return sentences.join(". ");
}
