import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import AppNavbar from '../../../components/layout/AppNavbar';
import GameDetailModal from '../../library/components/GameDetailModal';
import libraryService from '../../library/libraryService';
import useFeedback from '../../../hooks/useFeedback';
import {
  sendAdvisorMessage,
  getAdvisorHistory,
  clearAdvisorHistory,
} from '../advisorService';

const MAX_INPUT_LENGTH = 1500;

const SUGGESTION_PROMPTS = [
  'Phân tích gu chơi game của tôi dựa trên thư viện và gợi ý 3 tựa game tiếp theo',
  'Top game nhập vai (RPG) thế giới mở đáng chơi nhất',
  'Mẹo làm quen dòng game souls-like cho người mới (không spoil cốt truyện)',
  'Tìm game co-op 2-4 người chơi cùng bạn bè cuối tuần',
];

const INITIAL_GREETING = {
  role: 'assistant',
  content:
    'Chào bạn! Tôi là Cố vấn AI Game của PixelLog. Tôi có thể phân tích kho game của bạn để gợi ý game chuẩn gu, hướng dẫn mẹo chơi không tiết lộ cốt truyện hoặc tư vấn cấu hình. Hôm nay bạn muốn tìm tựa game thế nào?',
  recommendedGames: [],
};

// react-markdown truyền thêm prop `node` (cây AST) vào mọi component — bỏ đi để không bị đẩy xuống thẻ DOM.
const withoutNode = (props) => {
  const rest = { ...props };
  delete rest.node;
  return rest;
};

// Tạo component Markdown gắn class Tailwind cho một thẻ HTML.
const styledTag = (Tag, className) => (props) => <Tag className={className} {...withoutNode(props)} />;

const MARKDOWN_COMPONENTS = {
  h1: styledTag('h1', 'text-base font-bold my-2 text-zinc-900 dark:text-white'),
  h2: styledTag('h2', 'text-sm font-bold my-1.5 text-zinc-900 dark:text-white'),
  h3: styledTag('h3', 'text-xs font-bold my-1.5 uppercase tracking-wider text-emerald-700 dark:text-emerald-400'),
  p: styledTag('p', 'mb-2 last:mb-0 leading-relaxed'),
  ul: styledTag('ul', 'list-disc pl-4 mb-2 space-y-1'),
  ol: styledTag('ol', 'list-decimal pl-4 mb-2 space-y-1'),
  li: styledTag('li', 'pl-0.5'),
  strong: styledTag('strong', 'font-semibold text-zinc-900 dark:text-white'),
  pre: styledTag('pre', 'p-2.5 rounded-lg bg-zinc-900 text-zinc-100 overflow-x-auto text-xs my-2 font-mono'),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className) || String(children).includes('\n');
    const rest = withoutNode(props);
    return isBlock ? (
      <code className={className} {...rest}>
        {children}
      </code>
    ) : (
      <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-mono" {...rest}>
        {children}
      </code>
    );
  },
  hr: () => <hr className="my-3 border-zinc-200 dark:border-zinc-800" />,
};

