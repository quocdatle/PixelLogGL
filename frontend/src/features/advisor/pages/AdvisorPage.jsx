import React, { useState } from 'react';
import api from '../../../services/api';

// Hàm gọi API tích hợp trực tiếp tránh lỗi import đường dẫn
const sendAdvisorMessage = async (message) => {
  const response = await api.post('/advisor/chat', { message });
  return response.data;
};

export default function AdvisorPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Chào bạn! Tôi là Cố vấn AI Claude của PixelLog. Bạn muốn tôi gợi ý tựa game nào chuẩn gu hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const data = await sendAdvisorMessage(userMessage);
      const reply = typeof data === 'string' ? data : (data.response || data.message || JSON.stringify(data));
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, không thể kết nối tới dịch vụ AI lúc này. Hãy kiểm tra lại backend nhé!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 bg-zinc-900/50 backdrop-blur flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🤖 Cố vấn AI Claude (PixelLog)
        </h1>
        <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-full">
          Đã kết nối Claude API
        </span>
      </header>
      
      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto mb-4 flex-1 pr-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-bl-none px-4 py-3 text-sm animate-pulse">
                Claude đang suy nghĩ...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-zinc-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi hoặc yêu cầu tư vấn game..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50 shadow-lg shadow-emerald-900/20"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}