// netlify/functions/openai.js
const OpenAI = require('openai');
require('dotenv').config();

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const openai = new OpenAI({
    apiKey: process.env.API_KEY,
  });

  try {
    const { text, tone, language } = JSON.parse(event.body);
    console.log("Received data:", { text, tone, language }); // Debugging

    // Stage 1: Rephrasing
    const stage1Prompt = `Rephrase the following text to make it sound more natural and less formal:\n\n${text}`;
    const stage1Response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: stage1Prompt }],
    });
    console.log("Stage 1 Response:", JSON.stringify(stage1Response, null, 2)); // Log the full response

    try {
      const rephrasedText = stage1Response.choices[0].message.content;
      console.log("rephrased text:", rephrasedText);
    } catch (error) {
      console.error("Error extracting rephrasedText:", error);
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to extract rephrased text" }) };
    }

    // Stage 2: Tone and Language Adjustment
    const stage2Prompt = `Adjust the following text to match the tone "${tone}" and language "${language}":\n\n${rephrasedText}`;
    const stage2Response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: stage2Prompt }],
    });
    console.log("Stage 2 Response:", JSON.stringify(stage2Response, null, 2)); // Log the full response

    try {
      const humanizedText = stage2Response.choices[0].message.content;
      console.log("humanized text:", humanizedText);
      return {
        statusCode: 200,
        body: JSON.stringify({ humanizedText }),
      };
    } catch (error) {
      console.error("Error extracting humanizedText:", error);
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to extract humanized text" }) };
    }

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to process request' }),
    };
  }
};
