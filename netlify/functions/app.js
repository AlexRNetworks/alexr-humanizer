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

        // Apply boring basic student humanization
        const humanizedText = await basicStudentRewrite(inputText);

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

// Basic boring student rewrite
async function basicStudentRewrite(text) {
    // Remove all dashes first
    text = text.replace(/—/g, ' ');
    text = text.replace(/–/g, ' ');
    text = text.replace(/ - /g, ' ');
    text = text.replace(/\s-\s/g, ' ');
    
    // Step 1: Make everything super basic
    text = makeBasicVocabulary(text);
    
    // Step 2: Simple sentence structure
    text = makeSimpleSentences(text);
    
    // Step 3: Remove all fancy punctuation
    text = removeComplexPunctuation(text);
    
    // Step 4: Basic student flow
    text = createBasicFlow(text);
    
    // Step 5: Final cleanup
    text = finalBasicCleanup(text);
    
    return text;
}

// Convert to most basic vocabulary possible
function makeBasicVocabulary(text) {
    // Super basic word replacements
    const basicWords = {
        'utilize': 'use',
        'obtain': 'get',
        'require': 'need',
        'demonstrate': 'show',
        'indicate': 'show',
        'establish': 'make',
        'develop': 'make',
        'examine': 'look at',
        'analyze': 'look at',
        'consider': 'think about',
        'understand': 'get',
        'implement': 'do',
        'achieve': 'get',
        'maintain': 'keep',
        'provide': 'give',
        'facilitate': 'help',
        'enhance': 'make better',
        'improve': 'make better',
        'increase': 'add more',
        'decrease': 'make less',
        'eliminate': 'get rid of',
        'determine': 'find out',
        'identify': 'find',
        'discover': 'find',
        'observe': 'see',
        'perceive': 'see',
        'commence': 'start',
        'initiate': 'start',
        'terminate': 'end',
        'conclude': 'end',
        'approximately': 'about',
        'frequently': 'often',
        'occasionally': 'sometimes',
        'subsequently': 'then',
        'previously': 'before',
        'currently': 'now',
        'ultimately': 'in the end',
        'generally': 'usually',
        'particularly': 'mostly',
        'specifically': 'exactly',
        'essentially': 'basically',
        'primarily': 'mainly',
        'significantly': 'a lot',
        'substantially': 'a lot',
        'furthermore': 'also',
        'moreover': 'also',
        'however': 'but',
        'therefore': 'so',
        'consequently': 'so',
        'individuals': 'people',
        'organization': 'group',
        'institution': 'place',
        'personnel': 'people',
        'components': 'parts',
        'elements': 'parts',
        'aspects': 'parts',
        'factors': 'things',
        'issues': 'problems',
        'challenges': 'problems',
        'opportunities': 'chances',
        'solutions': 'answers',
        'consequences': 'results',
        'implications': 'effects',
        'benefits': 'good things',
        'advantages': 'good things',
        'disadvantages': 'bad things',
        'requirements': 'needs',
        'objectives': 'goals',
        'strategies': 'plans',
        'approaches': 'ways',
        'methods': 'ways',
        'procedures': 'steps',
        'concepts': 'ideas',
        'perspectives': 'views',
        'information': 'info',
        'evidence': 'proof',
        'resources': 'things',
        'materials': 'stuff',
        'technology': 'tech',
        'developments': 'changes',
        'modifications': 'changes',
        'situations': 'times',
        'circumstances': 'times',
        'instances': 'times',
        'numerous': 'many',
        'various': 'different',
        'multiple': 'many',
        'several': 'some',
        'sufficient': 'enough',
        'necessary': 'needed',
        'essential': 'needed',
        'crucial': 'very important',
        'significant': 'important',
        'substantial': 'big',
        'comprehensive': 'complete',
        'extensive': 'big',
        'fundamental': 'basic',
        'primary': 'main',
        'principal': 'main',
        'major': 'big',
        'minor': 'small',
        'adequate': 'enough',
        'appropriate': 'right',
        'relevant': 'related',
        'accurate': 'right',
        'correct': 'right',
        'effective': 'works',
        'efficient': 'works well',
        'successful': 'worked',
        'beneficial': 'helpful',
        'positive': 'good',
        'negative': 'bad',
        'favorable': 'good',
        'optimal': 'best',
        'maximum': 'most',
        'minimum': 'least',
        'typical': 'normal',
        'common': 'normal',
        'standard': 'normal',
        'traditional': 'old',
        'modern': 'new',
        'contemporary': 'current',
        'innovative': 'new',
        'unique': 'special',
        'distinctive': 'different',
        'remarkable': 'amazing',
        'exceptional': 'special',
        'excellent': 'great',
        'superior': 'better',
        'inferior': 'worse',
        'mediocre': 'okay',
        'satisfactory': 'okay',
        'acceptable': 'okay',
        'suitable': 'good for',
        'valid': 'true',
        'genuine': 'real',
        'authentic': 'real',
        'obvious': 'clear',
        'evident': 'clear',
        'apparent': 'clear',
        'specific': 'exact',
        'particular': 'certain',
        'universal': 'all',
        'global': 'worldwide',
        'domestic': 'home',
        'foreign': 'outside',
        'external': 'outside',
        'internal': 'inside',
        'central': 'middle',
        'peripheral': 'edge',
        'adjacent': 'next to',
        'equivalent': 'equal',
        'identical': 'same',
        'similar': 'alike',
        'diverse': 'different',
        'permanent': 'forever',
        'temporary': 'for now',
        'constant': 'always',
        'frequent': 'often',
        'rapid': 'fast',
        'immediate': 'right now',
        'simultaneous': 'at same time',
        'deliberate': 'on purpose',
        'mandatory': 'must',
        'prohibited': 'not allowed',
        'legitimate': 'legal',
        'ethical': 'right',
        'beneficial': 'good',
        'detrimental': 'bad',
        'productive': 'gets things done',
        'efficient': 'works well',
        'economical': 'saves money',
        'valuable': 'worth a lot',
    };
    
    let result = text;
    for (const [complex, simple] of Object.entries(basicWords)) {
        const regex = new RegExp('\\b' + complex + '\\b', 'gi');
        result = result.replace(regex, simple);
    }
    
    // Remove overly formal phrases
    result = result.replace(/in order to/gi, 'to');
    result = result.replace(/due to the fact that/gi, 'because');
    result = result.replace(/in the event that/gi, 'if');
    result = result.replace(/at this point in time/gi, 'now');
    result = result.replace(/in the near future/gi, 'soon');
    result = result.replace(/for the purpose of/gi, 'to');
    result = result.replace(/with respect to/gi, 'about');
    result = result.replace(/in terms of/gi, 'about');
    result = result.replace(/as a result of/gi, 'because of');
    result = result.replace(/it is important to note that/gi, '');
    result = result.replace(/it should be noted that/gi, '');
    result = result.replace(/it is worth mentioning that/gi, '');
    result = result.replace(/one can see that/gi, 'you can see');
    result = result.replace(/one might argue/gi, 'someone might say');
    result = result.replace(/it is evident that/gi, '');
    result = result.replace(/it is clear that/gi, '');
    
    return result;
}

