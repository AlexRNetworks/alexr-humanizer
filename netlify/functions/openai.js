const { OpenAI } = require("openai");

exports.handler = async function (event, context) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });

    try {
        const body = JSON.parse(event.body);

        // Advanced systemPrompt generation with context and constraints, NO EXAMPLES
        let systemPrompt = '';
        switch (body.tone) {
            case 'casual':
                systemPrompt = `
                    You are a recent high school graduate writing a ${body.context || 'message'} 
                    to ${body.audience || 'a friend'}. 
                    The purpose of this text is to ${body.purpose || 'share your thoughts and feelings'}. 

                    Write in a casual, conversational tone, 
                    using slightly more complex sentences and vocabulary than a high schooler, 
                    but still maintaining a relaxed and informal tone.
                `;
                break;
            case 'highschool':
                systemPrompt = `
                    You are a high school student working on a ${body.context || 'writing assignment'} 
                    for ${body.audience || 'your teacher'}. 
                    The purpose of this text is to ${body.purpose || 'express your understanding of the topic'}. 

                    Write as you would naturally in this situation, 
                    using simple vocabulary and sentence structures. 
                    Avoid commas and hyphens as much as possible, 
                    and feel free to incorporate slang, abbreviations, and common internet language.
                `;
                break;
            case 'college':
                systemPrompt = `
                    You are a college student writing a ${body.context || 'research paper'} 
                    for ${body.audience || 'your professor'}. 
                    The purpose of this text is to ${body.purpose || 'present your analysis and arguments'}. 

                    Constraints:
                    * Maximum word count: ${body.wordCount || '300 words'}
                    * Tone: ${body.tone || 'Objective and analytical'}
                    * Format: Use proper citations and references according to ${body.citationStyle || 'MLA style'}.

                    Use sophisticated vocabulary, complex sentence structures, 
                    and proper grammar and punctuation. 
                    Focus on conveying information accurately and efficiently.
                `;
                break;
            case 'complex':
                systemPrompt = `
                    You are a professional writer crafting a ${body.context || 'piece of literary fiction'} 
                    for ${body.audience || 'a sophisticated audience'}. 
                    The purpose of this text is to ${body.purpose || 'explore complex themes and emotions'}. 

                    Use highly sophisticated language, complex sentence structures, 
                    and nuanced rhetorical devices. 
                    Create text that sounds natural and engaging, with a human-like rhythm and cadence. 
                    You may incorporate metaphors, similes, and other literary devices.
                `;
                break;
            default:
                systemPrompt = `
                    You are a writer creating a ${body.context || 'piece of text'} 
                    for ${body.audience || 'a general audience'}. 
                    The purpose of this text is to ${body.purpose || 'communicate information clearly and effectively'}. 

                    Write in a neutral, conversational tone, 
                    using a balance of simple and complex sentences. 
                    Ensure proper grammar and punctuation.
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
