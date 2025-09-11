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

        if (inputText.length > 10000) {
            return { statusCode: 400, body: JSON.stringify({ error: "Text is too long. Maximum 10,000 characters allowed." }) };
        }

        console.log("Submitting to NoteGPT AI Humanizer...");
        console.log("Text length:", inputText.length, "words:", wordCount);

        const humanizeUrl = 'https://notegpt.io/ai-humanizer';

        // Step 1: Get the main page to understand the form structure
        console.log("Getting main page for form analysis...");
        const pageResponse = await fetch(humanizeUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        if (!pageResponse.ok) {
            console.error("Error getting main page:", pageResponse.status);
            return { statusCode: 500, body: JSON.stringify({ error: "Could not access NoteGPT AI Humanizer" }) };
        }

        const pageHtml = await pageResponse.text();
        console.log("Got main page, analyzing form structure...");

        // Look for API endpoints or form action URLs in the HTML
        let apiEndpoint = '';
        const apiPatterns = [
            /action="([^"]*api[^"]*)"/i,
            /fetch\(['"]([^'"]*api[^'"]*)['"]/i,
            /xhr\.open\(['"]POST['"],\s*['"]([^'"]*)['"]/i,
            /"apiUrl":\s*['"]([^'"]*)['"]/i,
            /const\s+API_URL\s*=\s*['"]([^'"]*)['"]/i
        ];

        for (const pattern of apiPatterns) {
            const match = pageHtml.match(pattern);
            if (match && match[1]) {
                apiEndpoint = match[1];
                if (apiEndpoint.startsWith('/')) {
                    apiEndpoint = 'https://notegpt.io' + apiEndpoint;
                }
                console.log("Found potential API endpoint:", apiEndpoint);
                break;
            }
        }

        // If no API endpoint found, try common endpoints
        if (!apiEndpoint) {
            const commonEndpoints = [
                'https://notegpt.io/api/ai-humanizer',
                'https://notegpt.io/api/humanize',
                'https://api.notegpt.io/ai-humanizer',
                'https://api.notegpt.io/humanize'
            ];
            
            for (const endpoint of commonEndpoints) {
                console.log("Trying endpoint:", endpoint);
                
                try {
                    const testResponse = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': humanizeUrl,
                            'Origin': 'https://notegpt.io'
                        },
                        body: JSON.stringify({
                            text: inputText.substring(0, 100) + "..." // Test with short text first
                        })
                    });
                    
                    console.log(`Test response from ${endpoint}:`, testResponse.status);
                    
                    if (testResponse.status !== 404 && testResponse.status !== 405) {
                        apiEndpoint = endpoint;
                        console.log("Found working endpoint:", apiEndpoint);
                        break;
                    }
                } catch (error) {
                    console.log(`Error testing ${endpoint}:`, error.message);
                    continue;
                }
            }
        }

        if (!apiEndpoint) {
            console.log("No API endpoint found, trying form submission");
            apiEndpoint = humanizeUrl; // Fall back to form submission
        }

        // Step 2: Submit the actual text for humanization
        console.log("Submitting text to:", apiEndpoint);
        
        const submitOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': humanizeUrl,
                'Origin': 'https://notegpt.io',
                'DNT': '1',
                'Connection': 'keep-alive'
            },
            body: JSON.stringify({
                text: inputText,
                content: inputText,
                input: inputText
            })
        };

        const submitResponse = await fetch(apiEndpoint, submitOptions);
        console.log("Submit Response Status:", submitResponse.status);

        if (!submitResponse.ok) {
            console.error("Error submitting to NoteGPT:", submitResponse.status);
            
            // Try alternative request formats
            console.log("Trying form-encoded submission...");
            const formData = new URLSearchParams();
            formData.append('text', inputText);
            
            const altOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': humanizeUrl,
                    'Origin': 'https://notegpt.io'
                },
                body: formData.toString()
            };

            const altResponse = await fetch(humanizeUrl, altOptions);
            console.log("Alternative Response Status:", altResponse.status);
            
            if (!altResponse.ok) {
                return { 
                    statusCode: 500, 
                    body: JSON.stringify({ 
                        error: "Could not submit to NoteGPT AI Humanizer. The service might be temporarily unavailable." 
                    }) 
                };
            }
            
            // Use alternative response
            submitResponse = altResponse;
        }

        const responseText = await submitResponse.text();
        console.log("Got response, extracting humanized text...");
        console.log("Response length:", responseText.length);

        let humanizedText = '';

        // Try to parse as JSON first
        try {
            const jsonResponse = JSON.parse(responseText);
            console.log("Got JSON response");
            
            // Look for common result fields
            const resultFields = ['result', 'humanized_text', 'output', 'data', 'content', 'text'];
            for (const field of resultFields) {
                if (jsonResponse[field] && typeof jsonResponse[field] === 'string') {
                    humanizedText = jsonResponse[field].trim();
                    console.log(`Found result in field: ${field}`);
                    break;
                }
            }
            
            // If result is nested in data object
            if (!humanizedText && jsonResponse.data) {
                for (const field of resultFields) {
                    if (jsonResponse.data[field] && typeof jsonResponse.data[field] === 'string') {
                        humanizedText = jsonResponse.data[field].trim();
                        console.log(`Found result in data.${field}`);
                        break;
                    }
                }
            }
            
        } catch (jsonError) {
            console.log("Not a JSON response, trying HTML extraction");
            
            // Clean the HTML and extract meaningful text
            let cleanText = responseText
                .replace(/<script[^>]*>.*?<\/script>/gis, '')
                .replace(/<style[^>]*>.*?<\/style>/gis, '')
                .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
                .replace(/<header[^>]*>.*?<\/header>/gis, '')
                .replace(/<footer[^>]*>.*?<\/footer>/gis, '');
            
            // Look for textareas or divs that might contain the result
            const resultPatterns = [
                /<textarea[^>]*(?:id|class)="[^"]*(?:output|result)[^"]*"[^>]*>(.*?)<\/textarea>/gis,
                /<div[^>]*(?:id|class)="[^"]*(?:output|result)[^"]*"[^>]*>(.*?)<\/div>/gis,
                /<pre[^>]*(?:id|class)="[^"]*(?:output|result)[^"]*"[^>]*>(.*?)<\/pre>/gis
            ];
            
            for (const pattern of resultPatterns) {
                const matches = [...cleanText.matchAll(pattern)];
                for (const match of matches) {
                    if (match[1]) {
                        let candidateText = match[1]
                            .replace(/<[^>]*>/g, '')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'")
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        if (candidateText.length > 50 && 
                            candidateText !== inputText &&
                            !candidateText.includes('AI Humanizer') &&
                            !candidateText.includes('Try it for free')) {
                            
                            humanizedText = candidateText;
                            console.log("Found result in HTML pattern");
                            break;
                        }
                    }
                }
                if (humanizedText) break;
            }
        }

        if (!humanizedText || humanizedText.length < 20) {
            console.error("Could not extract humanized text from response");
            console.log("Response preview:", responseText.substring(0, 500));
            
            return { 
                statusCode: 500, 
                body: JSON.stringify({ 
                    error: "Could not extract humanized text. The service might be temporarily unavailable or require JavaScript." 
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
