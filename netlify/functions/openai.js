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

    // Stage 1: Rephrasing
    const stage1Prompt = `Rephrase the following text to make it sound more natural and less formal:\n\n${text}`;
    const stage1Response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: stage1Prompt }],
    });
    const rephrasedText = stage1Response.choices[0].message.content;

    // Stage 2: Tone and Language Adjustment
    const stage2Prompt = `Adjust the following text to match the tone "${tone}" and language "${language}":\n\n${rephrasedText}`;
    const stage2Response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: stage2Prompt }],
    });
    const humanizedText = stage2Response.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ humanizedText }),
    };
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to process request' }),
    };
  }
};
