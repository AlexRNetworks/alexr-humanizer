const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);
        const { prompt, tone, context: providedContext, audience, purpose } = body;

        const validTones = ["casual", "highschool", "complex", "college"];
        if (!validTones.includes(tone)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid tone. Must be one of: casual, highschool, complex, college." }),
            };
        }

        let stage1Prompt = `Rephrase the following essay. Use simple vocabulary and short, direct sentences. Minor grammatical errors and awkward phrasing are acceptable. Use repetitive phrasing and basic explanations. Explain concepts in a straightforward, step-by-step manner. Maintain the original meaning and context: ${providedContext}. The audience is: ${audience}. The purpose of the text is: ${purpose}.\n\n${prompt}`;

        let stage3Prompt = `Add subtle human nuances to the following essay. Use simple vocabulary and short, direct sentences. Minor grammatical errors and awkward phrasing are acceptable. Use repetitive phrasing and basic explanations. Explain concepts in a straightforward, step-by-step manner. The tone is: ${tone}. The context is: ${providedContext}. The audience is: ${audience}. The purpose is: ${purpose}.\n\n`;

        // Stage 1: Structural and Tone Variation
        const stage1Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage1Prompt }],
            temperature: 0.8,
        });

        let stage1Output = stage1Response.choices[0].message.content;

        // Stage 2: Basic Synonym Replacement (Simplified)
        const synonyms = {
            "important": "big",
            "necessary": "needed",
            "utilize": "use",
            "however": "but",
        };

        let stage2Output = stage1Output;
        for (const word in synonyms) {
            const regex = new RegExp(`\\b${word}\\b`, "gi");
            stage2Output = stage2Output.replace(regex, synonyms[word]);
        }

        // Stage 3: Human Nuances and Inconsistencies
        stage3Prompt += stage2Output;

        const stage3Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage3Prompt }],
            temperature: 0.7,
        });

        const finalOutput = stage3Response.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify(finalOutput),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
