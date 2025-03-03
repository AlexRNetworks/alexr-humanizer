const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);

        // Fine-tuned systemPrompt generation with explicit instructions and constraints
        let systemPrompt = '';
        switch (body.tone) {
            case 'casual':
                systemPrompt = `
                    Humanize this text as if a recent high school graduate is writing to a friend. 
                    Keep the same meaning but make it sound casual and relatable. 
                    
                    Specifically:
                    * Use common slang and abbreviations.
                    * Shorten sentences where possible.
                    * Replace some words with synonyms.

                    IMPORTANT: 
                    * Do not add any extra information or opinions.
                    * Do not change the overall meaning or structure of the text.
                `;
                break;
            case 'highschool':
                systemPrompt = `
                    Humanize this text as if a high school student is writing it. 
                    Use simple words and sentences, slang, and abbreviations. 

                    Specifically:
                    * Use very simple vocabulary.
                    * Keep sentences short and to the point.
                    * Avoid using commas or hyphens.

                    IMPORTANT: 
                    * Do not add any extra information or opinions.
                    * Do not change the overall meaning or structure of the text.
                `;
                break;
            case 'college':
                systemPrompt = `
                    Humanize this text for a college-level audience. 
                    Use sophisticated vocabulary and proper grammar. 

                    Specifically:
                    * Vary sentence structure and length.
                    * Use transitional phrases.
                    * Ensure clear and concise language.

                    IMPORTANT: 
                    * Do not add any extra information or opinions.
                    * Do not change the overall meaning or structure of the text.
                `;
                break;
            case 'complex':
                systemPrompt = `
                    Humanize this text using complex language and literary devices, 
                    making it sound like professional writing. 

                    Specifically:
                    * Use metaphors, similes, and analogies.
                    * Employ a variety of sentence structures.
                    * Create a distinct voice and tone.

                    IMPORTANT: 
                    * Do not add any extra information or opinions.
                    * Do not change the overall meaning or structure of the text.
                `;
                break;
            default:
                systemPrompt = `
                    Humanize this text in a neutral, conversational tone. 

                    Specifically:
                    * Ensure clarity and readability.
                    * Use a variety of sentence structures.
                    * Maintain a consistent tone.

                    IMPORTANT: 
                    * Do not add any extra information or opinions.
                    * Do not change the overall meaning or structure of the text.
                `;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4", // You can experiment with other models like "text-davinci-003"
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: body.prompt }
            ],
            temperature: 0.7, // Adjust temperature and top_p for more deterministic output
            top_p: 0.8,
            frequency_penalty: 0.5, // Add penalties to discourage repetition
            presence_penalty: 0.5 
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
