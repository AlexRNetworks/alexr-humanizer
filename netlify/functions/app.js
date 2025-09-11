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

        // Apply efficient humanization
        const humanizedText = efficientHumanize(inputText);

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

// Efficient humanization focused on what actually works
function efficientHumanize(text) {
    // Step 1: Strip and rebuild
    text = stripAIMarkers(text);
    
    // Step 2: Simplify vocabulary
    text = simplifyVocabulary(text);
    
    // Step 3: Break sentences
    text = breakSentences(text);
    
    // Step 4: Add human touch
    text = addHumanTouch(text);
    
    // Step 5: Final cleanup
    text = finalCleanup(text);
    
    return text;
}

// Remove AI markers completely
function stripAIMarkers(text) {
    // Remove transition words at start of sentences
    text = text.replace(/\b(Furthermore|Moreover|Additionally|However|Nevertheless|Therefore|Thus|Hence|Consequently|Subsequently|Initially|Finally|Similarly|Likewise|Conversely|Alternatively|Specifically|Generally|Typically|Particularly|Essentially|Fundamentally|Ultimately|Accordingly|Notably|Importantly|Significantly|Interestingly|Surprisingly|Unfortunately|Fortunately|Admittedly|Granted|Indeed|Obviously|Clearly|Evidently|Apparently|Presumably|Arguably),?\s+/gi, '');
    
    // Remove academic phrases
    text = text.replace(/It is important to note that/gi, '');
    text = text.replace(/It should be noted that/gi, '');
    text = text.replace(/It is worth mentioning that/gi, '');
    text = text.replace(/In conclusion/gi, '');
    text = text.replace(/In summary/gi, '');
    text = text.replace(/To summarize/gi, '');
    text = text.replace(/Overall/gi, '');
    text = text.replace(/In essence/gi, '');
    text = text.replace(/Essentially/gi, '');
    text = text.replace(/Fundamentally/gi, '');
    text = text.replace(/It is evident that/gi, '');
    text = text.replace(/It is clear that/gi, '');
    text = text.replace(/Research indicates/gi, 'Studies show');
    text = text.replace(/Data suggests/gi, 'Numbers show');
    text = text.replace(/Evidence indicates/gi, 'Proof shows');
    
    return text;
}

