const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);
        const { prompt } = body;

        let stage1Prompt = `Pretend you are a high school student writing a quick English essay. You're trying to explain the following topic but you don't really know much about it so you're just writing down what you can remember. Use simple words and short sentences. Maybe have a run-on sentence or two. Don't go into full detail just give a general idea. Make sure there are no question marks few commas and no hyphens. Here are some examples of how to write:

        Example 1: "Recycling is like when you take old stuff and make it new again its good for the earth cause it stops trash from piling up and you can use the old stuff to make new things like paper or bottles."

        Example 2: "Fast food is when you get food real quick like burgers and fries its cheap and tastes good but its not very healthy if you eat it all the time it can make you fat and sick."

        Now write an essay on this topic:

        ${prompt}`;

        const stage1Response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: stage1Prompt }],
            temperature: 1.0,
        });

        const finalOutput = stage1Response.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify(finalOutput),
        };
    } catch (error) {
        console.error("OpenAI Error:", error);
        return {
            statusCode: 502,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
