const { VertexAI } = require("@google-cloud/vertexai");

exports.handler = async function (event, context) {
    try {
        const body = JSON.parse(event.body);
        const { prompt } = body;

        const vertexAI = new VertexAI({
            project: process.env.GCP_PROJECT_ID,
            location: process.env.GCP_LOCATION,
            apiKey: process.env.API_KEY,
        });

        const model = vertexAI.getGenerativeModel({
            model: "gemini-flash-2",
        });

        const generationConfig = {
            maxOutputTokens: 1024,
            temperature: 1.0,
            topP: 1,
        };

        const safetySettings = [
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE",
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE",
            },
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE",
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE",
            },
        ];

        const request = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        };

        const response = await model.generateContent(request);
        let responseText = response.response.candidates[0].content.parts[0].text;

        // Post-processing for humanization (simplified)
        responseText = randomizeText(responseText);

        return {
            statusCode: 200,
            body: JSON.stringify(responseText),
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

function randomizeText(text) {
    let sentences = text.split(".");
    sentences = sentences.filter(sentence => sentence.trim() !== "");

    sentences = sentences.map(sentence => {
        let words = sentence.trim().split(" ");
        if (Math.random() < 0.1) {
            let randomIndex = Math.floor(Math.random() * words.length);
            if (words[randomIndex]) {
                words.splice(randomIndex, 0, words[randomIndex]);
            }
        }
        return words.join(" ");
    });

    sentences = sentences.map(sentence => {
        if (Math.random() < 0.1) {
            sentence = sentence.replace(/is/g, "are").replace(/are/g, "is");
        }
        if (Math.random() < 0.05){
            sentence = sentence.replace(/he/g, "they").replace(/she/g, "it");
        }
        return sentence;
    });

    return sentences.join(". ");
}
