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

        let stage1Prompt = `Rewrite the following essay in a conversational tone, as if you were explaining the topic to a friend. Use contractions, simple vocabulary, and vary sentence lengths. Incorporate rhetorical questions and idioms where appropriate. Maintain the original meaning. Add phrases like 'Let me break this down' where it makes sense.\n\n${prompt}`;

        let stage2Prompt = `Add subtle human nuances to the following essay, enhancing its conversational style. Introduce occasional, natural-sounding grammatical variations or colloquialisms. Also, add very minor formatting inconsistencies. Avoid making the text appear sloppy. Do not add new information. Keep the length the same.\n\n`;

        // Stage 1: Conversational Rephrasing
        const stage1Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage1Prompt }],
            temperature: 0.75,
        });

        let stage1Output = stage1Response.choices[0].message.content;

        // Stage 2: Subtle Nuances and Human Quirks
        stage2Prompt += stage1Output;

        const stage2Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage2Prompt }],
            temperature: 0.65,
        });

        const finalOutput = stage2Response.choices[0].message.content;

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
