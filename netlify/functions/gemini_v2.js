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
        let tone; // Keep the tone, but we'll use it more subtly.
        try {
            const requestBody = JSON.parse(event.body);
            inputText = requestBody.prompt;
            tone = requestBody.tone;
        } catch (parseError) {
            console.error("Error parsing request body:", parseError);
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body." }) };
        }

        if (!inputText) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing 'prompt'." }) };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`; //Use gemini-1.5-flash

        // --- REVISED PROMPT ---
        const transformationPrompt = `Rewrite the following text as a formal, academic essay suitable for submission to a high school teacher. Maintain the original meaning and approximate word count.  Focus on clarity, coherence, and proper grammar.  Avoid conversational language, slang, and contractions.  Use precise vocabulary appropriate for a 10th-grade level.

Original Text:

${inputText}`;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: transformationPrompt }] }],
            }),
        };

        const response = await fetch(url, requestOptions);

        console.log("Raw API Response Status:", response.status);
        const rawResponseText = await response.text();
        console.log("Raw API Response:", rawResponseText);

        if (!response.ok) {
            console.error("Gemini API Error:", rawResponseText);
            return { statusCode: response.status, body: JSON.stringify({ error: "Gemini API Error: " + rawResponseText }) };
        }

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(rawResponseText);
        } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError, "Raw:", rawResponseText);
            return { statusCode: 500, body: JSON.stringify({ error: "Error parsing Gemini API response." }) };
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
        console.error("General Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "An unexpected error occurred: " + error.message }) };
    }
};
