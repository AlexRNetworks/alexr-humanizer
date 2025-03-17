import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    try {
        // --- 1. API Key ---
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            console.error("Missing API Key. Check Netlify environment variables.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Server configuration error. Missing API Key." }),
            };
        }

        // --- 2. Request Validation ---
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method Not Allowed" };
        }

        let inputText;
        let tone;
        try {
            const requestBody = JSON.parse(event.body);
            inputText = requestBody.prompt;
            tone = requestBody.tone;
        } catch (parseError) {
            console.error("Error parsing request body:", parseError);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid request body.  Must be valid JSON with a 'prompt' field." }),
            };
        }

        if (!inputText) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing 'prompt' in request body." }),
            };
        }

        // --- 3. Gemini API Interaction ---
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`; // Using gemini-2.0-flash
        const transformationPrompt = `Rephrase the following text to sound like a ${tone} would be best. Use simple words and short sentences. Make it sound like a essay they read and wrote about. Use run-on sentences, not too many. Do not summarize or add; make it about the same word count. Do not use fancy or formal language, hyphens, or question marks.

Rephrase:

${inputText}`;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // No 'Authorization' header needed
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: transformationPrompt }],
                }],
            }),
        };

        const response = await fetch(url, requestOptions);

        // --- 4. API Response Handling ---
        console.log("Raw API Response Status:", response.status);
        const rawResponseText = await response.text();
        console.log("Raw API Response:", rawResponseText);

        if (!response.ok) {
            console.error("Gemini API Error:", rawResponseText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Gemini API Error: " + rawResponseText }),
            };
        }

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(rawResponseText); // Parse directly
        } catch (jsonError) {
            console.error("Error parsing Gemini API response as JSON:", jsonError);
            console.error("Raw response that caused the error:", rawResponseText);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Error parsing Gemini API response. See server logs for details." }),
            };
        }

         if (jsonResponse && jsonResponse.candidates && jsonResponse.candidates.length > 0 && jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts && jsonResponse.candidates[0].content.parts.length > 0)
        {
            const generatedText = jsonResponse.candidates[0].content.parts[0].text;
            return {
            statusCode: 200,
            body: JSON.stringify({ generatedText }), // Correct return value
        };
        }
        else{
            console.error("Unexpected Gemini API response structure:", jsonResponse);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Unexpected Gemini API response structure. See server logs." }),
            };
        }

    } catch (error) {
        // --- 6. General Error Handling ---
        console.error("General Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "An unexpected error occurred: " + error.message }),
        };
    }
};
