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

        // Check word count (200 word limit)
        const wordCount = inputText.trim().split(/\s+/).length;
        if (wordCount > 200) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: `Text exceeds 200 word limit. Your text has ${wordCount} words.`,
                    wordCount: wordCount,
                    limit: 200
                })
            };
        }

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

        // Apply advanced humanization techniques
        const humanizedText = await advancedHumanize(inputText);

        // Return the humanized text with word count info
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                generatedText: humanizedText,
                originalWordCount: wordCount,
                humanizedWordCount: humanizedText.trim().split(/\s+/).length,
                limit: 200
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

// Advanced humanization using premium techniques
async function advancedHumanize(text) {
    // Step 1: Break AI patterns
    text = breakAIPatterns(text);
    
    // Step 2: Add human imperfections
    text = addHumanImperfections(text);
    
    // Step 3: Implement burstiness (varying sentence lengths)
    text = implementBurstiness(text);
    
    // Step 4: Add personal voice
    text = addPersonalVoice(text);
    
    // Step 5: Natural transitions
    text = naturalizeTransitions(text);
    
    // Step 6: Contextual awareness
    text = addContextualElements(text);
    
    // Step 7: Emotional coloring
    text = addEmotionalTone(text);
    
    // Step 8: Fix over-corrections
    text = balanceHumanization(text);
    
    return text;
}

// Break common AI writing patterns
function breakAIPatterns(text) {
    // Remove AI's favorite phrases
    const aiPhrases = {
        'It is important to note that': '',
        'It should be noted that': '',
        'It is worth mentioning that': '',
        'Furthermore,': '',
        'Moreover,': '',
        'Additionally,': 'Plus,',
        'In conclusion,': 'So,',
        'In summary,': 'Basically,',
        'It is evident that': '',
        'Research indicates that': 'Studies show',
        'It is crucial to': 'You need to',
        'One must consider': 'Think about',
        'This demonstrates': 'This shows',
        'Subsequently': 'Then',
        'Consequently': 'So',
        'Nevertheless': 'Still',
        'Nonetheless': 'But',
        'In order to': 'To',
        'Due to the fact that': 'Because',
        'In the event that': 'If',
        'Prior to': 'Before',
        'Subsequent to': 'After',
        'Utilize': 'Use',
        'Implement': 'Use',
        'Facilitate': 'Help',
        'Optimize': 'Improve',
        'Leverage': 'Use',
        'Endeavor': 'Try',
        'Commence': 'Start',
        'Terminate': 'End',
        'Demonstrates': 'Shows',
        'Indicates': 'Shows',
        'Signifies': 'Means',
        'Exemplifies': 'Shows',
        'Underscores': 'Shows',
        'Highlights': 'Shows',
    };
    
    let result = text;
    for (const [ai, human] of Object.entries(aiPhrases)) {
        const regex = new RegExp(ai, 'gi');
        result = result.replace(regex, human);
    }
    
    // Remove repetitive structure (AI loves parallel construction)
    result = result.replace(/(\w+ing\s+\w+,\s+\w+ing\s+\w+,\s+and\s+\w+ing\s+\w+)/gi, (match) => {
        const parts = match.split(/,\s+(?:and\s+)?/);
        return parts[0] + '. Also, ' + parts[1].toLowerCase();
    });
    
    return result;
}

// Add subtle human imperfections
function addHumanImperfections(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    return sentences.map((sentence, index) => {
        let s = sentence.trim();
        
        // Occasionally start sentences with conjunctions (humans do this)
        if (index > 0 && Math.random() < 0.25) {
            const starters = ['And', 'But', 'So', 'Or', 'Yet'];
            if (!s.match(/^(And|But|So|Or|Yet|Because)/i)) {
                s = starters[Math.floor(Math.random() * starters.length)] + ' ' + 
                    s.charAt(0).toLowerCase() + s.slice(1);
            }
        }
        
        // Add filler words occasionally (but not too many)
        if (Math.random() < 0.15) {
            const fillers = ['actually', 'basically', 'honestly', 'really', 'just'];
            const filler = fillers[Math.floor(Math.random() * fillers.length)];
            s = s.replace(/^(\w+)/, `$1 ${filler}`);
        }
        
        // Occasionally use dashes for emphasis
        if (Math.random() < 0.1 && s.includes(',')) {
            s = s.replace(/,([^,]+)$/, ' —$1');
        }
        
        return s;
    }).join(' ');
}

// Implement burstiness (varying sentence lengths like humans)
function implementBurstiness(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const processed = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i].trim();
        const words = sentence.split(/\s+/);
        
        // If previous sentence was long, make this one shorter
        if (i > 0 && processed[i-1].split(/\s+/).length > 15 && words.length > 10) {
            // Split long sentence into two
            const midPoint = Math.floor(words.length / 2);
            const firstHalf = words.slice(0, midPoint).join(' ') + '.';
            const secondHalf = words.slice(midPoint).join(' ');
            processed.push(firstHalf);
            if (secondHalf) processed.push(secondHalf);
        } else if (words.length < 5 && i < sentences.length - 1) {
            // Merge very short sentences occasionally
            processed.push(sentence.replace(/\.$/, ', ') + sentences[i + 1].toLowerCase());
            i++; // Skip next sentence since we merged it
        } else {
            processed.push(sentence);
        }
    }
    
    return processed.join(' ');
}

