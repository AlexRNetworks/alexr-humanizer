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

        // Apply student-focused humanization
        const humanizedText = await studentHumanize(inputText);

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

// Student-focused humanization matching top humanizers
async function studentHumanize(text) {
    // Core principle: Write like a real student (not too perfect, not too casual)
    
    // Step 1: Simplify vocabulary to high school/early college level
    text = simplifyToStudentLevel(text);
    
    // Step 2: Add natural student voice
    text = addStudentVoice(text);
    
    // Step 3: Create realistic imperfections (students aren't perfect)
    text = addStudentImperfections(text);
    
    // Step 4: Vary sentence structure (key for detection bypass)
    text = varyStudentSentences(text);
    
    // Step 5: Remove AI markers completely
    text = removeAIMarkers(text);
    
    // Step 6: Add student-style transitions
    text = studentTransitions(text);
    
    // Step 7: Final polish
    text = finalStudentPolish(text);
    
    return text;
}

// Simplify to authentic student vocabulary
function simplifyToStudentLevel(text) {
    // Replace complex words with what students actually use
    const studentReplacements = {
        // Academic words → Student words
        'utilize': 'use',
        'utilization': 'use',
        'utilized': 'used',
        'utilizing': 'using',
        'implement': 'do',
        'implementation': 'doing',
        'implemented': 'did',
        'facilitate': 'help',
        'facilitates': 'helps',
        'demonstrate': 'show',
        'demonstrates': 'shows',
        'illustrated': 'showed',
        'illustrates': 'shows',
        'approximately': 'about',
        'subsequent': 'next',
        'subsequently': 'after',
        'furthermore': 'also',
        'moreover': 'also',
        'nevertheless': 'but',
        'nonetheless': 'still',
        'consequently': 'so',
        'methodology': 'way',
        'paradigm': 'idea',
        'optimize': 'make better',
        'optimization': 'improvement',
        'prioritize': 'focus on',
        'leverage': 'use',
        'innovative': 'new',
        'comprehensive': 'complete',
        'substantial': 'big',
        'fundamental': 'basic',
        'establish': 'create',
        'established': 'created',
        'indicates': 'shows',
        'significant': 'important',
        'significantly': 'a lot',
        'numerous': 'many',
        'acquire': 'get',
        'endeavor': 'try',
        'commence': 'start',
        'terminate': 'end',
        'sufficient': 'enough',
        'inadequate': 'not enough',
        'preceding': 'before',
        'aforementioned': 'mentioned',
        'regarding': 'about',
        'concerning': 'about',
        'pertaining to': 'about',
        'individuals': 'people',
        'personnel': 'staff',
        'obtain': 'get',
        'possess': 'have',
        'require': 'need',
        'necessary': 'needed',
        'essential': 'important',
        'crucial': 'important',
        'vital': 'important',
        'examine': 'look at',
        'investigate': 'look into',
        'analyze': 'look at',
        'synthesis': 'combination',
        'hypothesis': 'idea',
        'phenomenon': 'thing',
        'criteria': 'standards',
        'parameter': 'limit',
        'component': 'part',
        'element': 'part',
        'aspect': 'part',
        'factor': 'thing',
        'constitute': 'make up',
        'comprise': 'include',
        'encompass': 'include',
        'incorporate': 'include',
        'initiate': 'start',
        'undertake': 'do',
        'conduct': 'do',
        'perform': 'do',
        'execute': 'do',
        'accomplish': 'finish',
        'achieve': 'reach',
        'attain': 'get',
        'ascertain': 'find out',
        'determine': 'figure out',
        'elucidate': 'explain',
        'elaborate': 'explain more',
        'delineate': 'describe',
        'articulate': 'say',
        'convey': 'tell',
        'transmit': 'send',
        'disseminate': 'spread',
        'promulgate': 'announce',
        'advocate': 'support',
        'contend': 'argue',
        'assert': 'say',
        'postulate': 'suggest',
        'hypothesize': 'guess',
        'theorize': 'think',
        'conceptualize': 'think of',
        'perceive': 'see',
        'discern': 'notice',
        'observe': 'see',
        'detect': 'find',
        'identify': 'find',
        'recognize': 'know',
        'acknowledge': 'admit',
        'comprehend': 'understand',
        'grasp': 'understand',
        'fathom': 'understand',
    };
    
    let result = text;
    for (const [complex, simple] of Object.entries(studentReplacements)) {
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
    result = result.replace(/in light of/gi, 'considering');
    result = result.replace(/in spite of/gi, 'despite');
    result = result.replace(/with regard to/gi, 'about');
    result = result.replace(/in accordance with/gi, 'following');
    result = result.replace(/on the basis of/gi, 'based on');
    result = result.replace(/for the most part/gi, 'mostly');
    result = result.replace(/to a great extent/gi, 'mostly');
    result = result.replace(/in many cases/gi, 'often');
    result = result.replace(/it is important to note that/gi, '');
    result = result.replace(/it should be noted that/gi, '');
    result = result.replace(/it is worth mentioning that/gi, '');
    
    return result;
}

// Add authentic student voice
function addStudentVoice(text) {
    // Use contractions (students always use these)
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
    };
    
    let result = text;
    for (const [formal, informal] of Object.entries(contractions)) {
        const regex = new RegExp('\\b' + formal + '\\b', 'gi');
        result = result.replace(regex, informal);
    }
    
    // Students use "I think" and "I believe" a lot
    const sentences = result.split(/(?<=[.!?])\s+/);
    if (sentences.length > 2 && Math.random() < 0.3) {
        const randomIndex = 1 + Math.floor(Math.random() * (sentences.length - 1));
        if (!sentences[randomIndex].match(/^(I |We |They |He |She )/)) {
            sentences[randomIndex] = 'I think ' + sentences[randomIndex].charAt(0).toLowerCase() + 
                                    sentences[randomIndex].slice(1);
        }
    }
    
    return sentences.join(' ');
}

