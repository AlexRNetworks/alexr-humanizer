import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    try {
        // Only allow POST requests
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: "Method Not Allowed. Use POST." })
            };
        }

        // Parse request body
        let inputText;
        try {
            const requestBody = JSON.parse(event.body);
            inputText = requestBody.prompt;
        } catch (parseError) {
            console.error("Error parsing request body:", parseError);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid request body." })
            };
        }

        if (!inputText) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing 'prompt' in request body." })
            };
        }

        // Check minimum word count
        const wordCount = inputText.trim().split(/\s+/).length;
        if (wordCount < 10) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: "Text must be at least 10 words long.",
                    wordCount: wordCount 
                })
            };
        }

        console.log(`Processing text with ${wordCount} words...`);

        // Simple paraphrasing using multiple techniques
        const humanizedText = await humanizeTextLocally(inputText);

        // Return the humanized text
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                generatedText: humanizedText,
                originalWordCount: wordCount,
                humanizedWordCount: humanizedText.trim().split(/\s+/).length
            })
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

// Local humanization function that doesn't require any API
async function humanizeTextLocally(text) {
    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    const humanizedSentences = sentences.map(sentence => {
        let humanized = sentence.trim();
        
        // Apply various humanization techniques
        humanized = replaceComplexWords(humanized);
        humanized = varyStructure(humanized);
        humanized = addNaturalFlow(humanized);
        humanized = simplifyPhrases(humanized);
        
        return humanized;
    });
    
    return humanizedSentences.join(' ');
}

// Replace overly formal/complex words with simpler alternatives
function replaceComplexWords(text) {
    const replacements = {
        'utilize': 'use',
        'implement': 'put in place',
        'facilitate': 'help',
        'demonstrate': 'show',
        'approximately': 'about',
        'subsequently': 'then',
        'furthermore': 'also',
        'moreover': 'plus',
        'nevertheless': 'but',
        'consequently': 'so',
        'methodology': 'method',
        'paradigm': 'model',
        'optimize': 'improve',
        'prioritize': 'focus on',
        'leverage': 'use',
        'innovative': 'new',
        'comprehensive': 'complete',
        'substantial': 'large',
        'fundamental': 'basic',
        'establish': 'set up',
        'indicates': 'shows',
        'significant': 'important',
        'numerous': 'many',
        'acquire': 'get',
        'endeavor': 'try',
        'commence': 'start',
        'terminate': 'end',
        'sufficient': 'enough',
        'preceding': 'before',
        'following': 'after',
        'regarding': 'about',
        'pertaining to': 'about',
        'in order to': 'to',
        'due to the fact that': 'because',
        'in the event that': 'if',
        'at this point in time': 'now',
        'in the near future': 'soon',
        'has the ability to': 'can',
        'is able to': 'can',
        'in conclusion': 'finally',
        'it is important to note that': '',
        'it should be noted that': '',
        'it is worth mentioning that': '',
    };
    
    let result = text;
    for (const [complex, simple] of Object.entries(replacements)) {
        const regex = new RegExp('\\b' + complex + '\\b', 'gi');
        result = result.replace(regex, simple);
    }
    
    return result;
}

// Vary sentence structure
function varyStructure(text) {
    // Sometimes start with simple transitions
    const transitions = ['Well,', 'Actually,', 'So,', 'Now,', 'See,', 'Look,'];
    
    // 20% chance to add a transition at the beginning
    if (Math.random() < 0.2 && !text.match(/^(Well|Actually|So|Now|See|Look)/i)) {
        const transition = transitions[Math.floor(Math.random() * transitions.length)];
        text = transition + ' ' + text.charAt(0).toLowerCase() + text.slice(1);
    }
    
    // Break up very long sentences with simpler connectors
    if (text.length > 150) {
        text = text.replace(/, which/g, '. This');
        text = text.replace(/, thus/g, '. So');
        text = text.replace(/, therefore/g, '. So');
    }
    
    return text;
}

// Add natural conversational flow
function addNaturalFlow(text) {
    // Replace stiff phrases with conversational ones
    const conversationalReplacements = {
        'It is evident that': 'You can see that',
        'It appears that': 'It looks like',
        'One might argue': 'You could say',
        'It is crucial': 'It\'s really important',
        'Research indicates': 'Studies show',
        'Data suggests': 'The numbers show',
        'It is recommended': 'You should',
        'It is advised': 'You might want to',
        'Individuals': 'People',
        'Obtain': 'Get',
        'Possess': 'Have',
        'Require': 'Need',
    };
    
    let result = text;
    for (const [stiff, natural] of Object.entries(conversationalReplacements)) {
        const regex = new RegExp(stiff, 'gi');
        result = result.replace(regex, natural);
    }
    
    return result;
}

// Simplify overly complex phrases
function simplifyPhrases(text) {
    // Remove unnecessary words
    text = text.replace(/in terms of/gi, 'about');
    text = text.replace(/with respect to/gi, 'about');
    text = text.replace(/in relation to/gi, 'about');
    text = text.replace(/as a result of/gi, 'because of');
    text = text.replace(/for the purpose of/gi, 'to');
    text = text.replace(/in spite of/gi, 'despite');
    text = text.replace(/in addition to/gi, 'besides');
    text = text.replace(/in the process of/gi, 'while');
    text = text.replace(/is going to/gi, 'will');
    text = text.replace(/are going to/gi, 'will');
    
    // Add contractions for more natural flow
    text = text.replace(/\bit is\b/gi, "it's");
    text = text.replace(/\bthat is\b/gi, "that's");
    text = text.replace(/\bdo not\b/gi, "don't");
    text = text.replace(/\bdoes not\b/gi, "doesn't");
    text = text.replace(/\bcannot\b/gi, "can't");
    text = text.replace(/\bwill not\b/gi, "won't");
    text = text.replace(/\bshould not\b/gi, "shouldn't");
    text = text.replace(/\bcould not\b/gi, "couldn't");
    text = text.replace(/\bwould not\b/gi, "wouldn't");
    
    return text;
}