// Simplify vocabulary efficiently
function simplifyVocabulary(text) {
    // Most common AI words to simple words
    const replacements = {
        'utilize': 'use',
        'utilized': 'used',
        'utilizing': 'using',
        'utilization': 'use',
        'implement': 'do',
        'implemented': 'did',
        'implementing': 'doing',
        'implementation': 'doing',
        'facilitate': 'help',
        'facilitated': 'helped',
        'facilitates': 'helps',
        'demonstrate': 'show',
        'demonstrated': 'showed',
        'demonstrates': 'shows',
        'establish': 'set up',
        'established': 'set up',
        'establishing': 'setting up',
        'enhance': 'improve',
        'enhanced': 'improved',
        'enhances': 'improves',
        'optimize': 'make better',
        'optimized': 'made better',
        'optimization': 'making better',
        'leverage': 'use',
        'leveraging': 'using',
        'leveraged': 'used',
        'significant': 'big',
        'significantly': 'a lot',
        'substantial': 'large',
        'substantially': 'a lot',
        'considerable': 'big',
        'considerably': 'a lot',
        'numerous': 'many',
        'various': 'different',
        'multiple': 'many',
        'comprehensive': 'complete',
        'fundamental': 'basic',
        'fundamentally': 'basically',
        'essential': 'needed',
        'essentially': 'basically',
        'crucial': 'important',
        'critical': 'important',
        'primary': 'main',
        'primarily': 'mainly',
        'achieve': 'get',
        'achieved': 'got',
        'achieving': 'getting',
        'accomplish': 'do',
        'accomplished': 'did',
        'obtain': 'get',
        'obtained': 'got',
        'acquire': 'get',
        'acquired': 'got',
        'maintain': 'keep',
        'maintained': 'kept',
        'maintaining': 'keeping',
        'ensure': 'make sure',
        'ensuring': 'making sure',
        'require': 'need',
        'required': 'needed',
        'requiring': 'needing',
        'indicate': 'show',
        'indicated': 'showed',
        'indicates': 'shows',
        'suggest': 'show',
        'suggested': 'showed',
        'suggests': 'shows',
        'imply': 'mean',
        'implied': 'meant',
        'implies': 'means',
        'reveal': 'show',
        'revealed': 'showed',
        'reveals': 'shows',
        'exhibit': 'show',
        'exhibited': 'showed',
        'exhibits': 'shows',
        'display': 'show',
        'displayed': 'showed',
        'displays': 'shows',
        'provide': 'give',
        'provided': 'gave',
        'provides': 'gives',
        'contribute': 'add',
        'contributed': 'added',
        'contributes': 'adds',
        'constitute': 'make up',
        'constitutes': 'makes up',
        'comprise': 'include',
        'comprises': 'includes',
        'incorporate': 'include',
        'incorporated': 'included',
        'incorporates': 'includes',
        'integrate': 'combine',
        'integrated': 'combined',
        'integrates': 'combines',
        'transform': 'change',
        'transformed': 'changed',
        'transforms': 'changes',
        'transformation': 'change',
        'modify': 'change',
        'modified': 'changed',
        'modifies': 'changes',
        'alter': 'change',
        'altered': 'changed',
        'alters': 'changes',
        'adapt': 'change',
        'adapted': 'changed',
        'adapts': 'changes',
        'evolve': 'grow',
        'evolved': 'grew',
        'evolves': 'grows',
        'develop': 'make',
        'developed': 'made',
        'develops': 'makes',
        'development': 'growth',
        'progress': 'move forward',
        'progressed': 'moved forward',
        'advance': 'move forward',
        'advanced': 'moved forward',
        'proceed': 'go',
        'proceeded': 'went',
        'continue': 'keep going',
        'continued': 'kept going',
        'eliminate': 'remove',
        'eliminated': 'removed',
        'eliminates': 'removes',
        'reduce': 'lower',
        'reduced': 'lowered',
        'reduces': 'lowers',
        'decrease': 'lower',
        'decreased': 'lowered',
        'decreases': 'lowers',
        'increase': 'raise',
        'increased': 'raised',
        'increases': 'raises',
        'expand': 'grow',
        'expanded': 'grew',
        'expands': 'grows',
        'emphasize': 'stress',
        'emphasized': 'stressed',
        'emphasizes': 'stresses',
        'highlight': 'point out',
        'highlighted': 'pointed out',
        'highlights': 'points out',
        'illustrate': 'show',
        'illustrated': 'showed',
        'illustrates': 'shows',
        'exemplify': 'show',
        'exemplified': 'showed',
        'exemplifies': 'shows',
        'represent': 'stand for',
        'represented': 'stood for',
        'represents': 'stands for',
        'signify': 'mean',
        'signified': 'meant',
        'signifies': 'means',
        'denote': 'mean',
        'denoted': 'meant',
        'denotes': 'means',
        'characterize': 'describe',
        'characterized': 'described',
        'characterizes': 'describes',
        'define': 'explain',
        'defined': 'explained',
        'defines': 'explains',
        'examine': 'look at',
        'examined': 'looked at',
        'examines': 'looks at',
        'analyze': 'study',
        'analyzed': 'studied',
        'analyzes': 'studies',
        'evaluate': 'check',
        'evaluated': 'checked',
        'evaluates': 'checks',
        'assess': 'check',
        'assessed': 'checked',
        'assesses': 'checks',
        'investigate': 'look into',
        'investigated': 'looked into',
        'investigates': 'looks into',
        'explore': 'look at',
        'explored': 'looked at',
        'explores': 'looks at',
        'discover': 'find',
        'discovered': 'found',
        'discovers': 'finds',
        'identify': 'find',
        'identified': 'found',
        'identifies': 'finds',
        'recognize': 'know',
        'recognized': 'knew',
        'recognizes': 'knows',
        'acknowledge': 'admit',
        'acknowledged': 'admitted',
        'acknowledges': 'admits',
        'determine': 'find out',
        'determined': 'found out',
        'determines': 'finds out',
        'conclude': 'end',
        'concluded': 'ended',
        'concludes': 'ends',
        'initiate': 'start',
        'initiated': 'started',
        'initiates': 'starts',
        'commence': 'start',
        'commenced': 'started',
        'commences': 'starts',
        'terminate': 'end',
        'terminated': 'ended',
        'terminates': 'ends',
        'individuals': 'people',
        'individual': 'person',
        'organizations': 'groups',
        'organization': 'group',
        'institutions': 'places',
        'institution': 'place',
        'components': 'parts',
        'component': 'part',
        'elements': 'parts',
        'element': 'part',
        'aspects': 'parts',
        'aspect': 'part',
        'factors': 'things',
        'factor': 'thing',
        'subsequently': 'then',
        'previously': 'before',
        'ultimately': 'in the end',
        'initially': 'at first',
        'frequently': 'often',
        'occasionally': 'sometimes',
        'rarely': 'not often',
        'typically': 'usually',
        'generally': 'usually',
        'specifically': 'exactly',
        'particularly': 'especially',
        'approximately': 'about',
        'merely': 'just',
        'simply': 'just',
        'actually': 'really',
        'basically': 'simply',
        'definitely': 'for sure',
        'certainly': 'for sure',
        'absolutely': 'totally',
        'completely': 'fully',
        'entirely': 'fully',
        'partially': 'partly',
        'somewhat': 'kind of',
        'relatively': 'compared to',
        'respectively': 'in order',
        'collectively': 'together',
        'individually': 'one by one',
        'simultaneously': 'at the same time',
        'alternatively': 'or',
        'conversely': 'on the other hand',
        'similarly': 'likewise',
        'additionally': 'also',
        'furthermore': 'also',
        'moreover': 'also',
        'however': 'but',
        'nevertheless': 'but',
        'nonetheless': 'still',
        'therefore': 'so',
        'thus': 'so',
        'hence': 'so',
        'consequently': 'so',
        'accordingly': 'so',
        
        // Common phrases
        'in order to': 'to',
        'due to the fact that': 'because',
        'in the event that': 'if',
        'at this point in time': 'now',
        'in the near future': 'soon',
        'for the purpose of': 'to',
        'with respect to': 'about',
        'in terms of': 'about',
        'as a result of': 'because of',
        'in light of': 'considering',
        'in spite of': 'despite',
        'with regard to': 'about',
        'in accordance with': 'following',
        'on the basis of': 'based on',
        'for the most part': 'mostly',
        'to a great extent': 'mostly',
        'in many cases': 'often',
        
        // Tech/business terms
        'artificial intelligence': 'AI',
        'machine learning': 'computers learning',
        'algorithms': 'computer rules',
        'optimization': 'making better',
        'digital transformation': 'going digital',
        'operational': 'working',
        'systematic': 'organized',
        'application': 'use',
        'applications': 'uses',
        'enables': 'lets',
        'productivity': 'work output',
        'accelerated': 'faster',
        'innovation': 'new ideas',
        'cycles': 'rounds',
        'marketplace': 'market',
        'reshaping': 'changing',
        'operate': 'work',
        'operations': 'work',
        'competitive': 'competing',
        'advantages': 'benefits',
        'disadvantages': 'downsides',
        'challenges': 'problems',
        'opportunities': 'chances',
        'solutions': 'answers',
        'strategies': 'plans',
        'approaches': 'ways',
        'methods': 'ways',
        'techniques': 'ways',
        'procedures': 'steps',
        'processes': 'steps',
        'mechanisms': 'ways',
        'systems': 'setups',
        'structures': 'setups',
        'frameworks': 'setups',
        'models': 'examples',
        'concepts': 'ideas',
        'perspectives': 'views',
        'implications': 'effects',
        'consequences': 'results',
        'outcomes': 'results',
        'benefits': 'good things',
        'requirements': 'needs',
        'objectives': 'goals',
        'targets': 'goals',
        'resources': 'things we need',
        'materials': 'stuff',
        'equipment': 'tools',
        'technology': 'tech',
        'developments': 'changes',
        'improvements': 'better things',
        'modifications': 'changes',
        'variations': 'differences',
        'categories': 'groups',
        'dimensions': 'sides',
        'parameters': 'limits',
        'criteria': 'standards',
        'circumstances': 'situations',
        'conditions': 'states',
        'contexts': 'settings',
        'environments': 'places',
        'scenarios': 'cases',
        'instances': 'times',
        'examples': 'cases',
    };
    
    // Apply replacements
    for (const [complex, simple] of Object.entries(replacements)) {
        const regex = new RegExp('\\b' + complex + '\\b', 'gi');
        text = text.replace(regex, simple);
    }
    
    return text;
}