// Add realistic student imperfections
function addStudentImperfections(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    return sentences.map((sentence, index) => {
        let s = sentence.trim();
        
        // Sometimes start with And/But (common student pattern)
        if (index > 0 && Math.random() < 0.2) {
            if (!s.match(/^(And|But|So|Because)/i)) {
                const starters = ['And', 'But', 'So'];
                s = starters[Math.floor(Math.random() * starters.length)] + ' ' + 
                    s.charAt(0).toLowerCase() + s.slice(1);
            }
        }
        
        // Occasionally use "like" as a filler (but not too much)
        if (Math.random() < 0.08) {
            s = s.replace(/\b(was|is|seems)\b/, '$1 like');
            s = s.replace(/like like/g, 'like'); // Prevent doubles
        }
        
        // Sometimes use "kind of" or "sort of"
        if (Math.random() < 0.1) {
            s = s.replace(/\b(very|really|quite)\b/, 'kind of');
            s = s.replace(/kind of kind of/g, 'kind of');
        }
        
        // Add "basically" occasionally (students love this word)
        if (Math.random() < 0.1 && !s.includes('basically')) {
            s = 'Basically, ' + s.charAt(0).toLowerCase() + s.slice(1);
        }
        
        // Sometimes use "stuff" or "things" instead of specific terms
        if (Math.random() < 0.05) {
            s = s.replace(/\b(aspects|elements|components)\b/gi, 'things');
            s = s.replace(/\b(materials|content|information)\b/gi, 'stuff');
        }
        
        return s;
    }).join(' ');
}

// Vary sentences like real students write
function varyStudentSentences(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const processed = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i].trim();
        const words = sentence.split(/\s+/);
        
        // Mix short and long sentences (key for bypassing detectors)
        if (i > 0) {
            const prevLength = processed[processed.length - 1].split(/\s+/).length;
            
            // After a long sentence, make it short
            if (prevLength > 15 && words.length > 10) {
                const midPoint = Math.floor(words.length / 2);
                processed.push(words.slice(0, midPoint).join(' ') + '.');
                processed.push(words.slice(midPoint).join(' '));
            }
            // After a short sentence, keep normal or combine
            else if (prevLength < 6 && words.length < 8 && i < sentences.length - 1) {
                processed.push(sentence.replace(/\.$/, ',') + ' and ' + 
                             sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1));
                i++;
            } else {
                processed.push(sentence);
            }
        } else {
            processed.push(sentence);
        }
    }
    
    return processed.join(' ');
}

// Remove all AI markers
function removeAIMarkers(text) {
    // Remove AI's favorite starting phrases
    text = text.replace(/^(Furthermore|Moreover|Additionally|In conclusion|In summary|To summarize|Overall|In essence|Essentially|Fundamentally),?\s*/gi, '');
    
    // Remove embedded AI phrases
    text = text.replace(/\b(it is evident that|it is clear that|it is apparent that|it can be observed that|one can see that|research indicates that|studies show that|data suggests that|evidence indicates that)\b/gi, '');
    
    // Remove academic hedging
    text = text.replace(/\b(arguably|presumably|ostensibly|purportedly|allegedly|seemingly|apparently)\b/gi, '');
    
    // Remove overly precise language
    text = text.replace(/\b(precisely|specifically|exactly|particularly|especially)\b/gi, '');
    
    return text;
}

// Add student-style transitions
function studentTransitions(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    for (let i = 1; i < sentences.length; i++) {
        // Add simple transitions between some sentences
        if (Math.random() < 0.25) {
            const transitions = [
                'Also, ',
                'Plus, ',
                'Another thing is ',
                'Oh and ',
                'The thing is, ',
                'What else... ',
                'Anyway, '
            ];
            
            if (!sentences[i].match(/^(Also|Plus|Another|Oh|The thing|What|Anyway|But|So|And)/)) {
                const transition = transitions[Math.floor(Math.random() * transitions.length)];
                sentences[i] = transition + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
            }
        }
    }
    
    return sentences.join(' ');
}

// Final polish for student writing
function finalStudentPolish(text) {
    // Fix spacing
    text = text.replace(/\s+/g, ' ');
    
    // Fix sentence capitalization
    text = text.replace(/\.\s+([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
    
    // Start with capital
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Remove double punctuation
    text = text.replace(/\.\./g, '.');
    text = text.replace(/,,/g, ',');
    
    // Add some personality phrases students use
    const personalityPhrases = {
        'This means': 'So this means',
        'This shows': 'This basically shows',
        'This suggests': 'This kind of suggests',
        'This indicates': 'This shows',
        'We can see': 'You can see',
        'One might': 'You might',
        'It appears': 'It looks like',
        'It seems': 'Seems like',
    };
    
    for (const [formal, casual] of Object.entries(personalityPhrases)) {
        text = text.replace(new RegExp('\\b' + formal + '\\b', 'gi'), casual);
    }
    
    // Students often end with simple conclusions
    if (text.length > 100) {
        const endings = [
            ' So yeah, that\'s basically it.',
            ' That\'s pretty much the main idea.',
            ' And that\'s what I think about it.',
            ' So that\'s how it works.',
            ' That\'s the basic idea anyway.',
        ];
        
        // 15% chance to add a student-style ending
        if (Math.random() < 0.15) {
            text = text.replace(/\.$/, endings[Math.floor(Math.random() * endings.length)]);
        }
    }
    
    return text.trim();
}
