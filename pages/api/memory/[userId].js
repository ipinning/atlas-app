
import fs from 'fs';
import path from 'path';

const memoryPath = path.resolve('./data/memory.json');

export default function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const memoryData = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
    const memory = memoryData[userId] || null;
    res.status(200).json({ memory });
  } catch (error) {
    console.error('Memory load error:', error);
    res.status(500).json({ error: 'Failed to load memory' });
  }
}
