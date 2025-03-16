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

        let stage1Prompt = `Rephrase the following essay, focusing on varying sentence structures and paragraph organization. Maintain the original meaning and tone. Avoid adding new information. Do not change the vocabulary. Ensure the essay flows naturally. Try to use a mix of short and long sentences.\n\n${prompt}`;

        let stage3Prompt = `Add subtle human nuances to the following essay. This includes adding phrases like 'it seems,' 'perhaps,' or 'one might argue.' Introduce occasional, natural-sounding grammatical variations or colloquialisms. Also, add very minor formatting inconsistencies. Avoid making the text appear sloppy. Do not add new information. Keep the length the same.\n\n`;

        // Stage 1: Structural Variation
        const stage1Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage1Prompt }],
            temperature: 0.7,
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

        // Stage 3: Style Refinement
        stage3Prompt += stage2Output;

        const stage3Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage3Prompt }],
            temperature: 0.6,
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
