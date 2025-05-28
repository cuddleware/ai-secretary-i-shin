// pages/api/chat.js

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // 🔹 RAG用：spec.md を読み込む
  const filePath = path.join(process.cwd(), 'docs', 'i-shin_CompanyInfo.md');
  const context = fs.readFileSync(filePath, 'utf-8');

  // 🔹 ユーザーの直近の質問を取得
  const userMessage = messages[messages.length - 1]?.content || '';

  // 🔹 system プロンプトで RAGスタイルに指示
  const promptMessages = [
    {
      role: 'system',
      content: `以下は、i-shin株式会社に関する社内情報です。この内容を元に、質問に答えてください。\n\n${context}`,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: promptMessages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '（応答が取得できませんでした）';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('[API ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