// Break sentences to avoid AI patterns
function breakSentences(text) {
    // Split into sentences
    let sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    sentences = sentences.map(s => s.trim());
    
    const result = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i];
        
        // Break up lists (AI loves these)
        sentence = sentence.replace(/(\w+), (\w+), and (\w+)/g, '$1. Also $2. Plus $3');
        sentence = sentence.replace(/(\w+ing \w+), (\w+ing \w+), and (\w+ing \w+)/g, '$1. Then $2. And $3');
        
        // Break long sentences
        const words = sentence.split(' ');
        if (words.length > 12) {
            // Find natural break points
            const breakWords = ['which', 'that', 'because', 'since', 'while', 'when', 'where', 'and', 'but'];
            let breakIndex = -1;
            
            // Look for break point in middle third of sentence
            const startSearch = Math.floor(words.length / 3);
            const endSearch = Math.floor(2 * words.length / 3);
            
            for (let j = startSearch; j < endSearch; j++) {
                if (breakWords.includes(words[j].toLowerCase().replace(/[,.]/, ''))) {
                    breakIndex = j;
                    break;
                }
            }
            
            if (breakIndex > 0) {
                result.push(words.slice(0, breakIndex).join(' ') + '.');
                result.push(words.slice(breakIndex).join(' '));
            } else {
                // Force break at middle
                const mid = Math.floor(words.length / 2);
                result.push(words.slice(0, mid).join(' ') + '.');
                result.push(words.slice(mid).join(' '));
            }
        } else {
            result.push(sentence);
        }
    }
    
    return result.join(' ');
}

