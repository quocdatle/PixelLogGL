import React, { useState, useEffect, useRef } from 'react';
import AppNavbar from '../../../components/layout/AppNavbar';
import { sendAdvisorMessage, getAdvisorHistory } from '../advisorService';

export default function AdvisorPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Chào bạn! Tôi là Cố vấn AI Gemini của PixelLog. Bạn đang muốn tìm kiếm tựa game nào, phân tích gu chơi game hay cần gợi ý gì hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Tải lịch sử chat trước đó (nếu có)
  useEffect(() => {
    let isMounted = true;
    getAdvisorHistory()
      .then((res) => {
        if (!isMounted) return;
        const history = res?.data || [];
        if (history.length > 0) {
          const loaded = [];
          history.forEach((item) => {
            if (item.userMessage) loaded.push({ role: 'user', content: item.userMessage });
            if (item.botReply) loaded.push({ role: 'assistant', content: item.botReply });
          });
          if (loaded.length > 0) {
            setMessages(loaded);
          }
        }
      })
      .catch((err) => {
        console.warn('Không thể tải lịch sử trò chuyện:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmedInput }]);
    setLoading(true);

    try {
      const data = await sendAdvisorMessage(trimmedInput);
      const reply =
        typeof data === 'string'
          ? data
          : data?.reply || data?.response || data?.message || JSON.stringify(data);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Lỗi nhận phản hồi AI:', err);
      const errorMessage =
        err?.message ||
        err?.error ||
        'Xin lỗi, không thể kết nối tới dịch vụ AI lúc này. Hãy kiểm tra lại cấu hình GEMINI_API_KEY ở backend nhé!';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      <div>
        <AppNavbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col h-[calc(100vh-5rem)]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <span>🤖</span> Cố vấn AI Game (Gemini)
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Trợ lý AI phân tích sở thích, gợi ý game đỉnh cao & giải đáp thắc mắc.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/50 px-3 py-1 rounded-full">
              Google Gemini Flash
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-2 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Gemini đang suy nghĩ câu trả lời...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về cốt truyện, gợi ý game hay theo gu của bạn..."
              disabled={loading}
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-5 sm:px-6 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-900/10 flex items-center gap-1.5"
            >
              <span>Gửi</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
