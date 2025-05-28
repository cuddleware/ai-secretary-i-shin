// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, newMessage] }),
    });

    const data = await res.json();
    const reply = { role: 'assistant', content: data.reply };
    setMessages((prev) => [...prev, reply]);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>AI秘書 試作版</h1>

      <div style={{ minHeight: 300, border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{msg.role === 'user' ? 'あなた' : 'AI'}：</strong>
            {msg.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="質問を入力..."
        style={{ width: '70%', padding: 8, fontSize: 16 }}
      />
      <button onClick={sendMessage} style={{ padding: 10, marginLeft: 10 }}>
        送信
      </button>
    </div>
  );
}