// Add human touch
function addHumanTouch(text) {
    // Add contractions
    text = text.replace(/\bit is\b/gi, "it's");
    text = text.replace(/\bthat is\b/gi, "that's");
    text = text.replace(/\bdo not\b/gi, "don't");
    text = text.replace(/\bdoes not\b/gi, "doesn't");
    text = text.replace(/\bdid not\b/gi, "didn't");
    text = text.replace(/\bcannot\b/gi, "can't");
    text = text.replace(/\bcould not\b/gi, "couldn't");
    text = text.replace(/\bwould not\b/gi, "wouldn't");
    text = text.replace(/\bshould not\b/gi, "shouldn't");
    text = text.replace(/\bwill not\b/gi, "won't");
    text = text.replace(/\bhave not\b/gi, "haven't");
    text = text.replace(/\bhas not\b/gi, "hasn't");
    text = text.replace(/\bare not\b/gi, "aren't");
    text = text.replace(/\bis not\b/gi, "isn't");
    text = text.replace(/\bwas not\b/gi, "wasn't");
    text = text.replace(/\bwere not\b/gi, "weren't");
    
    // Split into sentences for processing
    const sentences = text.split(/(?<=[.!?])\s+/);
    const processed = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i];
        
        // Add simple connectors sometimes
        if (i > 0) {
            const rand = Math.random();
            if (rand < 0.15) {
                sentence = 'And ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
            } else if (rand < 0.25) {
                sentence = 'But ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
            } else if (rand < 0.35) {
                sentence = 'So ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
            } else if (rand < 0.4) {
                sentence = 'Also ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
            }
        }
        
        // Add "I think" occasionally
        if (Math.random() < 0.1 && !sentence.match(/^(I |We |They |He |She |And |But |So )/i)) {
            const phrases = ['I think ', 'I believe ', 'Seems like '];
            sentence = phrases[Math.floor(Math.random() * phrases.length)] + 
                      sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
        
        // Add basic filler words sparingly
        if (Math.random() < 0.05) {
            const words = sentence.split(' ');
            if (words.length > 4) {
                const fillers = ['really', 'just', 'actually'];
                const filler = fillers[Math.floor(Math.random() * fillers.length)];
                const pos = 2 + Math.floor(Math.random() * 2);
                words.splice(pos, 0, filler);
                sentence = words.join(' ');
            }
        }
        
        processed.push(sentence);
    }
    
    return processed.join(' ');
}

// Final cleanup
function finalCleanup(text) {
    // Remove dashes
    text = text.replace(/—/g, ' ');
    text = text.replace(/–/g, ' ');
    text = text.replace(/ - /g, ' ');
    
    // Remove semicolons and colons
    text = text.replace(/;/g, '.');
    text = text.replace(/:/g, '.');
    
    // Fix spacing
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\.\s*\./g, '.');
    text = text.replace(/\s+\./g, '.');
    
    // Fix capitalization
    text = text.replace(/\. ([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Ensure ending punctuation
    if (!text.match(/[.!?]$/)) {
        text += '.';
    }
    
    return text.trim();
}