// Make sentences simple and varied
function makeSimpleSentences(text) {
    // First, fix specific patterns that detectors catch
    text = text.replace(/The systematic application of/gi, 'Using');
    text = text.replace(/constitutes a critical/gi, 'is an important');
    text = text.replace(/enables enhanced/gi, 'makes better');
    text = text.replace(/reduced operational/gi, 'lower running');
    text = text.replace(/accelerated innovation/gi, 'faster new');
    
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const processed = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i].trim();
        const words = sentence.split(/\s+/);
        
        // Break any sentence with more than 15 words randomly
        if (words.length > 15) {
            // Find a good breaking point
            const breakWords = ['and', 'but', 'which', 'that', 'because', 'since', 'while', 'when'];
            let breakPoint = -1;
            
            for (let j = Math.floor(words.length / 2) - 2; j < Math.floor(words.length / 2) + 3; j++) {
                if (breakWords.includes(words[j]?.toLowerCase())) {
                    breakPoint = j;
                    break;
                }
            }
            
            if (breakPoint > 0) {
                processed.push(words.slice(0, breakPoint).join(' ') + '.');
                processed.push(words[breakPoint].charAt(0).toUpperCase() + words[breakPoint].slice(1) + ' ' + 
                              words.slice(breakPoint + 1).join(' '));
            } else {
                // Force break at middle
                const mid = Math.floor(words.length / 2);
                processed.push(words.slice(0, mid).join(' ') + '.');
                processed.push(words.slice(mid).join(' '));
            }
        } else if (words.length < 5 && i < sentences.length - 1) {
            // Keep short sentences as is for variety
            processed.push(sentence);
        } else {
            processed.push(sentence);
        }
    }
    
    return processed.join(' ');
}