export default function AdvisorPage() {
  const { toast, confirm } = useFeedback();
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [libraryMap, setLibraryMap] = useState(() => new Map());
  const [addingRawgId, setAddingRawgId] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const alertTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Nạp danh sách game trong thư viện để biết game nào đã có
  useEffect(() => {
    let ignore = false;
    libraryService
      .getGames({ limit: 100 })
      .then((games) => {
        if (ignore) return;
        const nextMap = new Map();
        games.forEach((g) => {
          if (g.rawgId) nextMap.set(Number(g.rawgId), g);
        });
        setLibraryMap(nextMap);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Tải lịch sử chat
  useEffect(() => {
    let isMounted = true;
    getAdvisorHistory()
      .then((history) => {
        if (!isMounted) return;
        if (Array.isArray(history) && history.length > 0) {
          const loaded = [];
          history.forEach((item) => {
            if (item.userMessage) {
              loaded.push({ role: 'user', content: item.userMessage });
            }
            if (item.botReply) {
              loaded.push({
                role: 'assistant',
                content: item.botReply,
                recommendedGames: item.recommendedGames || [],
              });
            }
          });
          setMessages((prev) => {
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
      toast(`Tin nhắn của bạn vượt quá giới hạn ${MAX_INPUT_LENGTH} ký tự.`, 'error');
      return;
    }

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLastFailedMessage(null);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: messageText, isPending: !historyLoaded },
    ]);
    setLoading(true);

    try {
      const data = await sendAdvisorMessage(messageText);
      const replyText = data?.reply || 'Không có câu trả lời nào được trả về.';
      const recommendedGames = Array.isArray(data?.recommendedGames)
        ? data.recommendedGames
        : [];
      setMessages((prev) => [
        ...prev.map((m) => ({ ...m, isPending: false })),
        { role: 'assistant', content: replyText, recommendedGames },
      ]);
    } catch (err) {
      console.error('[ADVISOR_UI] Lỗi gửi tin nhắn:', err);
      setLastFailedMessage(messageText);
      const errorMsg =
        err.response?.data?.message ||
        'Rất tiếc, đã có lỗi kết nối tới trợ lý AI. Vui lòng bấm "Thử lại" hoặc gửi lại sau giây lát!';
      setMessages((prev) => [
        ...prev.map((m) => ({ ...m, isPending: false })),
        { role: 'assistant', content: errorMsg, isError: true, recommendedGames: [] },
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
    const accepted = await confirm({
      title: 'Bắt đầu cuộc trò chuyện mới',
      message: 'Lịch sử trò chuyện hiện tại với Cố vấn AI sẽ được xóa. Bạn có muốn tiếp tục không?',
      confirmLabel: 'Tạo hội thoại mới',
      cancelLabel: 'Hủy',
      danger: true,
    });
    if (!accepted) return;

    try {
      await clearAdvisorHistory();
      setMessages([INITIAL_GREETING]);
      setLastFailedMessage(null);
      toast('Đã tạo cuộc trò chuyện mới.', 'success');
    } catch (err) {
      console.error('Không thể làm mới lịch sử:', err);
      toast('Không thể làm mới lịch sử trò chuyện.', 'error');
    }
  };

  const handleAddRecommendedGame = async (game) => {
    if (!game?.rawgId || addingRawgId) return;
    setAddingRawgId(game.rawgId);
    setActionAlert(null);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);

    try {
      const created = await libraryService.addGame({
        rawgId: game.rawgId,
        status: 'backlog',
      });
      setLibraryMap((prev) => {
        const next = new Map(prev);
        next.set(Number(game.rawgId), created);
        return next;
      });
      setActionAlert({
        type: 'success',
        text: `Đã thêm "${game.name}" vào thư viện (Chờ chơi).`,
      });
      alertTimerRef.current = setTimeout(() => setActionAlert(null), 3500);
    } catch (err) {
      setActionAlert({
        type: 'error',
        text: err.response?.data?.message || `Không thể thêm "${game.name}".`,
      });
      alertTimerRef.current = setTimeout(() => setActionAlert(null), 3500);
    } finally {
      setAddingRawgId(null);
    }
  };

  return (
    <div className="h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-150">
      <AppNavbar />

      <main className="flex-1 min-h-0 max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 w-full flex flex-col">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Cố vấn AI Game (PixelLog)
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Gợi ý game kèm thẻ tương tác thêm nhanh vào thư viện & giải đáp không spoil.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleSendMessage(
                    'Phân tích gu chơi game từ thư viện của tôi và đề xuất 3 tựa game phù hợp nhất tôi chưa sở hữu'
                  )
                }
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Phân tích gu game</span>
              </button>

              <button
                type="button"
                onClick={handleNewChat}
                title="Bắt đầu cuộc trò chuyện mới"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Hội thoại mới</span>
              </button>
            </div>
          </div>

          {actionAlert && (
            <div
              role="status"
              className={`mb-2 px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                actionAlert.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
              }`}
            >
              {actionAlert.text}
            </div>
          )}

          {/* Messages list with aria-live */}
          <div
            aria-live="polite"
            aria-relevant="additions"
            className="flex-1 overflow-y-auto space-y-4 pr-1.5 pb-2"
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const cards = Array.isArray(msg.recommendedGames) ? msg.recommendedGames : [];

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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
                      <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Interactive Recommended Game Cards right inside chat */}
                  {!isUser && cards.length > 0 && (
                    <div className="mt-2.5 w-full max-w-[92%] sm:max-w-[85%] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {cards.map((game) => {
                        const existingEntry = libraryMap.get(Number(game.rawgId));
                        const isAddingThis = addingRawgId === game.rawgId;
                        const year = game.released ? new Date(game.released).getFullYear() : null;

                        return (
                          <div
                            key={game.rawgId}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-emerald-400/60 dark:hover:border-emerald-700/70 transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setDetailTarget({
                                  rawgId: game.rawgId,
                                  userGame: existingEntry || null,
                                })
                              }
                              className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              aria-label={`Xem chi tiết ${game.name}`}
                            >
                              {game.backgroundImage ? (
                                <img
                                  src={game.backgroundImage}
                                  alt={game.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                                  {game.name?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setDetailTarget({
                                    rawgId: game.rawgId,
                                    userGame: existingEntry || null,
                                  })
                                }
                                className="text-left w-full cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
                              >
                                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                                  {game.name}
                                </h3>
                              </button>

                              <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                                {year && <span className="tabular-nums">{year}</span>}
                                {game.genres?.length > 0 && (
                                  <span className="truncate">{game.genres.slice(0, 2).join(', ')}</span>
                                )}
                                {game.metacritic && (
                                  <span className="px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold tabular-nums">
                                    {game.metacritic}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 mt-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDetailTarget({
                                      rawgId: game.rawgId,
                                      userGame: existingEntry || null,
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors"
                                >
                                  Chi tiết
                                </button>

                                {existingEntry ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Đã có trong kho
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isAddingThis}
                                    onClick={() => handleAddRecommendedGame(game)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer transition-colors disabled:opacity-50"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>{isAddingThis ? 'Đang thêm...' : 'Thêm vào kho'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-2 shadow-sm motion-safe:animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 motion-safe:animate-ping" />
                  <span>Cố vấn AI đang phân tích và tìm thẻ game phù hợp...</span>
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
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Thử gửi lại tin nhắn trước</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
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

          {/* Input Form */}
          <form onSubmit={handleFormSubmit} className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="relative flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(input);
                    }
                  }}
                  placeholder="Hỏi về game, mẹo chơi, hoặc gợi ý game... (Enter gửi, Shift+Enter xuống dòng)"
                  disabled={loading}
                  maxLength={MAX_INPUT_LENGTH}
                  aria-label="Nội dung tin nhắn gửi Cố vấn AI"
                  className="w-full resize-none bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors pr-16 max-h-[140px] leading-snug"
                />

                {input.length > 0 && (
                  <span className="absolute right-3 bottom-3 text-[11px] text-zinc-400 tabular-nums pointer-events-none">
                    {input.length}/{MAX_INPUT_LENGTH}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Gửi</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </main>

      {/* Interactive Game Detail Modal right inside Advisor */}
      {detailTarget && (
        <GameDetailModal
          isOpen={!!detailTarget}
          onClose={() => setDetailTarget(null)}
          rawgId={detailTarget.rawgId}
          userGame={detailTarget.userGame}
          onAddedToLibrary={(created) => {
            setLibraryMap((prev) => {
              const next = new Map(prev);
              next.set(Number(created.rawgId), created);
              return next;
            });
          }}
          onUserGameUpdated={(updated) => {
            setLibraryMap((prev) => {
              const next = new Map(prev);
              next.set(Number(updated.rawgId), updated);
              return next;
            });
          }}
          onUserGameRemoved={(removedId) => {
            setLibraryMap((prev) => {
              const next = new Map(prev);
              for (const [k, v] of next.entries()) {
                if (v.id === removedId) next.delete(k);
              }
              return next;
            });
          }}
        />
      )}
    </div>
  );
}
