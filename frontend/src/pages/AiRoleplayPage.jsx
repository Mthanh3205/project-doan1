import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
  Settings2,
  ChevronDown,
  Check,
  Languages,
  ChartColumnIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AiRoleplayPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();

  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState(null);
  const [level, setLevel] = useState('beginner');
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isGrading, setIsGrading] = useState(false);

  // LẤY DỮ LIỆU
  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
          navigate('/Auth');
          return;
        }

        const res = await fetch(
          `https://project-doan1-backend.onrender.com/api/gettopiccard/deck/${deckId}/roleplay-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (data.title) {
          setTopic(data);
          // Tin nhắn mở đầu giả lập JSON
          const welcomeMsg = {
            role: 'assistant',
            content: `Hello! I'm your AI Tutor for "${data.title}". Let's start!`,
            translation: `Xin chào! Tôi là gia sư AI chủ đề "${data.title}". Bắt đầu nhé!`,
            correction: null,
            isTranslated: false,
          };
          setMessages([welcomeMsg]);
          // Gợi ý mở đầu
          setSuggestions(['Hello!', 'Hi there', "I'm ready"]);
        }
      } catch (error) {
        navigate('/topics');
      }
    };
    fetchTopicData();
  }, [deckId, navigate]);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // CHECK HOÀN THÀNH
  useEffect(() => {
    if (!topic || messages.length === 0) return;
    const usedCount = topic.words.filter((word) =>
      messages.some(
        (m) => m.role === 'user' && m.content.toLowerCase().includes(word.toLowerCase())
      )
    ).length;

    if (usedCount === topic.words.length && !isCompleted) {
      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6'],
      });
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: '🎉 CHÚC MỪNG! Bạn đã hoàn thành tất cả từ vựng!' },
      ]);
    }
  }, [messages, topic, isCompleted]);

  //  TOGGLE DỊCH
  const toggleTranslation = (index) => {
    setMessages((prev) =>
      prev.map((msg, i) => {
        if (i === index) return { ...msg, isTranslated: !msg.isTranslated };
        return msg;
      })
    );
  };

  // GỬI TIN NHẮN
  const handleSend = async () => {
    if (!input.trim() || !topic) return;

    const userMsg = { role: 'user', content: input };
    // Chỉ gửi content tiếng Anh lên server để tiết kiệm token và tránh lỗi format
    const historyToSend = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSuggestions([]);
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch('https://project-doan1-backend.onrender.com/api/chat/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userMessage: userMsg.content,
          history: historyToSend,
          targetWords: topic.words,
          topicTitle: topic.title,
          level: level,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        try {
          // Xử lý JSON từ AI trả về
          const cleanJson = data.reply.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanJson);

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: parsed.english,
              translation: parsed.vietnamese,
              correction: parsed.correction,
              isTranslated: false,
            },
          ]);

          // Cập nhật các nút gợi ý mới
          setSuggestions(parsed.suggestions || []);
        } catch (e) {
          //Nếu AI lỗi format JSON thì hiện text gốc
          setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        }
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Lỗi AI.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Lỗi mạng!' }]);
    } finally {
      setIsLoading(false);
    }
  };
  // KẾT THÚC PHIÊN HỌC VÀ CHẤM ĐIỂM
  const handleEndSession = async () => {
    if (messages.length < 3) {
      alert('Hội thoại quá ngắn để chấm điểm. Hãy nói chuyện thêm nhé!');
      return;
    }

    if (!window.confirm('Bạn muốn kết thúc phiên học và xem điểm số?')) return;

    setIsGrading(true);
    try {
      const token = sessionStorage.getItem('accessToken');

      // Chỉ gửi content tiếng Anh lên để chấm
      const historyToSend = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('https://project-doan1-backend.onrender.com/api/chat/end-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          history: historyToSend,
          topicTitle: topic.title,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReportData(data.report);
        setShowReport(true); // Hiện bảng điểm
      } else {
        alert('Lỗi chấm điểm: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối!');
    } finally {
      setIsGrading(false);
    }
  };

  if (!topic)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
        Loading...
      </div>
    );

  return (
    <div className="flex min-h-screen items-start justify-center gap-6 bg-[#121212] p-4 pt-20 md:p-6">
      {/* NHIỆM VỤ */}
      <div className="sticky top-0 hidden w-1/4 md:block">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>

        <div className="flex h-[calc(100vh-140px)] flex-col bg-[#1d1d1d]">
          <div className="z-10 shrink-0 bg-[#1d1d1d] p-6 pb-2">
            <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-amber-500">
              <Sparkles size={20} /> Nhiệm vụ
            </h3>

            {/*SELECT LEVEL*/}
            <div className="relative mb-4">
              {/* Nút bấm hiển thị lựa chọn hiện tại */}
              <div
                onClick={() => setShowLevelMenu(!showLevelMenu)}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-400 bg-black/10 p-3 transition-all hover:border-amber-500/60 hover:bg-amber-500/20"
              >
                <Settings2 size={18} className="text-amber-500" />

                <div className="flex-1 text-sm font-medium text-white">
                  {level === 'beginner' ? 'Cơ bản (Beginner)' : 'Nâng cao (Advanced)'}
                </div>

                <ChevronDown
                  size={16}
                  className={`text-amber-500 transition-transform duration-300 ${showLevelMenu ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Danh sách xổ xuống  */}
              {showLevelMenu && (
                <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#1d1d1d] shadow-xl duration-200">
                  {/* Lựa chọn 1 */}
                  <div
                    onClick={() => {
                      setLevel('beginner');
                      setShowLevelMenu(false);
                    }}
                    className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition-colors ${level === 'beginner' ? 'bg-amber-500/20 font-bold text-amber-500' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span>Cơ bản (Beginner)</span>
                    {level === 'beginner' && (
                      <span>
                        <Check />
                      </span>
                    )}
                  </div>

                  {/* Lựa chọn 2 */}
                  <div
                    onClick={() => {
                      setLevel('advanced');
                      setShowLevelMenu(false);
                    }}
                    className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition-colors ${level === 'advanced' ? 'bg-amber-500/20 font-bold text-amber-500' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span>Nâng cao (Advanced)</span>
                    {level === 'advanced' && (
                      <span>
                        <Check />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {showLevelMenu && (
                <div className="fixed inset-0 z-10" onClick={() => setShowLevelMenu(false)}></div>
              )}
            </div>

            <p className="text-xs text-gray-400">Sử dụng các từ sau:</p>
          </div>

          <div
            className="flex-1 overflow-y-auto p-6 pt-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onWheel={(e) => e.stopPropagation()}
          >
            <style>{` .hide-scroll::-webkit-scrollbar { display: none; } `}</style>
            <ul className="hide-scroll space-y-2 pb-4">
              {topic.words.map((word, idx) => {
                const isUsed = messages.some(
                  (m) => m.role === 'user' && m.content.toLowerCase().includes(word.toLowerCase())
                );
                return (
                  <li
                    key={idx}
                    className={`flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-all ${isUsed ? 'border-green-500/50 bg-green-900/20 text-green-400' : 'border-white/5 bg-black/30 text-white'}`}
                  >
                    <span>{word}</span>
                    {isUsed && (
                      <span className="font-bold text-green-500">
                        <Check size={16} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/*CHAT */}
      <div className="relative flex h-[85vh] w-full flex-col overflow-hidden bg-[#1d1d1d] md:w-2/3">
        {/* Header */}
        <div className="z-10 flex shrink-0 items-center gap-3 border-b border-white/10 bg-black/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg">
            <Bot className="text-white" size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{topic.title} Tutor</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              <p className="text-xs font-medium text-green-400">Đang nhập vai</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="s flex-1 space-y-4 overflow-y-auto p-4 style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}"
          onWheel={(e) => e.stopPropagation()}
        >
          <style>{`
                .hide-scroll::-webkit-scrollbar { 
                    display: none; 
                } 
            `}</style>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {msg.role === 'assistant' && (
                <div className="mt-1 mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/10">
                  <Bot size={16} className="text-gray-300" />
                </div>
              )}

              <div className={`flex max-w-[85%] flex-col items-start`}>
                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm md:text-base ${msg.role === 'user' ? 'rounded-br-none bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 'rounded-bl-none border border-white/5 bg-white/5 text-gray-200'}`}
                >
                  {/* NỘI DUNG - HIỆN GỐC HOẶC DỊCH */}
                  {msg.isTranslated ? (
                    <span className="mb-1 block font-medium text-green-400">{msg.translation}</span>
                  ) : (
                    <span>{msg.content}</span>
                  )}

                  {/* SỬA LỖI */}
                  {msg.correction && (
                    <div className="mt-2 flex items-start gap-1 border-t border-white/10 pt-2 text-xs text-red-400 italic">
                      <span className="shrink-0">💡</span>
                      <span>{msg.correction}</span>
                    </div>
                  )}
                </div>

                {/* NÚT DỊCH */}
                {msg.role === 'assistant' && msg.translation && (
                  <button
                    onClick={() => toggleTranslation(index)}
                    className="mt-1 ml-2 flex items-center gap-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase transition-colors hover:text-amber-500"
                  >
                    <Languages size={12} /> {msg.isTranslated ? 'Xem bản gốc' : 'Dịch tiếng Việt'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="ml-12 flex items-center">
              <span className="text-sm text-gray-500">AI đang soạn tin...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* GỢI Ý TRẢ LỜI*/}
        {suggestions.length > 0 && !isLoading && (
          <div className="animate-in slide-in-from-bottom-2 flex flex-wrap gap-2 border-t border-white/5 bg-black/20 px-4 pt-2 pb-2">
            <span className="mb-1 flex w-full items-center gap-1 text-xs text-gray-500">
              <Sparkles size={12} /> Gợi ý trả lời:
            </span>
            {suggestions.map((sugg, idx) => {
              // HÀM LỌC BỎ DẤU SAO (*)
              const cleanSugg = sugg.replace(/\*\*/g, '').replace(/\*/g, '');

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(cleanSugg); // Điền text sạch vào ô nhập
                    setSuggestions([]);
                  }}
                  className="cursor-pointer rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs whitespace-nowrap text-amber-200 transition-all hover:bg-amber-500 hover:text-white"
                >
                  {cleanSugg}
                </button>
              );
            })}
          </div>
        )}

        {/* Input Area */}
        <div className="flex shrink-0 gap-2 border-t border-white/10 bg-black/20 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn tiếng Anh..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-amber-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-amber-500 p-3 text-white shadow-lg transition-all hover:scale-105 hover:bg-amber-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={20} />
          </button>
          {/* NÚT KẾT THÚC */}
          <button
            onClick={handleEndSession}
            disabled={isGrading}
            className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500/20"
          >
            {isGrading ? 'Đang chấm...' : 'Kết thúc'}
          </button>
        </div>
      </div>
      {/* MODAL BẢNG ĐIỂM */}
      {showReport && reportData && (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md duration-300">
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden bg-[#1a1a1a] shadow-2xl"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Hiệu ứng nền */}
            <div className="absolute top-0 left-0 h-2 w-full bg-amber-500"></div>
            <div
              className="flex-1 overflow-y-auto overscroll-contain p-6"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="rounded-3xl">
                <h2 className="mb-6 inline-flex w-full items-center justify-center gap-2 text-center text-2xl font-bold text-white">
                  <ChartColumnIcon /> Kết quả Phiên học
                </h2>

                {/* Điểm số to đùng */}
                <div className="mb-6 flex justify-center">
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                    <span className="text-4xl font-extrabold text-white">{reportData.score}</span>
                    <span className="text-xs tracking-widest text-amber-300 uppercase">Điểm</span>
                  </div>
                </div>

                {/* Nhận xét */}
                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-500">
                    <Bot size={16} /> Nhận xét của AI:
                  </h4>
                  <p className="text-sm text-gray-300 italic">"{reportData.feedback}"</p>
                </div>

                {/* Lỗi sai & Từ hay */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <h4 className="mb-2 text-xs font-bold text-red-400 uppercase">Cần khắc phục</h4>
                    <ul className="list-inside list-disc space-y-1 text-xs text-gray-400">
                      {reportData.mistakes?.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                    <h4 className="mb-2 text-xs font-bold text-green-400 uppercase">Từ vựng tốt</h4>
                    <ul className="list-inside list-disc space-y-1 text-xs text-gray-400">
                      {reportData.best_words?.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Nút đóng */}
                <button
                  onClick={() => {
                    setShowReport(false);
                    navigate('/topics');
                  }}
                  className="w-full rounded-xl bg-amber-500 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Hoàn thành & Quay về
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRoleplayPage;
