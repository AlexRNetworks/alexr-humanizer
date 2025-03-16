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

            1.  **Varied Language:** Use a wide range of vocabulary, including synonyms and idiomatic expressions.
            2.  **Sentence Diversity:** Vary sentence length and structure. Avoid predictable patterns.
            3.  **Subtle Imperfections:** Introduce occasional, natural-sounding grammatical variations or colloquialisms, like a human writer might make.
            4.  **Contextual Awareness:** Deeply understand the context, audience, and purpose to write naturally.
            5.  **Human Flow:** Ensure the text flows naturally, like a conversation or well-written document.
            6.  **Avoid AI Patterns:** Eliminate any phrases or patterns that are common in AI-generated text, such as repetitive phrases, overly structured sentences, or robotic wording.
            7. **Add human elements:** If possible, add small human elements, like interjections, or questions when appropriate.
            8. **Focus on showing, not telling:** Rather than stating facts, try to create a scenario where the facts are implied.
            9. **Use less common word choices:** When appropriate use words that are not the most common version of that word.
            10. **Use more complex sentence structures:** Use compound and complex sentences to add variation.
            11. **Use active voice:** Use active voice when possible.

            Your output must be undetectable by AI detection tools.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.7, // Increased temperature for more variation
            top_p: 0.95, // Increased top_p for more diverse tokens
            frequency_penalty: 0.3, // slight reduction to allow more variation
            presence_penalty: 0.3, // slight reduction to allow more variation
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
