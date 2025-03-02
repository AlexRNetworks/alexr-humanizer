const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY, // Use the correct env variable name
    });

    try {
        const body = JSON.parse(event.body);

        // Add your logic here to generate systemPrompt based on body.tone
        let systemPrompt = '';
        switch (body.tone) {
            case 'casual':
                systemPrompt = 'Humanize the following text in a casual, conversational tone, as if talking to a friend.';
                break;
            case 'complex':
                systemPrompt = 'Humanize the following text using complex sentence structures, advanced vocabulary, and nuanced rhetorical devices.';
                break;
            case 'teenager':
                systemPrompt = 'Humanize the following text using slang, abbreviations, and the typical speech patterns of a teenager.';
                break;
            case 'college':
                systemPrompt = 'Humanize the following text using a sophisticated, academic tone, suitable for a college student.';
                break;
            default:
                systemPrompt = 'Humanize the following text in a neutral, conversational tone.';
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
