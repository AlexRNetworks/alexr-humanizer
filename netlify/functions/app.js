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
        
        const humanizedText = humanize(inputText);
        
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

function humanize(text) {
    // Step 1: Critical vocabulary swaps (only the most detected words)
    text = text.replace(/\b(utilize|utilized|utilizing)\b/gi, 'use');
    text = text.replace(/\b(implement|implemented|implementing)\b/gi, 'do');
    text = text.replace(/\b(demonstrate|demonstrated|demonstrates)\b/gi, 'show');
    text = text.replace(/\b(significant|significantly)\b/gi, 'big');
    text = text.replace(/\b(substantial|substantially)\b/gi, 'large');
    text = text.replace(/\b(fundamental|fundamentally)\b/gi, 'basic');
    text = text.replace(/\b(comprehensive|comprehensively)\b/gi, 'complete');
    text = text.replace(/\b(facilitate|facilitated|facilitates)\b/gi, 'help');
    text = text.replace(/\b(enhance|enhanced|enhancing)\b/gi, 'improve');
    text = text.replace(/\b(establish|established|establishing)\b/gi, 'set up');
    text = text.replace(/\b(individuals)\b/gi, 'people');
    text = text.replace(/\b(organizations)\b/gi, 'groups');
    text = text.replace(/\b(furthermore|moreover|additionally)\b/gi, '');
    text = text.replace(/\b(however|nevertheless|nonetheless)\b/gi, 'but');
    text = text.replace(/\b(therefore|consequently|thus|hence)\b/gi, 'so');
    text = text.replace(/\b(approximately)\b/gi, 'about');
    text = text.replace(/\b(numerous)\b/gi, 'many');
    text = text.replace(/\b(various)\b/gi, 'different');
    text = text.replace(/\b(ensure)\b/gi, 'make sure');
    text = text.replace(/\b(require|required|requires)\b/gi, 'need');
    text = text.replace(/\b(provide|provided|provides)\b/gi, 'give');
    text = text.replace(/\b(maintain|maintained|maintains)\b/gi, 'keep');
    text = text.replace(/\b(achieve|achieved|achieves)\b/gi, 'get');
    text = text.replace(/\b(obtain|obtained)\b/gi, 'get');
    text = text.replace(/\b(crucial)\b/gi, 'important');
    text = text.replace(/\b(essential)\b/gi, 'needed');
    text = text.replace(/\b(enables)\b/gi, 'lets');
    text = text.replace(/\b(allows)\b/gi, 'lets');
    text = text.replace(/\b(comprises)\b/gi, 'has');
    text = text.replace(/\b(constitutes)\b/gi, 'is');
    text = text.replace(/\b(represents)\b/gi, 'shows');
    text = text.replace(/\b(indicates)\b/gi, 'shows');
    text = text.replace(/\b(suggests)\b/gi, 'hints');
    text = text.replace(/\b(implies)\b/gi, 'means');
    text = text.replace(/\b(involves)\b/gi, 'has');
    text = text.replace(/\b(encompasses)\b/gi, 'covers');
    text = text.replace(/\b(incorporates)\b/gi, 'adds');
    text = text.replace(/\b(emphasizes)\b/gi, 'stresses');
    text = text.replace(/\b(highlights)\b/gi, 'points out');
    text = text.replace(/\b(underscores)\b/gi, 'shows');
    text = text.replace(/\b(illustrates)\b/gi, 'shows');
    text = text.replace(/\b(exemplifies)\b/gi, 'shows');
    text = text.replace(/\b(subsequently)\b/gi, 'then');
    text = text.replace(/\b(ultimately)\b/gi, 'finally');
    text = text.replace(/\b(primarily)\b/gi, 'mainly');
    text = text.replace(/\b(particularly)\b/gi, 'especially');
    text = text.replace(/\b(specifically)\b/gi, '');
    text = text.replace(/\b(essentially)\b/gi, 'basically');
    text = text.replace(/\b(generally)\b/gi, 'usually');
    text = text.replace(/\b(typically)\b/gi, 'often');
    text = text.replace(/\b(frequently)\b/gi, 'often');
    text = text.replace(/\b(occasionally)\b/gi, 'sometimes');
    text = text.replace(/\b(rarely)\b/gi, 'not often');
    text = text.replace(/\b(optimal)\b/gi, 'best');
    text = text.replace(/\b(multiple)\b/gi, 'many');
    text = text.replace(/\b(sufficient)\b/gi, 'enough');
    text = text.replace(/\b(adequate)\b/gi, 'enough');
    text = text.replace(/\b(appropriate)\b/gi, 'right');
    text = text.replace(/\b(relevant)\b/gi, 'related');
    text = text.replace(/\b(evident)\b/gi, 'clear');
    text = text.replace(/\b(apparent)\b/gi, 'clear');
    text = text.replace(/\b(obvious)\b/gi, 'clear');
    
    // Remove AI phrases
    text = text.replace(/it is important to note that/gi, '');
    text = text.replace(/it should be noted that/gi, '');
    text = text.replace(/it is worth mentioning that/gi, '');
    text = text.replace(/in conclusion/gi, '');
    text = text.replace(/in summary/gi, '');
    text = text.replace(/overall/gi, '');
    text = text.replace(/in order to/gi, 'to');
    text = text.replace(/due to the fact that/gi, 'because');
    text = text.replace(/in the event that/gi, 'if');
    
    // Step 2: Sentence restructuring
    let sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    sentences = sentences.map(s => s.trim());
    
    const result = [];
    for (let i = 0; i < sentences.length; i++) {
        let s = sentences[i];
        
        // Remove leading transitions
        s = s.replace(/^(Furthermore|Moreover|Additionally|However|Nevertheless|Therefore|Thus|Hence|Consequently|Subsequently|Initially|Finally|Similarly|Likewise|Conversely|Alternatively|Specifically|Generally|Typically|Particularly|Essentially|Fundamentally|Ultimately|Accordingly),?\s*/i, '');
        
        // Contractions
        s = s.replace(/\bit is\b/g, "it's");
        s = s.replace(/\bthat is\b/g, "that's");
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
        s = s.replace(/\bare not\b/g, "aren't");
        s = s.replace(/\bis not\b/g, "isn't");
        s = s.replace(/\bwas not\b/g, "wasn't");
        s = s.replace(/\bwere not\b/g, "weren't");
        
        // Break parallel lists
        s = s.replace(/(\w+), (\w+), and (\w+)/g, '$1. Also $2. Plus $3');
        
        // Convert passive to active
        s = s.replace(/is being (\w+ed)/g, 'gets $1');
        s = s.replace(/are being (\w+ed)/g, 'get $1');
        s = s.replace(/has been (\w+ed)/g, 'got $1');
        s = s.replace(/have been (\w+ed)/g, 'got $1');
        
        // Split long sentences
        const words = s.split(' ');
        if (words.length > 15) {
            const mid = Math.floor(words.length / 2);
            const connectors = ['which', 'that', 'because', 'since', 'when'];
            let splitPoint = -1;
            
            for (let j = mid - 3; j < mid + 3; j++) {
                if (connectors.includes(words[j]?.toLowerCase())) {
                    splitPoint = j;
                    break;
                }
            }
            
            if (splitPoint > 0) {
                result.push(words.slice(0, splitPoint).join(' ') + '.');
                s = words.slice(splitPoint).join(' ');
                s = s.charAt(0).toUpperCase() + s.slice(1);
            }
        }
        
        // Add human elements based on position
        const r = Math.random();
        if (i === 0 && r < 0.3) {
            s = ['So ', 'Well ', 'Okay so '][Math.floor(r * 3)] + s.charAt(0).toLowerCase() + s.slice(1);
        } else if (i > 0 && r < 0.25) {
            s = ['And ', 'But ', 'Also ', 'Plus '][Math.floor(r * 4)] + s.charAt(0).toLowerCase() + s.slice(1);
        }
        
        // Add "I think" occasionally
        if (Math.random() < 0.1 && !s.match(/^(I |We |You |They |He |She |So |And |But )/i)) {
            s = 'I think ' + s.charAt(0).toLowerCase() + s.slice(1);
        }
        
        result.push(s);
    }
    
    // Step 3: Final cleanup
    let final = result.join(' ');
    
    // Remove dashes
    final = final.replace(/[—–-]/g, ' ');
    
    // Fix punctuation
    final = final.replace(/\s+/g, ' ');
    final = final.replace(/\.\./g, '.');
    final = final.replace(/\. ([a-z])/g, (m, l) => '. ' + l.toUpperCase());
    
    // Ensure variety in consecutive sentences
    const finalSentences = final.split(/\. /);
    const varied = [];
    let lastLength = 0;
    
    for (let s of finalSentences) {
        const len = s.split(' ').length;
        // Force variety: if last was long, make short
        if (lastLength > 12 && len > 10) {
            const mid = Math.floor(len / 2);
            const words = s.split(' ');
            varied.push(words.slice(0, mid).join(' ') + '.');
            varied.push(words.slice(mid).join(' '));
            lastLength = mid;
        } else {
            varied.push(s);
            lastLength = len;
        }
    }
    
    return varied.join(' ').trim();
}
