const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);

        // Simplified systemPrompt generation with clear instructions
        let systemPrompt = '';
        switch (body.tone) {
            case 'casual':
                systemPrompt = `
                    Humanize this text as if a recent high school graduate is writing to a friend. 
                    Keep the same meaning but make it sound casual and relatable. 
                    IMPORTANT: Do not add any extra information or opinions.
                `;
                break;
            case 'highschool':
                systemPrompt = `
                    Humanize this text as if a high school student is writing it. 
                    Use simple words and sentences, slang, and abbreviations. 
                    IMPORTANT: Do not add any extra information or opinions.
                `;
                break;
            case 'college':
                systemPrompt = `
                    Humanize this text for a college-level audience. 
                    Use sophisticated vocabulary and proper grammar. 
                    IMPORTANT: Do not add any extra information or opinions.
                `;
                break;
            case 'complex':
                systemPrompt = `
                    Humanize this text using complex language and literary devices, 
                    making it sound like professional writing. 
                    IMPORTANT: Do not add any extra information or opinions.
                `;
                break;
            default:
                systemPrompt = `
                    Humanize this text in a neutral, conversational tone. 
                    IMPORTANT: Do not add any extra information or opinions.
                `;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: body.prompt }
            ],
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
