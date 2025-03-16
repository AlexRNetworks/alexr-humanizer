const fetch = require('node-fetch');

require('dotenv').config();



exports.handler = async function (event, context) {

    if (event.httpMethod !== 'POST') {

        return { statusCode: 405, body: 'Method Not Allowed' };

    }



    try {

        const body = JSON.parse(event.body);

        const { prompt } = body;



        const apiKey = process.env.API_KEY; // Access API key from environment variables



        if (!apiKey) {

            return { statusCode: 500, body: JSON.stringify({ error: 'API key not found' }) };

        }



        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;



        const requestBody = JSON.stringify({

            contents: [{ parts: [{ text: prompt }] }],

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



        // Extracting the response text (this might need adjustment based on the exact response structure)

        let responseText = "";

        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0 && data.candidates[0].content.parts[0].text) {

            responseText = data.candidates[0].content.parts[0].text;

        } else {

            console.error("Unexpected Gemini API response structure:", data);

            return { statusCode: 500, body: JSON.stringify({ error: "Unexpected Gemini API response structure" }) };

        }



        // Post-processing for humanization (simplified)

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
