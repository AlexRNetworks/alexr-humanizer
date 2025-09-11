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

        // Apply advanced humanization for 80%+ success
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

// Advanced humanization for 80%+ success rate
async function advancedHumanize(text) {
    // Core strategy: Complete rewrite, not just word replacement
    
    // Step 1: Break down to core meaning
    const sentences = extractSentences(text);
    const rewritten = [];
    
    // Step 2: Rewrite each sentence from scratch
    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        
        // Completely restructure the sentence
        let newSentence = rewriteSentenceCompletely(sentence, i);
        
        // Add human elements
        newSentence = addHumanElements(newSentence, i, sentences.length);
        
        rewritten.push(newSentence);
    }
    
    // Step 3: Connect with natural flow
    let result = rewritten.join(' ');
    
    // Step 4: Final humanization pass
    result = finalHumanPass(result);
    
    return result;
}

// Extract sentences properly
function extractSentences(text) {
    // Clean up first
    text = text.replace(/\s+/g, ' ').trim();
    
    // Split by sentence endings
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    return sentences.map(s => s.trim());
}

// Completely rewrite each sentence
function rewriteSentenceCompletely(sentence, index) {
    // First, strip it to basic meaning
    let rewritten = sentence;
    
    // Remove all complex vocabulary first
    const complexToSimple = {
        // Business/Tech terms
        'artificial intelligence': 'AI',
        'machine learning': 'computers learning',
        'algorithms': 'computer rules',
        'optimize': 'make better',
        'optimization': 'making things better',
        'leverage': 'use',
        'utilize': 'use',
        'implement': 'put in place',
        'implementation': 'putting it in place',
        'facilitate': 'make easier',
        'enhance': 'improve',
        'establish': 'set up',
        'demonstrate': 'show',
        'significant': 'big',
        'substantial': 'large',
        'considerable': 'a lot of',
        'numerous': 'many',
        'various': 'different',
        'multiple': 'several',
        'comprehensive': 'complete',
        'fundamental': 'basic',
        'essential': 'needed',
        'crucial': 'really important',
        'critical': 'very important',
        'primary': 'main',
        'achieve': 'reach',
        'accomplish': 'finish',
        'obtain': 'get',
        'acquire': 'get',
        'maintain': 'keep',
        'sustain': 'keep going',
        'ensure': 'make sure',
        'require': 'need',
        'indicate': 'show',
        'suggest': 'hint',
        'imply': 'mean',
        'reveal': 'show',
        'exhibit': 'show',
        'display': 'show',
        'present': 'give',
        'provide': 'give',
        'contribute': 'add',
        'constitute': 'make up',
        'comprise': 'include',
        'consist': 'be made of',
        'contain': 'have',
        'incorporate': 'include',
        'integrate': 'combine',
        'combine': 'mix',
        'merge': 'join',
        'transform': 'change',
        'convert': 'turn into',
        'modify': 'change',
        'alter': 'change',
        'adjust': 'fix',
        'adapt': 'change',
        'evolve': 'grow',
        'develop': 'build',
        'progress': 'move forward',
        'advance': 'go forward',
        'proceed': 'go on',
        'continue': 'keep going',
        'persist': 'keep at it',
        'remain': 'stay',
        'retain': 'keep',
        'preserve': 'save',
        'eliminate': 'remove',
        'eradicate': 'get rid of',
        'diminish': 'reduce',
        'decrease': 'lower',
        'reduce': 'cut down',
        'minimize': 'make smaller',
        'maximize': 'make bigger',
        'increase': 'raise',
        'expand': 'grow',
        'extend': 'stretch',
        'broaden': 'widen',
        'amplify': 'make louder',
        'intensify': 'make stronger',
        'strengthen': 'make strong',
        'reinforce': 'back up',
        'emphasize': 'stress',
        'highlight': 'point out',
        'underscore': 'stress',
        'illustrate': 'show',
        'exemplify': 'be an example of',
        'represent': 'stand for',
        'signify': 'mean',
        'denote': 'mean',
        'symbolize': 'represent',
        'characterize': 'describe',
        'define': 'explain',
        'describe': 'tell about',
        'explain': 'make clear',
        'clarify': 'clear up',
        'elaborate': 'add detail',
        'specify': 'be exact',
        'detail': 'list',
        'outline': 'sketch',
        'summarize': 'sum up',
        'conclude': 'end',
        'terminate': 'stop',
        'cease': 'stop',
        'halt': 'stop',
        'discontinue': 'stop',
        'abandon': 'give up',
        'relinquish': 'let go',
        'surrender': 'give up',
        'yield': 'give in',
        'submit': 'turn in',
        'deliver': 'bring',
        'transmit': 'send',
        'communicate': 'talk',
        'convey': 'tell',
        'express': 'say',
        'articulate': 'say clearly',
        'state': 'say',
        'declare': 'announce',
        'proclaim': 'announce',
        'announce': 'tell',
        'inform': 'tell',
        'notify': 'let know',
        'advise': 'tell',
        'recommend': 'suggest',
        'propose': 'suggest',
        'advocate': 'support',
        'promote': 'push',
        'encourage': 'support',
        'stimulate': 'boost',
        'motivate': 'inspire',
        'inspire': 'move',
        'influence': 'affect',
        'impact': 'affect',
        'affect': 'change',
        'shape': 'form',
        'mold': 'shape',
        'determine': 'decide',
        'decide': 'choose',
        'select': 'pick',
        'choose': 'pick',
        'opt': 'choose',
        'prefer': 'like better',
        'favor': 'like',
        'appreciate': 'value',
        'value': 'care about',
        'respect': 'honor',
        'admire': 'look up to',
        'regard': 'see',
        'consider': 'think about',
        'contemplate': 'think about',
        'ponder': 'think about',
        'reflect': 'think',
        'meditate': 'think deeply',
        'deliberate': 'think carefully',
        'evaluate': 'judge',
        'assess': 'check',
        'examine': 'look at',
        'inspect': 'check',
        'investigate': 'look into',
        'explore': 'look at',
        'analyze': 'study',
        'study': 'learn about',
        'research': 'look up',
        'discover': 'find',
        'uncover': 'find',
        'detect': 'find',
        'identify': 'spot',
        'recognize': 'know',
        'acknowledge': 'admit',
        'admit': 'say yes',
        'confess': 'admit',
        'deny': 'say no',
        'reject': 'turn down',
        'refuse': 'say no',
        'decline': 'turn down',
        'accept': 'take',
        'embrace': 'accept',
        'adopt': 'take on',
        'assume': 'take on',
        'undertake': 'take on',
        'initiate': 'start',
        'commence': 'begin',
        'launch': 'start',
        'introduce': 'bring in',
        'present': 'show',
        'offer': 'give',
        'propose': 'suggest',
        'submit': 'hand in',
        'apply': 'use',
        'employ': 'use',
        'utilize': 'use',
        'operate': 'run',
        'function': 'work',
        'perform': 'do',
        'execute': 'do',
        'conduct': 'do',
        'carry out': 'do',
        'complete': 'finish',
        'fulfill': 'complete',
        'satisfy': 'meet',
        'meet': 'reach',
        'exceed': 'go over',
        'surpass': 'beat',
        'outperform': 'do better than',
        'excel': 'do great',
        'succeed': 'win',
        'triumph': 'win',
        'prevail': 'win',
        'overcome': 'beat',
        'conquer': 'beat',
        'defeat': 'beat',
        'master': 'learn',
        'dominate': 'control',
        'control': 'manage',
        'manage': 'handle',
        'handle': 'deal with',
        'address': 'deal with',
        'tackle': 'take on',
        'approach': 'go to',
        'encounter': 'meet',
        'face': 'meet',
        'confront': 'face',
        'challenge': 'test',
        'test': 'try',
        'try': 'attempt',
        'attempt': 'try',
        'endeavor': 'try',
        'strive': 'try hard',
        'struggle': 'fight',
        'battle': 'fight',
        'combat': 'fight',
        'resist': 'fight against',
        'oppose': 'go against',
        'protest': 'object',
        'object': 'disagree',
        'disagree': 'not agree',
        'dispute': 'argue',
        'argue': 'fight',
        'debate': 'discuss',
        'discuss': 'talk about',
        'converse': 'talk',
        'chat': 'talk',
        'speak': 'talk',
        'utter': 'say',
        'voice': 'say',
        'pronounce': 'say',
        'mention': 'say',
        'note': 'point out',
        'observe': 'see',
        'notice': 'see',
        'perceive': 'see',
        'view': 'see',
        'witness': 'see',
        'watch': 'look at',
        'gaze': 'look',
        'stare': 'look hard',
        'glance': 'quick look',
        'glimpse': 'quick look',
        'peek': 'look',
        'peer': 'look closely',
        'scrutinize': 'look closely',
        'monitor': 'watch',
        'supervise': 'watch over',
        'oversee': 'watch',
        'regulate': 'control',
        'govern': 'rule',
        'administer': 'run',
        'direct': 'lead',
        'guide': 'lead',
        'lead': 'be in charge',
        'command': 'order',
        'instruct': 'teach',
        'educate': 'teach',
        'train': 'teach',
        'coach': 'teach',
        'mentor': 'guide',
        'tutor': 'teach',
        'lecture': 'teach',
        'demonstrate': 'show',
        'display': 'show',
        'exhibit': 'show',
        'manifest': 'show',
        'reveal': 'show',
        'expose': 'show',
        'uncover': 'find',
        'disclose': 'tell',
        'divulge': 'tell',
        'share': 'give',
        'distribute': 'hand out',
        'allocate': 'give out',
        'assign': 'give',
        'designate': 'name',
        'appoint': 'name',
        'nominate': 'name',
        'elect': 'choose',
        'vote': 'pick',
        'decide': 'choose',
        'resolve': 'fix',
        'solve': 'fix',
        'remedy': 'fix',
        'repair': 'fix',
        'mend': 'fix',
        'restore': 'bring back',
        'recover': 'get back',
        'retrieve': 'get back',
        'reclaim': 'take back',
        'regain': 'get back',
        'return': 'go back',
        'revert': 'go back',
        'retreat': 'go back',
        'withdraw': 'pull back',
        'retire': 'step down',
        'resign': 'quit',
        'quit': 'stop',
        'leave': 'go',
        'depart': 'leave',
        'exit': 'leave',
        'evacuate': 'leave',
        'flee': 'run away',
        'escape': 'get away',
        'avoid': 'stay away from',
        'evade': 'dodge',
        'dodge': 'avoid',
        'sidestep': 'avoid',
        'bypass': 'go around',
        'circumvent': 'go around',
        'navigate': 'find way',
        'traverse': 'cross',
        'journey': 'travel',
        'travel': 'go',
        'voyage': 'travel',
        'tour': 'travel',
        'visit': 'go to',
        'attend': 'go to',
        'participate': 'take part',
        'engage': 'take part',
        'involve': 'include',
        'include': 'have',
        'encompass': 'include',
        'embrace': 'include',
        'cover': 'include',
        'span': 'cover',
        'range': 'go from',
        'vary': 'change',
        'differ': 'be different',
        'contrast': 'be different',
        'compare': 'look at',
        'match': 'go with',
        'correspond': 'match',
        'relate': 'connect',
        'link': 'connect',
        'connect': 'join',
        'attach': 'stick',
        'bind': 'tie',
        'unite': 'join',
        'combine': 'put together',
        'blend': 'mix',
        'mix': 'combine',
        'fuse': 'join',
        'merge': 'combine',
        'integrate': 'combine',
        'separate': 'split',
        'divide': 'split',
        'split': 'break',
        'break': 'snap',
        'crack': 'break',
        'shatter': 'break',
        'destroy': 'wreck',
        'demolish': 'wreck',
        'ruin': 'wreck',
        'damage': 'hurt',
        'harm': 'hurt',
        'injure': 'hurt',
        'wound': 'hurt',
        'heal': 'get better',
        'cure': 'fix',
        'treat': 'help',
        'aid': 'help',
        'assist': 'help',
        'support': 'help',
        'back': 'support',
        'endorse': 'support',
        'sponsor': 'pay for',
        'fund': 'pay for',
        'finance': 'pay for',
        'invest': 'put money in',
        'spend': 'use money',
        'purchase': 'buy',
        'acquire': 'get',
        'obtain': 'get',
        'gain': 'get',
        'earn': 'make',
        'win': 'get',
        'lose': 'not have',
        'forfeit': 'lose',
        'sacrifice': 'give up',
        'surrender': 'give up',
        'yield': 'give',
        'concede': 'give in',
        'grant': 'give',
        'award': 'give',
        'bestow': 'give',
        'confer': 'give',
        'donate': 'give',
        'contribute': 'give',
        'supply': 'give',
        'furnish': 'give',
        'equip': 'give tools',
        'arm': 'give weapons',
        'prepare': 'get ready',
        'ready': 'prepare',
        'arrange': 'set up',
        'organize': 'set up',
        'plan': 'think ahead',
        'design': 'plan',
        'devise': 'plan',
        'formulate': 'make',
        'create': 'make',
        'produce': 'make',
        'generate': 'make',
        'manufacture': 'make',
        'construct': 'build',
        'build': 'make',
        'erect': 'build',
        'assemble': 'put together',
        'compile': 'put together',
        'compose': 'write',
        'write': 'put down',
        'draft': 'write',
        'pen': 'write',
        'type': 'write',
        'print': 'write',
        'publish': 'put out',
        'release': 'let out',
        'issue': 'put out',
        'distribute': 'hand out',
        'circulate': 'pass around',
        'spread': 'get around',
        'disseminate': 'spread',
        'broadcast': 'send out',
        'transmit': 'send',
        'relay': 'pass on',
        'forward': 'send on',
        'transfer': 'move',
        'transport': 'move',
        'carry': 'take',
        'convey': 'take',
        'deliver': 'bring',
        'ship': 'send',
        'mail': 'send',
        'post': 'send',
        'dispatch': 'send',
        'route': 'send',
        'direct': 'point',
        'steer': 'guide',
        'pilot': 'fly',
        'navigate': 'find way',
        'drive': 'go',
        'ride': 'go on',
        'walk': 'go on foot',
        'run': 'go fast',
        'sprint': 'run fast',
        'jog': 'run slow',
        'march': 'walk',
        'stride': 'walk',
        'step': 'walk',
        'pace': 'walk',
        'stroll': 'walk slow',
        'wander': 'walk around',
        'roam': 'walk around',
        'drift': 'float',
        'float': 'stay up',
        'sink': 'go down',
        'drop': 'fall',
        'fall': 'go down',
        'descend': 'go down',
        'plunge': 'fall fast',
        'dive': 'jump down',
        'jump': 'leap',
        'leap': 'jump',
        'hop': 'jump',
        'skip': 'jump',
        'bound': 'jump',
        'spring': 'jump',
        'vault': 'jump over',
        'hurdle': 'jump over',
        'climb': 'go up',
        'ascend': 'go up',
        'rise': 'go up',
        'mount': 'go up',
        'scale': 'climb',
        'elevate': 'lift',
        'lift': 'pick up',
        'raise': 'lift',
        'hoist': 'lift',
        'boost': 'lift',
        'lower': 'bring down',
        'reduce': 'make less',
        'decrease': 'make less',
        'diminish': 'make less',
        'lessen': 'make less',
        'shrink': 'get smaller',
        'contract': 'get smaller',
        'compress': 'squeeze',
        'squeeze': 'press',
        'press': 'push',
        'push': 'shove',
        'shove': 'push hard',
        'thrust': 'push',
        'propel': 'push',
        'pull': 'drag',
        'drag': 'pull',
        'haul': 'pull',
        'tow': 'pull',
        'draw': 'pull',
        'attract': 'pull',
        'repel': 'push away',
        'repulse': 'push away',
        'reject': 'say no',
        'dismiss': 'send away',
        'discharge': 'let go',
        'fire': 'let go',
        'terminate': 'end',
        'abolish': 'end',
        'cancel': 'stop',
        'annul': 'cancel',
        'void': 'cancel',
        'nullify': 'cancel',
        'negate': 'cancel',
        'reverse': 'turn around',
        'invert': 'flip',
        'flip': 'turn over',
        'turn': 'move',
        'rotate': 'turn',
        'spin': 'turn fast',
        'whirl': 'spin',
        'twirl': 'spin',
        'twist': 'turn',
        'bend': 'curve',
        'curve': 'bend',
        'arch': 'curve',
        'bow': 'bend',
        'flex': 'bend',
        'stretch': 'extend',
        'extend': 'make longer',
        'lengthen': 'make longer',
        'elongate': 'make longer',
        'shorten': 'make shorter',
        'abbreviate': 'shorten',
        'truncate': 'cut short',
        'cut': 'slice',
        'slice': 'cut',
        'chop': 'cut',
        'hack': 'cut',
        'carve': 'cut',
        'sculpt': 'shape',
        'shape': 'form',
        'form': 'make',
        'fashion': 'make',
        'craft': 'make',
        'forge': 'make',
        'mold': 'shape',
        'cast': 'shape',
        
        // Academic phrases
        'furthermore': 'also',
        'moreover': 'plus',
        'additionally': 'and',
        'however': 'but',
        'nevertheless': 'still',
        'nonetheless': 'but still',
        'therefore': 'so',
        'thus': 'so',
        'hence': 'so',
        'consequently': 'because of this',
        'accordingly': 'so',
        'subsequently': 'after that',
        'previously': 'before',
        'ultimately': 'in the end',
        'initially': 'at first',
        'finally': 'lastly',
        'primarily': 'mainly',
        'particularly': 'especially',
        'specifically': 'exactly',
        'generally': 'usually',
        'typically': 'normally',
        'frequently': 'often',
        'occasionally': 'sometimes',
        'rarely': 'almost never',
        'significantly': 'a lot',
        'substantially': 'a lot',
        'considerably': 'quite a bit',
        'approximately': 'about',
        'roughly': 'about',
        'precisely': 'exactly',
        'merely': 'just',
        'simply': 'just',
        'essentially': 'basically',
        'fundamentally': 'at its core',
        'inherently': 'by nature',
        'evidently': 'clearly',
        'obviously': 'of course',
        'apparently': 'it seems',
        'presumably': 'probably',
        'potentially': 'maybe',
        'possibly': 'might be',
        'definitely': 'for sure',
        'certainly': 'for sure',
        'undoubtedly': 'no doubt',
        'absolutely': 'totally',
        'completely': 'fully',
        'entirely': 'all',
        'wholly': 'completely',
        'partially': 'partly',
        'somewhat': 'kind of',
        'fairly': 'pretty',
        'quite': 'pretty',
        'rather': 'kind of',
        'relatively': 'compared to others',
        'comparatively': 'compared to',
        'respectively': 'in that order',
        'collectively': 'together',
        'individually': 'one by one',
        'separately': 'apart',
        'simultaneously': 'at the same time',
        'concurrently': 'at once',
        'alternately': 'taking turns',
        'conversely': 'on the other hand',
        'alternatively': 'or',
        'likewise': 'also',
        'similarly': 'in the same way',
        'equally': 'just as',
        'correspondingly': 'matching',
        'analogously': 'like',
        'contrarily': 'opposite',
        'differently': 'not the same',
        'distinctly': 'clearly',
        'uniquely': 'only',
        'exclusively': 'only',
        'solely': 'only',
        'purely': 'just',
        'strictly': 'only',
        'broadly': 'widely',
        'widely': 'a lot',
        'extensively': 'a lot',
        'thoroughly': 'completely',
        'comprehensively': 'fully',
        'systematically': 'step by step',
        'methodically': 'carefully',
        'strategically': 'with a plan',
        'tactically': 'smartly',
        'practically': 'in real life',
        'theoretically': 'in theory',
        'hypothetically': 'what if',
        'conceptually': 'as an idea',
        'philosophically': 'thinking deep',
        'logically': 'makes sense',
        'rationally': 'with reason',
        'emotionally': 'with feeling',
        'physically': 'with body',
        'mentally': 'in mind',
        'spiritually': 'in spirit',
        'morally': 'right and wrong',
        'ethically': 'right way',
        'legally': 'by law',
        'officially': 'formal',
        'formally': 'proper',
        'informally': 'casual',
        'personally': 'for me',
        'professionally': 'at work',
        'academically': 'in school',
        'scientifically': 'by science',
        'technically': 'by the book',
        'historically': 'in the past',
        'traditionally': 'old way',
        'culturally': 'by culture',
        'socially': 'with people',
        'politically': 'in politics',
        'economically': 'with money',
        'financially': 'money-wise',
        'commercially': 'for business',
        'industrially': 'in factories',
        'technologically': 'with tech',
        'digitally': 'on computers',
        'virtually': 'online',
        'globally': 'worldwide',
        'internationally': 'between countries',
        'nationally': 'in the country',
        'locally': 'nearby',
        'regionally': 'in the area',
        'domestically': 'at home',
        'internally': 'inside',
        'externally': 'outside',
        'centrally': 'in the middle',
        'peripherally': 'on the edge',
        'directly': 'straight',
        'indirectly': 'roundabout',
        'explicitly': 'clearly said',
        'implicitly': 'not said but meant',
        'overtly': 'openly',
        'covertly': 'secretly',
        'publicly': 'in public',
        'privately': 'in private',
        'openly': 'not hidden',
        'secretly': 'hidden',
        'quietly': 'without noise',
        'loudly': 'with noise',
        'silently': 'no sound',
        'verbally': 'with words',
        'visually': 'by sight',
        'audibly': 'by sound',
        'tangibly': 'can touch',
        'intangibly': 'cannot touch',
        'concretely': 'real',
        'abstractly': 'idea only',
        'literally': 'exactly',
        'figuratively': 'not really',
        'metaphorically': 'like something else',
        'symbolically': 'as a symbol',
        'realistically': 'real world',
        
        // Phrases to remove completely
        'it is important to note that': '',
        'it should be noted that': '',
        'it is worth mentioning that': '',
        'as previously mentioned': '',
        'as stated earlier': '',
        'in other words': '',
        'that is to say': '',
        'in essence': '',
        'in fact': '',
        'indeed': '',
        'of course': '',
        'clearly': '',
        'obviously': '',
        'evidently': '',
        'undoubtedly': '',
        'certainly': '',
        'surely': '',
        'arguably': '',
        'presumably': '',
        'supposedly': '',
        'allegedly': '',
        'reportedly': '',
        'apparently': '',
        'seemingly': '',
        'ostensibly': '',
        'purportedly': '',
        'notably': '',
        'remarkably': '',
        'significantly': '',
        'importantly': '',
        'interestingly': '',
        'surprisingly': '',
        'unfortunately': '',
        'fortunately': '',
        'regrettably': '',
        'admittedly': '',
        'granted': '',
        'true': '',
        'in conclusion': '',
        'to conclude': '',
        'in summary': '',
        'to summarize': '',
        'overall': '',
        'in general': '',
        'generally speaking': '',
        'broadly speaking': '',
        'on the whole': '',
        'all in all': '',
        'in the final analysis': '',
        'at the end of the day': '',
        'when all is said and done': '',
    };
    
    // Apply all replacements
    for (const [complex, simple] of Object.entries(complexToSimple)) {
        const regex = new RegExp('\\b' + complex.replace(/[.*+?^${}()|[\]\\]/g, '\\        'realistically': 'real worl') + '\\b', 'gi');
        rewritten = rewritten.replace(regex, simple);
    }
    
    // Now completely restructure the sentence
    rewritten = restructureSentence(rewritten, index);
    
    return rewritten;
}

// Restructure sentences to avoid AI patterns
function restructureSentence(sentence, index) {
    // Remove all transition words at the beginning
    sentence = sentence.replace(/^(Furthermore|Moreover|Additionally|However|Nevertheless|Therefore|Thus|Hence|Consequently|Subsequently|Initially|Finally|Similarly|Likewise|Conversely|Alternatively|Specifically|Generally|Typically|Particularly|Essentially|Fundamentally|Ultimately|Accordingly|Notably|Importantly|Significantly|Interestingly|Surprisingly|Unfortunately|Fortunately|Admittedly|Granted|Indeed|Obviously|Clearly|Evidently|Apparently|Presumably|Arguably),?\s*/gi, '');
    
    // Break up lists (AI loves parallel structure)
    sentence = sentence.replace(/(\w+), (\w+), and (\w+)/g, '$1. Also $2. And $3');
    sentence = sentence.replace(/(\w+ing \w+), (\w+ing \w+), and (\w+ing \w+)/g, '$1. Then $2. Plus $3');
    
    // Convert passive to active voice
    sentence = sentence.replace(/is being (\w+ed)/g, 'gets $1');
    sentence = sentence.replace(/are being (\w+ed)/g, 'get $1');
    sentence = sentence.replace(/was being (\w+ed)/g, 'got $1');
    sentence = sentence.replace(/were being (\w+ed)/g, 'got $1');
    sentence = sentence.replace(/has been (\w+ed)/g, 'got $1');
    sentence = sentence.replace(/have been (\w+ed)/g, 'got $1');
    sentence = sentence.replace(/will be (\w+ed)/g, 'will get $1');
    sentence = sentence.replace(/would be (\w+ed)/g, 'would get $1');
    sentence = sentence.replace(/can be (\w+ed)/g, 'can get $1');
    sentence = sentence.replace(/could be (\w+ed)/g, 'could get $1');
    sentence = sentence.replace(/should be (\w+ed)/g, 'should get $1');
    sentence = sentence.replace(/must be (\w+ed)/g, 'must get $1');
    sentence = sentence.replace(/may be (\w+ed)/g, 'might get $1');
    sentence = sentence.replace(/might be (\w+ed)/g, 'might get $1');
    
    // Break up compound sentences at natural points
    const words = sentence.split(' ');
    if (words.length > 12) {
        // Find conjunctions to break at
        const breakWords = ['which', 'that', 'because', 'since', 'while', 'when', 'where', 'although', 'though', 'whereas', 'if', 'unless', 'until', 'before', 'after', 'as'];
        for (let i = 5; i < words.length - 5; i++) {
            if (breakWords.includes(words[i].toLowerCase())) {
                // Break here
                const part1 = words.slice(0, i).join(' ');
                const part2 = words.slice(i).join(' ');
                sentence = part1 + '. ' + part2.charAt(0).toUpperCase() + part2.slice(1);
                break;
            }
        }
    }
    
    return sentence;
}

// Add human elements based on position
function addHumanElements(sentence, index, totalSentences) {
    // Add contractions
    sentence = sentence.replace(/\bit is\b/g, "it's");
    sentence = sentence.replace(/\bthat is\b/g, "that's");
    sentence = sentence.replace(/\bwhat is\b/g, "what's");
    sentence = sentence.replace(/\bthere is\b/g, "there's");
    sentence = sentence.replace(/\bhere is\b/g, "here's");
    sentence = sentence.replace(/\bdo not\b/g, "don't");
    sentence = sentence.replace(/\bdoes not\b/g, "doesn't");
    sentence = sentence.replace(/\bdid not\b/g, "didn't");
    sentence = sentence.replace(/\bcannot\b/g, "can't");
    sentence = sentence.replace(/\bcould not\b/g, "couldn't");
    sentence = sentence.replace(/\bwould not\b/g, "wouldn't");
    sentence = sentence.replace(/\bshould not\b/g, "shouldn't");
    sentence = sentence.replace(/\bwill not\b/g, "won't");
    sentence = sentence.replace(/\bhave not\b/g, "haven't");
    sentence = sentence.replace(/\bhas not\b/g, "hasn't");
    sentence = sentence.replace(/\bare not\b/g, "aren't");
    sentence = sentence.replace(/\bis not\b/g, "isn't");
    sentence = sentence.replace(/\bwas not\b/g, "wasn't");
    sentence = sentence.replace(/\bwere not\b/g, "weren't");
    
    // Random variations based on position
    const random = Math.random();
    
    // First sentence variations
    if (index === 0) {
        if (random < 0.2) {
            sentence = 'So ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        } else if (random < 0.3) {
            sentence = 'Okay so ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        } else if (random < 0.4) {
            sentence = 'Well ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
    }
    
    // Middle sentences
    else if (index > 0 && index < totalSentences - 1) {
        if (random < 0.15) {
            sentence = 'And ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        } else if (random < 0.25) {
            sentence = 'But ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        } else if (random < 0.35) {
            sentence = 'Also ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        } else if (random < 0.4) {
            sentence = 'Plus ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        } else if (random < 0.45) {
            sentence = 'So ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
    }
    
    // Add "I think" or similar occasionally
    if (Math.random() < 0.12 && !sentence.match(/^(I |We |They |He |She |You )/i)) {
        const phrases = ['I think ', 'I believe ', 'I guess ', 'I feel like ', 'Seems like ', 'Looks like '];
        sentence = phrases[Math.floor(Math.random() * phrases.length)] + sentence.charAt(0).toLowerCase() + sentence.slice(1);
    }
    
    // Add filler words sparingly
    if (Math.random() < 0.08) {
        const fillers = ['basically', 'actually', 'really', 'just', 'like'];
        const filler = fillers[Math.floor(Math.random() * fillers.length)];
        const words = sentence.split(' ');
        if (words.length > 5) {
            const insertPoint = 2 + Math.floor(Math.random() * 3);
            words.splice(insertPoint, 0, filler);
            sentence = words.join(' ');
        }
    }
    
    return sentence;
}

// Final humanization pass
function finalHumanPass(text) {
    // Remove any remaining dashes
    text = text.replace(/—/g, ' ');
    text = text.replace(/–/g, ' ');
    text = text.replace(/-/g, ' ');
    
    // Remove semicolons
    text = text.replace(/;/g, '.');
    
    // Remove colons
    text = text.replace(/:/g, '.');
    
    // Fix double spaces
    text = text.replace(/\s+/g, ' ');
    
    // Fix double periods
    text = text.replace(/\.+/g, '.');
    
    // Ensure proper capitalization
    text = text.replace(/\. ([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
    
    // Start with capital
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Final sentence variation check
    const sentences = text.split(/\. /);
    const finalSentences = [];
    
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i];
        const words = sentence.split(' ').length;
        
        // Ensure variety in sentence lengths
        if (i > 0) {
            const prevWords = finalSentences[i-1].split(' ').length;
            
            // If previous was long, make this shorter
            if (prevWords > 12 && words > 10) {
                const midPoint = Math.floor(words / 2);
                const splitWords = sentence.split(' ');
                finalSentences.push(splitWords.slice(0, midPoint).join(' ') + '.');
                finalSentences.push(splitWords.slice(midPoint).join(' '));
            }
            // If previous was short, this can be normal
            else {
                finalSentences.push(sentence);
            }
        } else {
            finalSentences.push(sentence);
        }
    }
    
    text = finalSentences.join('. ');
    
    // Clean up
    text = text.replace(/\.\./g, '.');
    text = text.replace(/\s+/g, ' ').trim();
    
    // Ensure it ends with a period
    if (!text.match(/[.!?]$/)) {
        text += '.';
    }
    
    return text;
}
