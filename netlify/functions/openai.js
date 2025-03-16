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

    // Robust extraction stage 1.
    let rephrasedText = "";
    if (stage1Response && stage1Response.choices && stage1Response.choices.length > 0 && stage1Response.choices[0].message && stage1Response.choices[0].message.content) {
      rephrasedText = stage1Response.choices[0].message.content;
    } else {
      console.error("Error: Stage 1 response structure unexpected");
      return { statusCode: 500, body: JSON.stringify({ error: "Unexpected response from OpenAI Stage 1" }) };
    }

    // Stage 2: Tone and Language Adjustment
    const stage2Prompt = `Adjust the following text to match the tone "${tone}" and language "${language}":\n\n${rephrasedText}`;
    const stage2Response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: stage2Prompt }],
    });

    // Robust extraction stage 2.
    let humanizedText = "";
    if (stage2Response && stage2Response.choices && stage2Response.choices.length > 0 && stage2Response.choices[0].message && stage2Response.choices[0].message.content) {
      humanizedText = stage2Response.choices[0].message.content;
    } else {
      console.error("Error: Stage 2 response structure unexpected");
      return { statusCode: 500, body: JSON.stringify({ error: "Unexpected response from OpenAI Stage 2" }) };
    }

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
