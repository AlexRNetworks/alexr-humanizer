const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);
        const { prompt } = body;

        let stage1Prompt = `Rephrase the following text. Use simple vocabulary and short sentences. Do not add or remove content.`;

        const stage1Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage1Prompt }],
            temperature: 0.8,
        });

        let rephrasedText = stage1Response.choices[0].message.content;

        // Deconstruction and Randomization
        rephrasedText = randomizeText(rephrasedText);

        return {
            statusCode: 200,
            body: JSON.stringify(rephrasedText),
        };
    } catch (error) {
        console.error("OpenAI Error:", error);
        return {
            statusCode: 502,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

function randomizeText(text) {
    let sentences = text.split(".");
    sentences = sentences.filter(sentence => sentence.trim() !== ""); // Remove empty sentences

    // Sentence Shuffling
    sentences = shuffleArray(sentences);

    // Word Removal and Repetition
    sentences = sentences.map(sentence => {
        let words = sentence.trim().split(" ");
        words = words.filter(() => Math.random() > 0.05); // Random word removal (5% chance)
        if (Math.random() < 0.1) {
            let randomIndex = Math.floor(Math.random() * words.length);
            if (words[randomIndex]) {
                words.splice(randomIndex, 0, words[randomIndex]); // Random word repetition (10% chance)
            }
        }
        return words.join(" ");
    });

    // Punctuation Randomization
    sentences = sentences.map(sentence => {
        if (Math.random() < 0.2) {
            sentence += "."; // Random period addition (20% chance)
        }
        return sentence;
    });

    // Grammatical "Errors" (Simplified)
    sentences = sentences.map(sentence => {
        if (Math.random() < 0.1) {
            // Simple subject-verb error (very basic)
            sentence = sentence.replace(/is/g, "are").replace(/are/g, "is");
        }
        return sentence;
    });

    return sentences.join(". ");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