// Add personal voice and conversational elements
function addPersonalVoice(text) {
    // Add contractions
    const contractions = {
        'it is': "it's",
        'that is': "that's",
        'what is': "what's",
        'there is': "there's",
        'here is': "here's",
        'who is': "who's",
        'he is': "he's",
        'she is': "she's",
        'do not': "don't",
        'does not': "doesn't",
        'did not': "didn't",
        'cannot': "can't",
        'could not': "couldn't",
        'would not': "wouldn't",
        'should not': "shouldn't",
        'will not': "won't",
        'have not': "haven't",
        'has not': "hasn't",
        'had not': "hadn't",
        'are not': "aren't",
        'is not': "isn't",
        'was not': "wasn't",
        'were not': "weren't",
        'I am': "I'm",
        'you are': "you're",
        'we are': "we're",
        'they are': "they're",
        'I have': "I've",
        'you have': "you've",
        'we have': "we've",
        'they have': "they've",
        'I will': "I'll",
        'you will': "you'll",
        'we will': "we'll",
        'they will': "they'll",
        'I would': "I'd",
        'you would': "you'd",
        'we would': "we'd",
        'they would': "they'd",
    };
    
    let result = text;
    for (const [formal, informal] of Object.entries(contractions)) {
        const regex = new RegExp('\\b' + formal + '\\b', 'gi');
        result = result.replace(regex, informal);
    }
    
    // Add personal pronouns occasionally
    result = result.replace(/One can/gi, 'You can');
    result = result.replace(/One should/gi, 'You should');
    result = result.replace(/One might/gi, 'You might');
    
    return result;
}

// Natural transition words (less formal)
function naturalizeTransitions(text) {
    const transitions = {
        'However,': 'But',
        'Therefore,': 'So',
        'Thus,': 'So',
        'Hence,': 'So',
        'Accordingly,': 'So',
        'In addition,': 'Also,',
        'Furthermore,': 'Plus,',
        'Moreover,': 'And',
        'Conversely,': 'On the flip side,',
        'Similarly,': 'Likewise,',
        'Specifically,': 'To be exact,',
        'Particularly,': 'Especially',
        'Notably,': '',
        'Importantly,': '',
        'Significantly,': '',
        'Interestingly,': '',
        'Surprisingly,': '',
        'Remarkably,': '',
    };
    
    let result = text;
    for (const [formal, casual] of Object.entries(transitions)) {
        result = result.replace(new RegExp(formal + ' ', 'gi'), casual + ' ');
    }
    
    return result;
}

// Add contextual elements that humans naturally include
function addContextualElements(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    return sentences.map((sentence, index) => {
        let s = sentence.trim();
        
        // Add slight redundancy (humans repeat for emphasis)
        if (Math.random() < 0.1) {
            s = s.replace(/important/gi, 'really important');
            s = s.replace(/significant/gi, 'pretty significant');
            s = s.replace(/effective/gi, 'quite effective');
        }
        
        // Add casual qualifiers
        if (Math.random() < 0.15) {
            s = s.replace(/(\bis\b|\bare\b|\bwas\b|\bwere\b)/i, '$1 kind of');
            s = s.replace(/kind of kind of/gi, 'kind of'); // Prevent doubles
        }
        
        // Use more colloquial expressions
        s = s.replace(/a large number of/gi, 'a lot of');
        s = s.replace(/a small number of/gi, 'a few');
        s = s.replace(/in the near future/gi, 'soon');
        s = s.replace(/at the present time/gi, 'right now');
        s = s.replace(/at this point in time/gi, 'now');
        
        return s;
    }).join(' ');
}

// Add subtle emotional coloring
function addEmotionalTone(text) {
    // Add emphasis words that humans use
    const emphasisWords = {
        'very ': ['really ', 'quite ', 'pretty ', 'super '],
        'extremely ': ['really ', 'incredibly ', 'super ', 'totally '],
        'highly ': ['very ', 'really ', 'quite '],
    };
    
    let result = text;
    for (const [original, replacements] of Object.entries(emphasisWords)) {
        const regex = new RegExp(original, 'gi');
        result = result.replace(regex, () => {
            return replacements[Math.floor(Math.random() * replacements.length)];
        });
    }
    
    // Add thinking words (shows human thought process)
    if (Math.random() < 0.2) {
        const thinkingPhrases = [
            'I think ', 'I believe ', 'Seems like ', 'Looks like ', 
            'Probably ', 'Maybe ', 'Perhaps '
        ];
        const phrase = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)];
        const sentences = result.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) {
            const randomIndex = Math.floor(Math.random() * sentences.length);
            sentences[randomIndex] = phrase + sentences[randomIndex].charAt(0).toLowerCase() + 
                                    sentences[randomIndex].slice(1);
            result = sentences.join(' ');
        }
    }
    
    return result;
}

// Balance the humanization to avoid over-correction
function balanceHumanization(text) {
    // Fix any double spaces
    text = text.replace(/\s+/g, ' ');
    
    // Fix sentence case after periods
    text = text.replace(/\.\s+([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
    
    // Ensure proper capitalization at start
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Remove empty sentences
    text = text.replace(/\.\s*\./g, '.');
    
    // Fix any lingering formal language
    text = text.replace(/\b(shall|whom|whilst|albeit|henceforth|thereof|wherein|whereby)\b/gi, 
        (match) => {
            const replacements = {
                'shall': 'will',
                'whom': 'who',
                'whilst': 'while',
                'albeit': 'although',
                'henceforth': 'from now on',
                'thereof': 'of it',
                'wherein': 'where',
                'whereby': 'by which'
            };
            return replacements[match.toLowerCase()] || match;
        });
    
    return text.trim();
}
