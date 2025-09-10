import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("Missing API Key.");
            return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error. Missing API Key." }) };
        }

        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method Not Allowed" };
        }

        let inputText;
        try {
            const requestBody = JSON.parse(event.body);
            inputText = requestBody.prompt;
        } catch (parseError) {
            console.error("Error parsing request body:", parseError);
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body." }) };
        }

        if (!inputText) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing 'prompt'." }) };
        }

        // Updated URL for Humanizeproai API
        const url = 'https://www.humanizeai.pro/the-api';

        // Updated request structure for Humanizeproai
        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Updated auth header
            },
            body: JSON.stringify({
                text: inputText,
                mode: 'advanced', // or 'basic' depending on your needs
                // You may need to adjust these parameters based on Humanizeproai's documentation
            }),
        };

        const response = await fetch(url, requestOptions);
        console.log("Raw API Response Status:", response.status);
        const rawResponseText = await response.text();
        console.log("Raw API Response:", rawResponseText);

        if (!response.ok) {
            console.error("Humanizeproai API Error:", rawResponseText);
            return { statusCode: response.status, body: JSON.stringify({ error: "Humanizeproai API Error: " + rawResponseText }) };
        }

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(rawResponseText);
        } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError, "Raw:", rawResponseText);
            return { statusCode: 500, body: JSON.stringify({ error: "Error parsing Humanizeproai API response." }) };
        }

        // Updated response parsing for Humanizeproai
        // Note: You'll need to verify the exact response structure from Humanizeproai's documentation
        if (jsonResponse && jsonResponse.humanized_text) {
            const generatedText = jsonResponse.humanized_text;
            return {
                statusCode: 200,
                body: JSON.stringify({ generatedText }),
            };
        } else if (jsonResponse && jsonResponse.result) {
            // Alternative response structure - adjust based on actual API response
            const generatedText = jsonResponse.result;
            return {
                statusCode: 200,
                body: JSON.stringify({ generatedText }),
            };
        } else {
            console.error("Unexpected Humanizeproai API response structure:", jsonResponse);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Unexpected Humanizeproai API response structure. See server logs." }),
            };
        }

    } catch (error) {
        console.error("General Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "An unexpected error occurred: " + error.message }) };
    }
};
