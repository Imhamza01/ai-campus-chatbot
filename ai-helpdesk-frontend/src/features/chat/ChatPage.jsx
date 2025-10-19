import { useState } from 'react';
import api from '../../services/api';
import endpoints from '../../services/endpoints';

export default function ChatPage() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);

  async function send() {
    if (!text) return;
    const userId = localStorage.getItem('userId');
    const res = await api.post(endpoints.CHAT.SEND, { userId, message: text });
    setMessages(prev => [...prev, { from: 'user', text }, { from: 'bot', text: res.data.response }]);
    setText('');
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="space-y-3">
        {messages.map((m,i)=> <div key={i} className={m.from==='user' ? 'text-right' : ''}>{m.text}</div>)}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-2 rounded bg-card" />
        <button onClick={send} className="px-4 py-2 bg-primary rounded">Send</button>
      </div>
    </div>
  );
}
