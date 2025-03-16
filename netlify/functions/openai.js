// openai.js
const OpenAI = require('openai');
const readline = require('readline');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

async function humanizeText(text, tone, language) {
  // ... (humanizeText function remains the same)
  try {
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

    return humanizedText;
  } catch (error) {
    console.error('Error humanizing text:', error);
    throw error;
  }

}

// Interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runInteractive() {
  rl.question('Enter text to humanize: ', async (text) => {
    rl.question('Enter tone (e.g., friendly, formal): ', async (tone) => {
      rl.question('Enter language (e.g., english, spanish): ', async (language) => {
        try {
          const humanizedText = await humanizeText(text, tone, language);
          console.log('\nHumanized text:\n', humanizedText);
        } catch (error) {
          console.error('Error:', error);
        }
        rl.close(); // Close the readline interface after completion
      });
    });
  });
}

runInteractive();
