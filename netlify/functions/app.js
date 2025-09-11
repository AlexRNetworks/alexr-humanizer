import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    try {
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

        // Check if text has reasonable length
        const wordCount = inputText.trim().split(/\s+/).length;
        if (wordCount < 10) {
            return { statusCode: 400, body: JSON.stringify({ error: "Text must contain at least 10 words for humanization." }) };
        }

        console.log("Submitting to HumanizeAI.io...");
        console.log("Text length:", inputText.length, "words:", wordCount);

        const humanizeUrl = 'https://www.humanizeai.io/';

        // Step 1: Get the main page to extract any necessary form data
        console.log("Getting main page for form data...");
        const pageResponse = await fetch(humanizeUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!pageResponse.ok) {
            console.error("Error getting main page:", pageResponse.status);
            return { statusCode: 500, body: JSON.stringify({ error: "Could not access HumanizeAI.io" }) };
        }

        const pageHtml = await pageResponse.text();
        
        // Extract CSRF token or other necessary data if present
        let csrfToken = '';
        const csrfMatch = pageHtml.match(/name="csrf_token".*?value="([^"]+)"/);
        if (csrfMatch) {
            csrfToken = csrfMatch[1];
            console.log("Found CSRF token");
        }

        // Step 2: Submit the text for humanization
        console.log("Submitting text for humanization...");
        
        // Create form data
        const formData = new URLSearchParams();
        formData.append('text', inputText);
        if (csrfToken) {
            formData.append('csrf_token', csrfToken);
        }

        const submitOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': humanizeUrl,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            body: formData.toString()
        };

        const submitResponse = await fetch(humanizeUrl, submitOptions);
        console.log("Submit Response Status:", submitResponse.status);

        if (!submitResponse.ok) {
            console.error("Error submitting to HumanizeAI.io:", submitResponse.status);
            return { statusCode: submitResponse.status, body: JSON.stringify({ error: "Error submitting to HumanizeAI.io" }) };
        }

        const responseHtml = await submitResponse.text();
        console.log("Got response HTML, extracting humanized text...");

        // Step 3: Extract the humanized text from the response
        console.log("Analyzing response HTML structure...");
        
        let humanizedText = '';
        
        // First, try to find JSON response (some sites return JSON)
        try {
            const jsonMatch = responseHtml.match(/\{[^}]*"result"[^}]*\}/);
            if (jsonMatch) {
                const jsonResult = JSON.parse(jsonMatch[0]);
                if (jsonResult.result || jsonResult.humanized_text) {
                    humanizedText = jsonResult.result || jsonResult.humanized_text;
                    console.log("Found result in JSON response");
                }
            }
        } catch (e) {
            console.log("No JSON response found");
        }

        // If no JSON, try HTML patterns for HumanizeAI.io specifically
        if (!humanizedText) {
            const patterns = [
                // Common output patterns for AI humanizers
                /<textarea[^>]*id="[^"]*output[^"]*"[^>]*>(.*?)<\/textarea>/is,
                /<textarea[^>]*class="[^"]*output[^"]*"[^>]*>(.*?)<\/textarea>/is,
                /<div[^>]*id="[^"]*output[^"]*"[^>]*>(.*?)<\/div>/is,
                /<div[^>]*class="[^"]*output[^"]*"[^>]*>(.*?)<\/div>/is,
                /<div[^>]*id="[^"]*result[^"]*"[^>]*>(.*?)<\/div>/is,
                /<div[^>]*class="[^"]*result[^"]*"[^>]*>(.*?)<\/div>/is,
                // Try any textarea after our input
                /<textarea[^>]*>((?:(?!<textarea).)*?)<\/textarea>/is,
                // Try divs with substantial content
                /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is
            ];

            for (let i = 0; i < patterns.length; i++) {
                const pattern = patterns[i];
                const matches = responseHtml.matchAll(new RegExp(pattern.source, pattern.flags));
                
                for (const match of matches) {
                    if (match[1]) {
                        let candidateText = match[1].trim();
                        
                        // Clean up HTML entities and tags
                        candidateText = candidateText
                            .replace(/<[^>]*>/g, '') // Remove HTML tags
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'")
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        // Check if this looks like our humanized result
                        if (candidateText.length > 30 && 
                            candidateText.length > inputText.length * 0.5 && 
                            candidateText !== inputText &&
                            !candidateText.includes('AI Tools') &&
                            !candidateText.includes('Pricing') &&
                            !candidateText.includes('Login')) {
                            
                            humanizedText = candidateText;
                            console.log(`Found humanized text using pattern ${i + 1}`);
                            break;
                        }
                    }
                }
                
                if (humanizedText) break;
            }
        }

        // If still no result, the form might require JavaScript or different approach
        if (!humanizedText) {
            console.log("Could not find humanized text in standard patterns");
            console.log("Response length:", responseHtml.length);
            
            // Log some of the response for debugging (first 1000 chars)
            const debugSnippet = responseHtml
                .replace(/<script[^>]*>.*?<\/script>/gis, '[SCRIPT]')
                .replace(/<style[^>]*>.*?<\/style>/gis, '[STYLE]')
                .substring(0, 1000);
            console.log("Response debug snippet:", debugSnippet);
            
            return { 
                statusCode: 500, 
                body: JSON.stringify({ 
                    error: "The website may require JavaScript or have changed its structure. Please try again or the service might be temporarily unavailable." 
                }) 
            };
        }

        if (!humanizedText || humanizedText.length < 20) {
            console.error("Could not extract humanized text from response");
            console.log("Response HTML length:", responseHtml.length);
            
            // Log a small portion of the response for debugging
            const debugSnippet = responseHtml.substring(0, 500);
            console.log("Response snippet:", debugSnippet);
            
            return { 
                statusCode: 500, 
                body: JSON.stringify({ 
                    error: "Could not extract humanized text. The service might be temporarily unavailable or have changed its format." 
                }) 
            };
        }

        console.log("Successfully humanized text");
        console.log("Original length:", inputText.length, "Humanized length:", humanizedText.length);

        return {
            statusCode: 200,
            body: JSON.stringify({ generatedText: humanizedText }),
        };

    } catch (error) {
        console.error("General Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ 
                error: "An unexpected error occurred: " + error.message 
            }) 
        };
    }
};
