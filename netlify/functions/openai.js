// netlify/functions/openai.js
const OpenAI = require('openai');
require('dotenv').config();

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    console.log("Method not POST");
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const openai = new OpenAI({
    apiKey: process.env.API_KEY,
  });

  if (!openai.apiKey) {
    console.error("API Key is missing!");
    return { statusCode: 500, body: JSON.stringify({ error: 'API Key is missing!' }) };
  }

  try {
    const requestBody = event.body;
    console.log("Request Body:", requestBody); // Log the raw body

    const { text, tone, language } = JSON.parse(requestBody);
    console.log("Parsed Data:", { text, tone, language });

    // Stage 1: Rephrasing
    const stage1Prompt = `Rephrase the following text to make it sound more natural and less formal:\n\n${text}`;
    console.log("Stage 1 Prompt:", stage1Prompt);

    const stage1Response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: stage1Prompt }],
    });

    console.log("Stage 1 Response (Full):", JSON.stringify(stage1Response, null, 2));

    try {
      const rephrasedText = stage1Response.choices[0].message.content;
      console.log("Rephrased Text:", rephrasedText);
    } catch (extractError) {
      console.error("Error extracting rephrasedText:", extractError);
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to extract rephrased text: " + extractError.message }) };
    }

    // Stage 2: Tone and Language Adjustment
    const stage2Prompt = `Adjust the following text to match the tone "${tone}" and language "${language}":\n\n${rephrasedText}`;
    console.log("Stage 2 Prompt:", stage2Prompt);

    const stage2Response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: stage2Prompt }],
    });

    console.log("Stage 2 Response (Full):", JSON.stringify(stage2Response, null, 2));

    try {
      const humanizedText = stage2Response.choices[0].message.content;
      console.log("Humanized Text:", humanizedText);
      return {
        statusCode: 200,
        body: JSON.stringify({ humanizedText }),
      };
    } catch (extractError) {
      console.error("Error extracting humanizedText:", extractError);
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to extract humanized text: " + extractError.message }) };
    }

  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Failed to process request: " + error.message }),
    };
  }
};
