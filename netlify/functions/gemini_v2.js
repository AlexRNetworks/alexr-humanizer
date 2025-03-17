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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`; //Use gemini-1.5-flash

        const transformationPrompt = `Rephrase the following text to sound like a high school student's essay, written without careful editing.  The student understands the basic concepts but makes grammatical errors and has an unpolished writing style.

Specifically, incorporate these characteristics:

*   Missing Commas: Omit commas where they would normally be required.
*   Incorrect Verb Tense/Agreement:  Use incorrect verb tenses (e.g., present instead of past) or incorrect subject-verb agreement (e.g., "they was").
*   Run-on Sentences: Combine sentences without proper punctuation or conjunctions.
*   Sentence Fragments: Use incomplete sentences.
*   Awkward Phrasing: Use wording that is grammatically incorrect or stylistically unusual.
*   Unusual Word Order:  Invert the typical order of words within phrases or sentences.
*   Subtle Repetition: Repeat ideas or phrases using slightly different wording, but avoid directly repeating the same words in close proximity.
*   Simple Vocabulary: Use basic, everyday words. Avoid complex or technical terms.
*    Short sentences: Use short sentences.

Do NOT add any extra information. Do NOT summarize.  Maintain the original meaning and approximate length.

Rephrase the following text:

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

        if (jsonResponse && jsonResponse.candidates && jsonResponse.candidates.length > 0 && jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts && jsonResponse.candidates[0].content.parts.length > 0) {
            const generatedText = jsonResponse.candidates[0].content.parts[0].text;
            return {
                statusCode: 200,
                body: JSON.stringify({ generatedText }),
            };
        } else {
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
