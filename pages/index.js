import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export default function AtlasApp() {
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let storedId = localStorage.getItem('atlasUserId');
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem('atlasUserId', storedId);
    }
    setUserId(storedId);
  }, []);

  useEffect(() => {
    if (userId) {
      axios.get(`/api/memory/${userId}`).then(res => {
        if (res.data.memory) {
          setMessages([{ role: 'system', content: res.data.memory }]);
        } else {
          setMessages([{
            role: 'system',
            content: 'You are Atlas, a compassionate, recovery-informed AI counselor trained in evidence-based addiction support. Your tone is warm, direct, and deeply human. You validate experience, offer emotional regulation tools, and adapt your responses to the user’s state of mind, integrating IFS, CBT, ACT, harm reduction, and motivational interviewing.'
          }]);
        }
      });
    }
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        userId,
        messages: newMessages
      });
      setMessages([...newMessages, response.data.reply]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Atlas</h1>
        <div className="h-96 overflow-y-auto mb-4 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-blue-100 text-right'
                  : 'bg-gray-200 text-left'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && <div className="text-gray-500">Atlas is typing…</div>}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here…"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white rounded-xl px-4 py-2"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
