const express = require('express');
const { OpenAI } = require("openai");
// Install the paraphrasing-tool library first: npm install paraphrasing-tool
const paraphrasingTool = require('paraphrasing-tool'); 

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

app.post('/humanize', async (req, res) => {
    const { prompt, tone } = req.body;

    // Fine-tuned systemPrompt generation with explicit instructions and constraints
    let systemPrompt = '';
    switch (tone) {
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

    try {
        let response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {role: "system", content: systemPrompt},
                {role: "user", content: prompt}
            ],
            temperature: 0.6, // Adjust temperature and top_p for more deterministic output
            top_p: 0.7,
            frequency_penalty: 0.5, // Add penalties to discourage repetition
            presence_penalty: 0.5
        });

        let humanizedText = response.choices[0].message.content;

        // Paraphrasing for more human-like output (except for 'complex' tone)
        if (body.tone !== 'complex') {
            humanizedText = paraphrasingTool.paraphrase(humanizedText);
        }

        res.status(200).json(humanizedText);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
