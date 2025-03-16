const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);
        const { prompt } = body;

        let stage1Prompt = `Revise the following text to sound like a student explaining a concept. Use simple vocabulary short sentences and repetitive phrases. Include consistent grammatical errors and awkward phrasing. Do not use commas or question marks. Make the text sound unpolished and imperfect with abrupt shifts in thought. Here are some examples of the desired style:

        Example 1: "Recycling is a good thing for our world. The throwing away of bottles cans and paper is the enormous to make our land dirty and bad. To begin with bottles is found in almost every area of our homes. From the start of when we drink from a bottle to when we throw it away we are adding to trash."

        Example 2: "Fast food is a big problem for peoples health. The eating of hamburgers fries and soda is the enormous to make kids fat and sick. To begin with hamburgers is found in almost every area of our eating."

        Now revise the following text:

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
