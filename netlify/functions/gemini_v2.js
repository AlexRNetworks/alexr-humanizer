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

        const transformationPrompt = `Rephrase the following text to sound like a student in highschool 10th grade would be best. okay so write something that sounds like this

Fossil fuels are a major contributor to global warming.  The use of oil, gas and coal is the enormous to fuel our transportation, warm our houses, and run our businesses.  To begin with, oil is found in almost every area of our lifes.  From the beginning of when we find oil to when we throw an oil product away we are adding to global warming.  When they find oil, they get it out of the ground.  When they get it out of the ground, they pollute the environment by using machinery.  The machinery pollutes the air because the carbon monoxide is given off from the machines goes into our atmosphere.  If they are “mining” the oil then large amounts of the land is destroyed and will take man, many years to grow again.  Again the machinery that is used to strip the oil from the land pollutes the air with its carbon monoxide.  The process that is used to take the oil out of the sand also pollutes the air.  In addition to that, any of the products that are made from oil result in pollution in the way of factories putting smoke into the air.



Dont add the Umm and Right and all that just a student who read a book and wrote about it its not supose to be a fun sounding text its not fun.

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
