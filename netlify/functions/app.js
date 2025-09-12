import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
        }
        
        const { prompt: inputText } = JSON.parse(event.body);
        if (!inputText) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing text" }) };
        }
        
        const words = inputText.trim().split(/\s+/);
        const wordCount = words.length;
        
        if (wordCount > 200) {
            return { statusCode: 400, body: JSON.stringify({ 
                error: `Exceeds 200 word limit (${wordCount} words)`, wordCount, limit: 200 
            }) };
        }
        
        const humanizedText = aggressiveHumanize(inputText);
        
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
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

function aggressiveHumanize(text) {
    // Phase 1: Strip AI vocabulary completely
    const aiTerms = {
        'utilize': 'use', 'utilized': 'used', 'utilizing': 'using',
        'implement': 'do', 'implemented': 'did', 'implementing': 'doing',
        'demonstrate': 'show', 'demonstrates': 'shows', 'demonstrated': 'showed',
        'facilitate': 'help', 'facilitates': 'helps', 'facilitated': 'helped',
        'significant': 'big', 'significantly': 'a lot', 'significance': 'importance',
        'substantial': 'big', 'substantially': 'a lot',
        'comprehensive': 'full', 'comprehensively': 'fully',
        'fundamental': 'basic', 'fundamentally': 'basically',
        'essential': 'needed', 'essentially': 'basically',
        'crucial': 'key', 'critically': 'very',
        'numerous': 'many', 'various': 'different', 'multiple': 'many',
        'enhance': 'help', 'enhanced': 'helped', 'enhancing': 'helping',
        'establish': 'make', 'established': 'made', 'establishing': 'making',
        'maintain': 'keep', 'maintained': 'kept', 'maintaining': 'keeping',
        'ensure': 'make sure', 'ensures': 'makes sure', 'ensured': 'made sure',
        'require': 'need', 'requires': 'needs', 'required': 'needed',
        'provide': 'give', 'provides': 'gives', 'provided': 'gave',
        'achieve': 'get', 'achieves': 'gets', 'achieved': 'got',
        'obtain': 'get', 'obtained': 'got', 'obtaining': 'getting',
        'enable': 'let', 'enables': 'lets', 'enabled': 'let',
        'allow': 'let', 'allows': 'lets', 'allowed': 'let',
        'contribute': 'help', 'contributes': 'helps', 'contributed': 'helped',
        'represent': 'show', 'represents': 'shows', 'represented': 'showed',
        'indicate': 'show', 'indicates': 'shows', 'indicated': 'showed',
        'suggest': 'say', 'suggests': 'says', 'suggested': 'said',
        'imply': 'mean', 'implies': 'means', 'implied': 'meant',
        'involve': 'have', 'involves': 'has', 'involved': 'had',
        'incorporate': 'add', 'incorporates': 'adds', 'incorporated': 'added',
        'emphasize': 'stress', 'emphasizes': 'stresses', 'emphasized': 'stressed',
        'highlight': 'show', 'highlights': 'shows', 'highlighted': 'showed',
        'illustrate': 'show', 'illustrates': 'shows', 'illustrated': 'showed',
        'comprise': 'have', 'comprises': 'has', 'comprised': 'had',
        'constitute': 'make', 'constitutes': 'makes', 'constituted': 'made',
        'encompass': 'cover', 'encompasses': 'covers', 'encompassed': 'covered',
        'subsequently': 'then', 'ultimately': 'finally', 'primarily': 'mainly',
        'particularly': 'mostly', 'specifically': 'exactly', 'generally': 'usually',
        'typically': 'often', 'frequently': 'often', 'occasionally': 'sometimes',
        'approximately': 'about', 'optimal': 'best', 'sufficient': 'enough',
        'adequate': 'okay', 'appropriate': 'right', 'relevant': 'related',
        'evident': 'clear', 'apparent': 'clear', 'obvious': 'clear',
        'furthermore': '', 'moreover': '', 'additionally': '', 'however': 'but',
        'nevertheless': 'but', 'nonetheless': 'still', 'therefore': 'so',
        'consequently': 'so', 'thus': 'so', 'hence': 'so', 'accordingly': 'so',
        'individuals': 'people', 'organizations': 'groups', 'institutions': 'places',
        'components': 'parts', 'elements': 'parts', 'aspects': 'things',
        'factors': 'things', 'parameters': 'settings', 'criteria': 'rules',
        'objectives': 'goals', 'strategies': 'plans', 'approaches': 'ways',
        'methods': 'ways', 'procedures': 'steps', 'concepts': 'ideas',
        'perspectives': 'views', 'implications': 'effects', 'consequences': 'results',
        'benefits': 'good stuff', 'advantages': 'pros', 'disadvantages': 'cons',
        'challenges': 'problems', 'opportunities': 'chances', 'solutions': 'fixes'
    };
    
    for (const [ai, human] of Object.entries(aiTerms)) {
        const regex = new RegExp('\\b' + ai + '\\b', 'gi');
        text = text.replace(regex, human);
    }
    
    // Phase 2: Remove ALL formal phrases
    text = text.replace(/it is important to note that/gi, '');
    text = text.replace(/it should be noted that/gi, '');
    text = text.replace(/it is worth mentioning that/gi, '');
    text = text.replace(/in conclusion/gi, '');
    text = text.replace(/in summary/gi, '');
    text = text.replace(/to summarize/gi, '');
    text = text.replace(/overall/gi, '');
    text = text.replace(/in general/gi, '');
    text = text.replace(/generally speaking/gi, '');
    text = text.replace(/in order to/gi, 'to');
    text = text.replace(/due to the fact that/gi, 'because');
    text = text.replace(/in the event that/gi, 'if');
    text = text.replace(/as a result of/gi, 'because of');
    text = text.replace(/for the purpose of/gi, 'to');
    text = text.replace(/with respect to/gi, 'about');
    text = text.replace(/in terms of/gi, 'about');
    
    // Phase 3: Aggressive sentence restructuring
    let sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const output = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let s = sentences[i].trim();
        
        // Remove ALL leading transitions
        s = s.replace(/^(Furthermore|Moreover|Additionally|However|Nevertheless|Therefore|Thus|Hence|Consequently|Subsequently|Initially|Finally|Similarly|Likewise|Conversely|Alternatively|Specifically|Generally|Typically|Particularly|Essentially|Fundamentally|Ultimately|Accordingly|Notably|Importantly|Significantly|Interestingly|Surprisingly|Unfortunately|Fortunately|Admittedly|Clearly|Obviously|Evidently),?\s*/gi, '');
        
        // Break parallel structures aggressively
        s = s.replace(/(\w+), (\w+), and (\w+)/g, '$1. Then $2. Also $3');
        s = s.replace(/(\w+ing) (\w+), (\w+ing) (\w+), and (\w+ing) (\w+)/g, '$1 $2. Then $3 $4. Also $5 $6');
        
        // Convert ALL passive voice
        s = s.replace(/\b(is|are|was|were|be|been|being) (\w+ed)\b/g, 'got $2');
        s = s.replace(/\bhas been (\w+ed)\b/g, 'got $1');
        s = s.replace(/\bhave been (\w+ed)\b/g, 'got $1');
        s = s.replace(/\bwill be (\w+ed)\b/g, 'will get $1');
        s = s.replace(/\bcan be (\w+ed)\b/g, 'can get $1');
        
        // Maximum contractions
        s = s.replace(/\bit is\b/g, "it's");
        s = s.replace(/\bthat is\b/g, "that's");
        s = s.replace(/\bwhat is\b/g, "what's");
        s = s.replace(/\bthere is\b/g, "there's");
        s = s.replace(/\bhere is\b/g, "here's");
        s = s.replace(/\bwho is\b/g, "who's");
        s = s.replace(/\bdo not\b/g, "don't");
        s = s.replace(/\bdoes not\b/g, "doesn't");
        s = s.replace(/\bdid not\b/g, "didn't");
        s = s.replace(/\bcannot\b/g, "can't");
        s = s.replace(/\bcould not\b/g, "couldn't");
        s = s.replace(/\bwould not\b/g, "wouldn't");
        s = s.replace(/\bshould not\b/g, "shouldn't");
        s = s.replace(/\bwill not\b/g, "won't");
        s = s.replace(/\bhave not\b/g, "haven't");
        s = s.replace(/\bhas not\b/g, "hasn't");
        s = s.replace(/\bhad not\b/g, "hadn't");
        s = s.replace(/\bare not\b/g, "aren't");
        s = s.replace(/\bis not\b/g, "isn't");
        s = s.replace(/\bwas not\b/g, "wasn't");
        s = s.replace(/\bwere not\b/g, "weren't");
        s = s.replace(/\bI am\b/g, "I'm");
        s = s.replace(/\byou are\b/g, "you're");
        s = s.replace(/\bwe are\b/g, "we're");
        s = s.replace(/\bthey are\b/g, "they're");
        
        // GPTZero killer: Force extreme sentence length variation
        const words = s.split(' ');
        const len = words.length;
        
        if (len > 12) {
            // Break EVERY long sentence
            const parts = [];
            let current = [];
            
            for (let j = 0; j < words.length; j++) {
                current.push(words[j]);
                // Force break at 5-8 words
                if (current.length >= 5 + Math.floor(Math.random() * 4)) {
                    parts.push(current.join(' ') + '.');
                    current = [];
                }
            }
            if (current.length > 0) {
                parts.push(current.join(' ') + '.');
            }
            
            // Add the parts with random connectors
            for (let p of parts) {
                output.push(p);
            }
        } else if (len < 4) {
            // Keep very short sentences
            output.push(s);
        } else {
            // Medium sentences - randomly break or keep
            if (Math.random() > 0.5 && len > 7) {
                const mid = Math.floor(len / 2);
                output.push(words.slice(0, mid).join(' ') + '.');
                output.push(words.slice(mid).join(' ') + '.');
            } else {
                output.push(s);
            }
        }
    }
    
    // Phase 4: Add heavy human elements
    const humanized = [];
    for (let i = 0; i < output.length; i++) {
        let s = output[i].trim();
        if (!s) continue;
        
        // Random starters (40% chance)
        const r = Math.random();
        if (i === 0) {
            if (r < 0.4) {
                const starters = ['So ', 'Well ', 'Okay so ', 'Look ', 'See '];
                s = starters[Math.floor(Math.random() * starters.length)] + 
                    s.charAt(0).toLowerCase() + s.slice(1);
            }
        } else if (r < 0.35) {
            const connectors = ['And ', 'But ', 'Also ', 'Plus ', 'Then ', 'So ', 'Now ', 'Well '];
            s = connectors[Math.floor(Math.random() * connectors.length)] + 
                s.charAt(0).toLowerCase() + s.slice(1);
        }
        
        // Add "I think/believe/guess" (20% chance)
        if (Math.random() < 0.2 && !s.match(/^(I |We |You |They |He |She |And |But |So )/i)) {
            const opinions = ['I think ', 'I believe ', 'I guess ', 'I feel like ', 'Seems like ', 'Maybe '];
            s = opinions[Math.floor(Math.random() * opinions.length)] + 
                s.charAt(0).toLowerCase() + s.slice(1);
        }
        
        // Add fillers (15% chance)
        if (Math.random() < 0.15 && s.split(' ').length > 4) {
            const fillers = ['basically', 'actually', 'really', 'just', 'like', 'kinda', 'pretty much'];
            const filler = fillers[Math.floor(Math.random() * fillers.length)];
            const sWords = s.split(' ');
            const pos = 1 + Math.floor(Math.random() * 3);
            sWords.splice(pos, 0, filler);
            s = sWords.join(' ');
        }
        
        // Sometimes repeat words for emphasis (5% chance)
        if (Math.random() < 0.05) {
            s = s.replace(/\b(very|really|so)\b/g, '$1 $1');
        }
        
        humanized.push(s);
    }
    
    // Phase 5: Final cleanup
    let final = humanized.join(' ');
    
    // Remove any dashes/semicolons/colons
    final = final.replace(/[—–-]/g, ' ');
    final = final.replace(/;/g, '.');
    final = final.replace(/:/g, '.');
    
    // Clean up spacing
    final = final.replace(/\s+/g, ' ');
    final = final.replace(/\.\./g, '.');
    final = final.replace(/\. ([a-z])/g, (m, l) => '. ' + l.toUpperCase());
    
    // Ensure capital at start
    final = final.charAt(0).toUpperCase() + final.slice(1);
    
    // Add period if missing
    if (!final.match(/[.!?]$/)) final += '.';
    
    return final.trim();
}
