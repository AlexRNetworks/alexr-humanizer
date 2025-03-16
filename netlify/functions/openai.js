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

        let systemPrompt = `
            You are an expert academic essay humanizer, tasked with making essays indistinguishable from human writing to bypass AI detection.

            Tone: ${tone} (essay context)
            Context: ${providedContext || 'Academic essay'}
            Audience: ${audience || 'Academic audience'}
            Purpose: ${purpose || 'To present an argument or analysis'}

            Instructions:

            1.  **Academic Tone:** Maintain a formal and objective tone, but avoid overly rigid language.
            2.  **Argumentative Flow:** Ensure a logical flow with clear transitions and supporting evidence.
            3.  **Sentence Diversity:** Use a mix of sentence structures to avoid predictability.
            4.  **Sophisticated Vocabulary:** Employ academic vocabulary, but avoid repetition.
            5.  **Subtle Nuances:** Introduce hedging, qualifying statements, or rhetorical questions.
            6.  **Human-Like Errors:** Introduce occasional, natural-sounding grammatical variations or colloquialisms.
            7.  **Avoid AI Patterns:** Eliminate AI-generated phrases and patterns.
            8.  **Varied Language:** Use diverse vocabulary and phrasing.
            9.  **Maintain Meaning:** Preserve the original meaning and arguments.
            10. **Contextual Awareness:** Understand the context and purpose of the essay.
            11. **Increase Perplexity:** Use less predictable word choices and phrasing.
            12. **Stylistic Variation:** Vary the tone and style within the essay.
            13. **Use active voice:** use active voice when possible.

            Your output must be undetectable by AI detection tools and suitable for academic submission.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            top_p: 0.95,
            frequency_penalty: 0.2,
            presence_penalty: 0.2,
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.choices[0].message.content),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
