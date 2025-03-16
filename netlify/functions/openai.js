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

        let stage1Prompt = `Given the following essay, rephrase it with a ${tone} tone, focusing on varying sentence structures and paragraph organization. Maintain the original meaning and context provided: ${providedContext}. The audience is: ${audience}. The purpose of the text is: ${purpose}. Avoid adding new information. Do not change the vocabulary. Ensure the essay flows naturally. Try to use a mix of short and long sentences. Incorporate natural language idioms and phrases.\n\n${prompt}`;

        let stage3Prompt = `Given the following essay, add subtle human nuances. This includes adding phrases like 'it seems,' 'perhaps,' or 'one might argue.' Introduce occasional, natural-sounding grammatical variations or colloquialisms. Also, add very minor formatting inconsistencies. Avoid making the text appear sloppy. Do not add new information. Keep the length the same. The tone is: ${tone}. The context is: ${providedContext}. The audience is: ${audience}. The purpose is: ${purpose}.\n\n`;

        // Stage 1: Structural and Tone Variation
        const stage1Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage1Prompt }],
            temperature: 0.8, // Increased temperature for more variation
        });

        let stage1Output = stage1Response.choices[0].message.content;

        // Stage 2: Basic Synonym Replacement (Simplified)
        const synonyms = {
            "important": "significant",
            "necessary": "essential",
            "utilize": "use",
            "however": "though",
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
            temperature: 0.7, // Slightly lower temperature for refinement
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
