const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);
        const { prompt, tone, context, audience, purpose } = body;

        // Construct a detailed system prompt with explicit instructions
        let systemPrompt = `
            Please humanize the following text, strictly adhering to these requirements:

            Tone: ${tone}
            Context: ${context || 'N/A'}
            Audience: ${audience || 'N/A'}
            Purpose: ${purpose || 'N/A'}

            Instructions:

            * Rephrase the text to sound more human-like and natural, as if written by a person.
            * Maintain the original meaning and information; do not add any new content or opinions.
            * Use vocabulary and sentence structures appropriate for the specified tone and audience.
            * Avoid any patterns or phrases that might make the text seem AI-generated.

            Please be very careful to follow these instructions precisely. 
            The goal is to create text that is indistinguishable from human writing.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, // Lower temperature for more focused output
            top_p: 0.7,
            frequency_penalty: 0.6, // Increased penalties to further discourage repetition
            presence_penalty: 0.6 
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
