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

        // Check if text has at least 30 words (API requirement)
        const wordCount = inputText.trim().split(/\s+/).length;
        if (wordCount < 30) {
            return { statusCode: 400, body: JSON.stringify({ error: "Text must contain at least 30 words for humanization." }) };
        }

        const apiUrl = 'https://api.humanizeai.pro/v1/';

        // Step 1: Submit the humanization task
        console.log("Submitting humanization task...");
        console.log("Using API key:", apiKey.substring(0, 10) + "...");
        console.log("API URL:", apiUrl);
        
        const submitOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'User-Agent': 'Netlify-Function/1.0'
            },
            body: JSON.stringify({
                text: inputText
            })
        };
        
        console.log("Request headers:", JSON.stringify(submitOptions.headers, null, 2));
        console.log("Request body:", submitOptions.body);

        const submitResponse = await fetch(apiUrl, submitOptions);
        const submitResponseText = await submitResponse.text();
        console.log("Submit Response Status:", submitResponse.status);
        console.log("Submit Response:", submitResponseText);

        if (!submitResponse.ok) {
            console.error("Humanizeproai Submit Error:", submitResponseText);
            if (submitResponse.status === 403) {
                return { statusCode: 403, body: JSON.stringify({ error: "Invalid API key or access denied. Please check your API key." }) };
            }
            return { statusCode: submitResponse.status, body: JSON.stringify({ error: "Humanizeproai Submit Error: " + submitResponseText }) };
        }

        let submitResult;
        try {
            submitResult = JSON.parse(submitResponseText);
        } catch (jsonError) {
            console.error("Error parsing submit response:", jsonError);
            return { statusCode: 500, body: JSON.stringify({ error: "Error parsing submit response." }) };
        }

        // Extract task ID from submit response
        const taskId = submitResult.id || submitResult.task_id || submitResult.taskId;
        if (!taskId) {
            console.error("No task ID in submit response:", submitResult);
            return { statusCode: 500, body: JSON.stringify({ error: "No task ID received from API." }) };
        }

        console.log("Task submitted with ID:", taskId);

        // Step 2: Poll for results
        const maxAttempts = 30; // Maximum polling attempts
        const pollInterval = 2000; // 2 seconds between polls

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`Polling attempt ${attempt}/${maxAttempts}...`);
            
            // Wait before polling (except first attempt)
            if (attempt > 1) {
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }

            const pollOptions = {
                method: 'GET',
                headers: { 
                    'x-api-key': apiKey
                }
            };

            const pollResponse = await fetch(`${workingEndpoint}?id=${taskId}`, pollOptions);
            const pollResponseText = await pollResponse.text();
            console.log(`Poll Response Status (attempt ${attempt}):`, pollResponse.status);
            console.log(`Poll Response (attempt ${attempt}):`, pollResponseText);

            if (!pollResponse.ok) {
                console.error("Humanizeproai Poll Error:", pollResponseText);
                return { statusCode: pollResponse.status, body: JSON.stringify({ error: "Humanizeproai Poll Error: " + pollResponseText }) };
            }

            let pollResult;
            try {
                pollResult = JSON.parse(pollResponseText);
            } catch (jsonError) {
                console.error("Error parsing poll response:", jsonError);
                return { statusCode: 500, body: JSON.stringify({ error: "Error parsing poll response." }) };
            }

            // Check if task is complete
            if (pollResult.status === 'success' || pollResult.humanized_text || pollResult.result) {
                const generatedText = pollResult.humanized_text || pollResult.result || pollResult.output;
                if (generatedText) {
                    console.log("Task completed successfully!");
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ generatedText }),
                    };
                }
            }

            // Check if task failed
            if (pollResult.status === 'failure' || pollResult.status === 'failed' || pollResult.error) {
                const errorMsg = pollResult.error || pollResult.message || "Task failed";
                console.error("Task failed:", errorMsg);
                return { statusCode: 500, body: JSON.stringify({ error: "Humanization failed: " + errorMsg }) };
            }

            // Task is still processing, continue polling
            console.log("Task still processing...");
        }

        // If we reach here, polling timed out
        console.error("Polling timed out after", maxAttempts, "attempts");
        return { statusCode: 408, body: JSON.stringify({ error: "Task processing timed out. Please try again." }) };

    } catch (error) {
        console.error("General Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "An unexpected error occurred: " + error.message }) };
    }
};
