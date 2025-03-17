import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    try {
        // --- 1. API Key and Configuration ---
        const apiKey = process.env.API_KEY;
        const projectId = process.env.GCP_PROJECT_ID;
        const location = process.env.GCP_LOCATION;

        if (!apiKey || !projectId || !location) {
            console.error("Missing API Key, Project ID, or Location. Check Netlify environment variables.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Server configuration error.  Missing API Key, Project ID, or Location." }),
            };
        }

        // --- 2. Request Validation ---
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method Not Allowed" };
        }

        let inputText;
        try {
            const requestBody = JSON.parse(event.body);
            inputText = requestBody.prompt; // Use 'prompt'
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
        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-1.0-pro:streamGenerateContent?alt=sse`;
        const transformationPrompt = `Rephrase the following text to sound like a student in highschool 10th grade would be best. Use simple words and short sentences. Make it sound like a essay they read and wrote about. Use run-on sentences, not too many. Do not summarize or add; make it about the same word count. Do not use fancy or formal language, hyphens, or question marks.

Rephrase:

${inputText}`;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
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
            jsonResponse = JSON.parse(rawResponseText.trim().split('\n').filter(line => line.startsWith('data:')).map(line=>line.substring(5)).join(''));
        } catch (jsonError) {
            console.error("Error parsing Gemini API response as JSON:", jsonError);
            console.error("Raw response that caused the error:", rawResponseText);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Error parsing Gemini API response. See server logs for details." }),
            };
        }

        if (!jsonResponse || !jsonResponse.candidates || !jsonResponse.candidates[0] || !jsonResponse.candidates[0].content || !jsonResponse.candidates[0].content.parts || !jsonResponse.candidates[0].content.parts[0] || !jsonResponse.candidates[0].content.parts[0].text) {
            console.error("Unexpected Gemini API response structure:", jsonResponse);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Unexpected Gemini API response structure. See server logs." }),
            };
        }

        const generatedText = jsonResponse.candidates[0].content.parts[0].text;

        // --- 5. Return Result ---
        return {
            statusCode: 200,
            body: JSON.stringify({ generatedText }),
        };

    } catch (error) {
        // --- 6. General Error Handling ---
        console.error("General Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "An unexpected error occurred: " + error.message }),
        };
    }
};