// Remove complex punctuation
function removeComplexPunctuation(text) {
    // Remove semicolons
    text = text.replace(/;/g, '.');
    
    // Remove colons except in time
    text = text.replace(/:\s+/g, '. ');
    
    // Remove parentheses
    text = text.replace(/\([^)]*\)/g, '');
    
    // Remove brackets
    text = text.replace(/\[[^\]]*\]/g, '');
    
    // Remove quotes if not dialogue
    text = text.replace(/["']/g, '');
    
    // Simplify multiple punctuation
    text = text.replace(/\.+/g, '.');
    text = text.replace(/,+/g, ',');
    text = text.replace(/\s+/g, ' ');
    
    return text;
}

// Create basic student flow
function createBasicFlow(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const processed = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i];
        
        // Use simple contractions
        sentence = sentence.replace(/\bit is\b/gi, "it's");
        sentence = sentence.replace(/\bthat is\b/gi, "that's");
        sentence = sentence.replace(/\bdo not\b/gi, "don't");
        sentence = sentence.replace(/\bdoes not\b/gi, "doesn't");
        sentence = sentence.replace(/\bdid not\b/gi, "didn't");
        sentence = sentence.replace(/\bcannot\b/gi, "can't");
        sentence = sentence.replace(/\bcould not\b/gi, "couldn't");
        sentence = sentence.replace(/\bwould not\b/gi, "wouldn't");
        sentence = sentence.replace(/\bshould not\b/gi, "shouldn't");
        sentence = sentence.replace(/\bwill not\b/gi, "won't");
        sentence = sentence.replace(/\bhave not\b/gi, "haven't");
        sentence = sentence.replace(/\bhas not\b/gi, "hasn't");
        sentence = sentence.replace(/\bare not\b/gi, "aren't");
        sentence = sentence.replace(/\bis not\b/gi, "isn't");
        sentence = sentence.replace(/\bwas not\b/gi, "wasn't");
        sentence = sentence.replace(/\bwere not\b/gi, "weren't");
        
        // Sometimes start with simple connectors
        if (i > 0 && Math.random() < 0.3) {
            const connectors = ['And', 'But', 'So', 'Also'];
            if (!sentence.match(/^(And|But|So|Also|Then|Because)/i)) {
                sentence = connectors[Math.floor(Math.random() * connectors.length)] + ' ' + 
                          sentence.charAt(0).toLowerCase() + sentence.slice(1);
            }
        }
        
        // Add "I think" or "I believe" occasionally
        if (Math.random() < 0.15 && !sentence.match(/^I /i)) {
            sentence = 'I think ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
        
        processed.push(sentence);
    }
    
    return processed.join(' ');
}

// Final cleanup
function finalBasicCleanup(text) {
    // Fix spacing
    text = text.replace(/\s+/g, ' ');
    
    // Fix sentence capitalization
    text = text.replace(/\.\s+([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
    
    // Start with capital
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Remove double punctuation
    text = text.replace(/\.\./g, '.');
    text = text.replace(/,,/g, ',');
    
    // Remove any remaining complex words that slipped through
    text = text.replace(/\b(shall|whom|whilst|albeit|hence|thereof|wherein|whereby)\b/gi, 
        (match) => {
            const replacements = {
                'shall': 'will',
                'whom': 'who',
                'whilst': 'while',
                'albeit': 'though',
                'hence': 'so',
                'thereof': 'of it',
                'wherein': 'where',
                'whereby': 'by which'
            };
            return replacements[match.toLowerCase()] || match;
        });
    
    // Make sure no dashes remain
    text = text.replace(/[-–—]/g, ' ');
    
    // Clean up extra spaces
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}
