import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import AppNavbar from '../../../components/layout/AppNavbar';
import {
  sendAdvisorMessage,
  getAdvisorHistory,
  clearAdvisorHistory,
} from '../advisorService';

const MAX_INPUT_LENGTH = 1500;

const SUGGESTION_PROMPTS = [
  '🎮 Gợi ý game hợp gu dựa trên thư viện của tôi',
  '⚔️ Top game nhập vai (RPG) thế giới mở đáng chơi',
  '🕹️ Game souls-like nào dễ làm quen nhất cho người mới?',
  '👥 Tìm game co-op 2-4 người vui nhộn chơi cuối tuần',
];

const INITIAL_GREETING = {
  role: 'assistant',
  content:
    'Chào bạn! Tôi là Cố vấn AI Game của PixelLog. Tôi có thể phân tích kho game của bạn để gợi ý game chuẩn gu, giải đáp cốt truyện hay cấu hình chơi game. Hôm nay bạn muốn tìm tựa game thế nào?',
};

export default function AdvisorPage() {
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Tải lịch sử chat
  useEffect(() => {
    let isMounted = true;
    getAdvisorHistory()
      .then((history) => {
        if (!isMounted) return;
        if (Array.isArray(history) && history.length > 0) {
          const loaded = [];
          history.forEach((item) => {
            if (item.userMessage) loaded.push({ role: 'user', content: item.userMessage });
            if (item.botReply) loaded.push({ role: 'assistant', content: item.botReply });
          });
          setMessages((prev) => {
            // Giữ lại các tin nhắn vừa được gửi trong lúc history đang tải (tránh race condition)
            const newlySent = prev.filter((m) => m.isPending);
            return loaded.length > 0 ? [...loaded, ...newlySent] : prev;
          });
        }
      })
      .catch((err) => {
        console.error('Không thể tải lịch sử trò chuyện:', err);
      })
      .finally(() => {
        if (isMounted) setHistoryLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    if (messageText.length > MAX_INPUT_LENGTH) {
      alert(`Tin nhắn của bạn vượt quá giới hạn ${MAX_INPUT_LENGTH} ký tự.`);
      return;
    }

    setInput('');
    setLastFailedMessage(null);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: messageText, isPending: !historyLoaded },
    ]);
    setLoading(true);

    try {
      const data = await sendAdvisorMessage(messageText);
      const replyText = data?.reply || 'Không có câu trả lời nào được trả về.';
      setMessages((prev) => [
        ...prev.map((m) => ({ ...m, isPending: false })),
        { role: 'assistant', content: replyText },
      ]);
    } catch (err) {
      console.error('[ADVISOR_UI] Lỗi gửi tin nhắn:', err);
      setLastFailedMessage(messageText);
      const errorMsg =
        err.response?.data?.message ||
        'Rất tiếc, đã có lỗi kết nối tới trợ lý AI. Vui lòng bấm "Thử lại" hoặc gửi lại sau giây lát!';
      setMessages((prev) => [
        ...prev.map((m) => ({ ...m, isPending: false })),
        { role: 'assistant', content: `⚠️ ${errorMsg}`, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleRetry = () => {
    if (lastFailedMessage && !loading) {
      handleSendMessage(lastFailedMessage);
    }
  };

  const handleNewChat = async () => {
    if (window.confirm('Bạn có chắc muốn bắt đầu cuộc trò chuyện mới và xóa lịch sử hiện tại không?')) {
      try {
        await clearAdvisorHistory();
        setMessages([INITIAL_GREETING]);
        setLastFailedMessage(null);
      } catch (err) {
        console.error('Không thể làm mới lịch sử:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      <div>
        <AppNavbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 w-full flex flex-col h-[calc(100vh-4.5rem)]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <span>🤖</span> Cố vấn AI Game (PixelLog)
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Gợi ý game chuẩn gu theo thư viện & giải đáp thắc mắc gaming.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNewChat}
                title="Bắt đầu cuộc trò chuyện mới"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Hội thoại mới</span>
              </button>

              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/50 px-2.5 py-1 rounded-full">
                Sẵn sàng
              </span>
            </div>
          </div>

          {/* Messages list with aria-live */}
          <div
            aria-live="polite"
            aria-relevant="additions"
            className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 pb-2"
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                        : msg.isError
                        ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 rounded-bl-none shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          h1: ({ ...props }) => <h1 className="text-base font-bold my-2 text-zinc-900 dark:text-white" {...props} />,
                          h2: ({ ...props }) => <h2 className="text-sm font-bold my-1.5 text-zinc-900 dark:text-white" {...props} />,
                          h3: ({ ...props }) => <h3 className="text-xs font-bold my-1.5 uppercase tracking-wider text-emerald-700 dark:text-emerald-400" {...props} />,
                          p: ({ ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({ ...props }) => <li className="pl-0.5" {...props} />,
                          strong: ({ ...props }) => <strong className="font-semibold text-zinc-900 dark:text-white" {...props} />,
                          code: ({ inline, ...props }) =>
                            inline ? (
                              <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-mono" {...props} />
                            ) : (
                              <pre className="p-2.5 rounded-lg bg-zinc-900 text-zinc-100 overflow-x-auto text-xs my-2 font-mono">
                                <code {...props} />
                              </pre>
                            ),
                          hr: () => <hr className="my-3 border-zinc-200 dark:border-zinc-800" />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-2 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Cố vấn AI đang suy nghĩ câu trả lời...</span>
                </div>
              </div>
            )}

            {lastFailedMessage && !loading && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 transition cursor-pointer flex items-center gap-1.5 border border-rose-300 dark:border-rose-800"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Thử gửi lại tin nhắn trước</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (chỉ hiện khi ít tin nhắn) */}
          {messages.length <= 2 && !loading && (
            <div className="pb-2 pt-1 flex flex-wrap gap-1.5">
              {SUGGESTION_PROMPTS.map((promptText, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(promptText)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer text-left"
                >
                  {promptText}
                </button>
              ))}
            </div>
          )}

          {/* Input Form with Char Counter */}
          <form onSubmit={handleFormSubmit} className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về game, mẹo chơi, hoặc gợi ý game theo gu của bạn..."
                disabled={loading}
                maxLength={MAX_INPUT_LENGTH}
                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition shadow-sm pr-16"
              />

              {/* Character counter */}
              {input.length > 0 && (
                <span className="absolute right-20 text-[10px] text-zinc-400 font-mono">
                  {input.length}/{MAX_INPUT_LENGTH}
                </span>
              )}

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-900/10 flex items-center gap-1.5 shrink-0"
              >
                <span>Gửi</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
