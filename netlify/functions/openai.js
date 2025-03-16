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
            You are an expert human rewriter, tasked with making text indistinguishable from human writing to bypass AI detection.

            Tone: ${tone}
            Context: ${providedContext || 'General'}
            Audience: ${audience || 'General audience'}
            Purpose: ${purpose || 'To communicate clearly'}

            Instructions:

            1.  **Varied Language:** Use a wide range of vocabulary, including synonyms, less common words, and idiomatic expressions.
            2.  **Sentence Diversity:** Vary sentence length and structure significantly. Avoid predictable patterns.
            3.  **Subtle Imperfections:** Introduce occasional, natural-sounding grammatical variations, colloquialisms, or slightly awkward phrasing.
            4.  **Contextual Awareness:** Deeply understand the context, audience, and purpose to write naturally.
            5.  **Human Flow:** Ensure the text flows naturally, like a conversation or well-written document.
            6.  **Avoid AI Patterns:** Eliminate any phrases or patterns that are common in AI-generated text.
            7.  **Add human elements:** Add small human elements, like interjections, questions, or changes in topic.
            8.  **Focus on showing, not telling:** Create scenarios where facts are implied.
            9.  **Increase Perplexity:** Use less predictable word choices and phrasing.
            10. **Stylistic Variation:** Vary the tone and style within the text.
            11. **Tone Adherence:**
                * **casual:** Use contractions, slang, and informal language.
                * **complex:** Use sophisticated vocabulary and complex sentence structures.
                * **college:** Focus on academic language and clarity.
                * **highschool:** Use a mix of casual and formal language.
            12. **Use active voice:** use active voice when possible.

            Your output must be undetectable by AI detection tools.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.75, // Increased temperature for more variation
            top_p: 0.95, // Increased top_p for more diverse tokens
            frequency_penalty: 0.2, // Further reduced penalties for more natural variation
            presence_penalty: 0.2, // Further reduced penalties for more natural variation
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
