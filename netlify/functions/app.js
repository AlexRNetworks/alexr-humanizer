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
        
        const humanizedText = naturalRewrite(inputText);
        
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

function naturalRewrite(text) {
    // Simple word replacements - just the basics
    text = text.replace(/\butilize\b/gi, 'use');
    text = text.replace(/\bdemonstrate\b/gi, 'show');
    text = text.replace(/\bsignificant\b/gi, 'big');
    text = text.replace(/\bnumerous\b/gi, 'many');
    text = text.replace(/\bindividuals\b/gi, 'people');
    text = text.replace(/\bfurthermore\b/gi, 'and');
    text = text.replace(/\bmoreover\b/gi, 'and');
    text = text.replace(/\bhowever\b/gi, 'but');
    text = text.replace(/\btherefore\b/gi, 'so');
    text = text.replace(/\bconsequently\b/gi, 'so');
    text = text.replace(/\bestablish\b/gi, 'make');
    text = text.replace(/\bmaintain\b/gi, 'keep');
    text = text.replace(/\brequire\b/gi, 'need');
    text = text.replace(/\bprovide\b/gi, 'give');
    text = text.replace(/\bachieve\b/gi, 'get');
    text = text.replace(/\bobtain\b/gi, 'get');
    text = text.replace(/\bensure\b/gi, 'make sure');
    text = text.replace(/\borganizations\b/gi, 'groups');
    text = text.replace(/\bimplement\b/gi, 'do');
    text = text.replace(/\bfacilitate\b/gi, 'help');
    text = text.replace(/\benhance\b/gi, 'make better');
    text = text.replace(/\bcomprehensive\b/gi, 'complete');
    text = text.replace(/\bfundamental\b/gi, 'basic');
    text = text.replace(/\bcrucial\b/gi, 'important');
    text = text.replace(/\bapproximately\b/gi, 'about');
    text = text.replace(/\bsubstantial\b/gi, 'big');
    text = text.replace(/\bvarious\b/gi, 'different');
    text = text.replace(/\bmultiple\b/gi, 'many');
    
    // Remove formal phrases
    text = text.replace(/in order to/gi, 'to');
    text = text.replace(/due to the fact that/gi, 'because');
    text = text.replace(/it is important to note that/gi, '');
    text = text.replace(/in conclusion/gi, '');
    
    // Basic contractions
    text = text.replace(/\bit is\b/g, "it's");
    text = text.replace(/\bdo not\b/g, "don't");
    text = text.replace(/\bdoes not\b/g, "doesn't");
    text = text.replace(/\bdid not\b/g, "didn't");
    text = text.replace(/\bcannot\b/g, "can't");
    text = text.replace(/\bwould not\b/g, "wouldn't");
    text = text.replace(/\bshould not\b/g, "shouldn't");
    text = text.replace(/\bwill not\b/g, "won't");
    text = text.replace(/\bhave not\b/g, "haven't");
    text = text.replace(/\bhas not\b/g, "hasn't");
    text = text.replace(/\bare not\b/g, "aren't");
    text = text.replace(/\bis not\b/g, "isn't");
    text = text.replace(/\bwas not\b/g, "wasn't");
    text = text.replace(/\bwere not\b/g, "weren't");
    
    // Get sentences
    let sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let result = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let s = sentences[i].trim();
        
        // Connect some sentences with "and" or "because" like natural writing
        if (i > 0 && Math.random() < 0.3) {
            // Remove the period from previous sentence and connect
            if (result.length > 0) {
                let prev = result.pop().replace(/\.$/, '');
                const connectors = [' and ', ' because ', ' so ', ' but '];
                const connector = connectors[Math.floor(Math.random() * connectors.length)];
                s = prev + connector + s.charAt(0).toLowerCase() + s.slice(1);
            }
        }
        
        // Sometimes start with "I think" or "I would"
        if (Math.random() < 0.15 && !s.match(/^I /i)) {
            const starters = ['I think ', 'I would say ', 'I feel like '];
            s = starters[Math.floor(Math.random() * starters.length)] + s.charAt(0).toLowerCase() + s.slice(1);
        }
        
        // Use "like" naturally sometimes
        if (Math.random() < 0.1) {
            // Add "like" before examples
            s = s.replace(/\bfor example\b/gi, 'like');
            s = s.replace(/\bsuch as\b/gi, 'like');
        }
        
        // Repeat some words naturally (good, really, very)
        if (Math.random() < 0.1) {
            s = s.replace(/\bgood\b/g, 'good');  // Sometimes double "good"
            s = s.replace(/\breally\b/g, 'really');
            s = s.replace(/\bvery\b/g, 'very');
        }
        
        result.push(s);
    }
    
    // Join everything
    let final = result.join(' ');
    
    // Clean up
    final = final.replace(/\s+/g, ' ');
    final = final.replace(/\.\./g, '.');
    
    // Fix capitalization after periods
    final = final.replace(/\. ([a-z])/g, (m, l) => '. ' + l.toUpperCase());
    
    // Start with capital
    final = final.charAt(0).toUpperCase() + final.slice(1);
    
    return final.trim();
}
