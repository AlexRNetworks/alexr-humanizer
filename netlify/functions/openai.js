// openai.js
const fetch = require('node-fetch');
require('dotenv').config(); // Only needed for local development

// Function to call OpenAI API
async function callOpenAI(messages) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error('API key not found in environment variables.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Function to humanize text using multi-stage approach
async function humanizeText(text, tone, language) {
  try {
    // Stage 1: Rephrasing
    const stage1Prompt = `Rephrase the following text to make it sound more natural and less formal:\n\n${text}`;
    const rephrasedText = await callOpenAI([{ role: 'user', content: stage1Prompt }]);

    // Stage 2: Tone and Language Adjustment
    const stage2Prompt = `Adjust the following text to match the tone "${tone}" and language "${language}":\n\n${rephrasedText}`;
    const humanizedText = await callOpenAI([{ role: 'user', content: stage2Prompt }]);

    return humanizedText;
  } catch (error) {
    console.error('Error humanizing text:', error);
    throw error;
  }
}

// Example usage
async function runExample() {
  const inputText = 'The implementation of the aforementioned algorithm has been successfully executed.';
  const tone = 'friendly';
  const language = 'english';

  try {
    const humanizedText = await humanizeText(inputText, tone, language);
    console.log('Humanized text:', humanizedText);
  } catch (error) {
    console.error('Example failed:', error);
  }
}

runExample();
