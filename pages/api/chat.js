
import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';

const memoryPath = path.resolve('./data/memory.json');
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { userId, messages } = req.body;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
    });

    const reply = completion.data.choices[0].message;

    const summary = messages
      .slice(-10)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const memoryData = fs.existsSync(memoryPath)
      ? JSON.parse(fs.readFileSync(memoryPath, 'utf8'))
      : {};

    memoryData[userId] = summary;
    fs.writeFileSync(memoryPath, JSON.stringify(memoryData, null, 2));

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
