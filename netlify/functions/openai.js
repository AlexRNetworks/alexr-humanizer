const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);
        const { prompt, tone, context, audience, purpose } = body;

        // Revised system prompt
        let systemPrompt = `
            You are an expert humanizer, skilled at transforming text to sound naturally human. 
            Your goal is to rewrite the provided text as if it were written by a person, not an AI.

            Here are the guidelines:

            Tone: ${tone || 'Neutral'}
            Context: ${context || 'General'}
            Audience: ${audience || 'General audience'}
            Purpose: ${purpose || 'To communicate clearly'}

            Instructions:

            1.  **Natural Language:** Rephrase the text using everyday language, avoiding overly formal or technical terms unless necessary.
            2.  **Human Flow:** Ensure the text flows naturally, like a conversation or a well-written email. Use contractions, idioms, and varied sentence structures.
            3.  **Context Awareness:** Pay close attention to the provided context, audience, and purpose to tailor the language appropriately.
            4.  **Avoid AI Patterns:** Eliminate any phrases or patterns that are common in AI-generated text, such as repetitive phrases, overly structured sentences, or robotic wording.
            5.  **Maintain Meaning:** Preserve the original meaning and information of the text. Do not add new information or opinions.
            6. **Add human elements:** If possible, add small human elements, like interjections, or questions when appropriate.
            7. **Focus on showing, not telling:** Rather than stating facts, try to create a scenario where the facts are implied.

            Your output should be indistinguishable from human writing.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.7, // Slightly higher temperature for more creativity
            top_p: 0.9, // Higher top_p to consider more diverse tokens
            frequency_penalty: 0.4, // Reduced penalties for more natural variation
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
