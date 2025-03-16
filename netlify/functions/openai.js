const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);
        const { prompt, tone, context: providedContext, audience, purpose } = body;

        // Validate tone input
        const validTones = ["casual", "highschool", "complex", "college"];
        if (!validTones.includes(tone)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid tone. Must be one of: casual, highschool, complex, college." }),
            };
        }

        let systemPrompt = `
            You are an expert at transforming text to sound naturally human, while respecting the specified tone.

            Here are the guidelines:

            Tone: ${tone}
            Context: ${providedContext || 'General'}
            Audience: ${audience || 'General audience'}
            Purpose: ${purpose || 'To communicate clearly'}

            Instructions:

            1.  **Natural Language:** Rephrase the text using natural, everyday language appropriate for the specified tone. Avoid overly formal or robotic phrases.
            2.  **Sentence Flow:** Ensure the text flows smoothly and naturally. Use varied sentence structures and avoid overly long or complex sentences.
            3.  **Tone Adherence:** Strictly adhere to the specified tone:
                * **casual:** Use contractions, conversational language, and a relaxed style.
                * **highschool:** Use language appropriate for a high school student, with a mix of casual and slightly more formal elements.
                * **complex:** Use sophisticated vocabulary and complex sentence structures, but maintain natural flow.
                * **college:** Use academic language with appropriate formality, clarity, and conciseness.
            4.  **Avoid Exaggerated Humanisms:** Do not add excessive conversational fillers, interjections, or overly simplistic analogies. Focus on making the core language natural.
            5.  **Maintain Meaning:** Preserve the original meaning and information of the text. Do not add new information or opinions.
            6.  **Subtle Human Elements:** Introduce subtle human elements through word choice and sentence structure.
            7.  **Avoid AI Patterns:** Eliminate any phrases or patterns that are common in AI-generated text.

            Your output should be indistinguishable from human writing while respecting the set tone.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.6,
            top_p: 0.9,
            frequency_penalty: 0.4,
            presence_penalty: 0.4,
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
