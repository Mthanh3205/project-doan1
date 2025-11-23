import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Bot, User, Sparkles, ArrowLeft } from 'lucide-react';

const AiRoleplayPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState(null);
  const [level, setLevel] = useState('beginner');
  const messagesEndRef = useRef(null);

  // LẤY DỮ LIỆU TỪ VỰNG & CHỦ ĐỀ TỪ BACKEND
  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
          alert('Vui lòng đăng nhập để sử dụng tính năng này.');
          navigate('/Auth');
          return;
        }

        // Gọi API lấy dữ liệu bộ thẻ
        const res = await fetch(
          `https://project-doan1-backend.onrender.com/api/gettopiccard/deck/${deckId}/roleplay-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error('Không tìm thấy bộ từ vựng');

        const data = await res.json();

        if (data.title) {
          setTopic(data);
          // Tin nhắn mở đầu của AI
          setMessages([
            {
              role: 'assistant',
              content: `Hello! I'm your AI Tutor for the topic "${data.title}". I will play a role related to this topic. Let's start the conversation! (Try using the word '${data.words[0] || 'Hello'}')`,
            },
          ]);
        }
      } catch (error) {
        console.error('Lỗi:', error);
        alert('Lỗi tải dữ liệu: ' + error.message);
        navigate('/topics');
      }
    };

    fetchTopicData();
  }, [deckId, navigate]);

  //  TỰ ĐỘNG CUỘN XUỐNG CUỐI KHUNG CHAT
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  //  XỬ LÝ GỬI TIN NHẮN
  const handleSend = async () => {
    if (!input.trim() || !topic) return;

    // Hiển thị tin nhắn User ngay lập tức (Optimistic UI)
    const userMsg = { role: 'user', content: input };
    const newHistory = [...messages, userMsg];

    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('accessToken');

      // Gọi API Chat
      const res = await fetch('https://project-doan1-backend.onrender.com/api/chat/roleplay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userMessage: userMsg.content,
          history: newHistory.slice(-12), //gửi tối đa 12 tn
          targetWords: topic.words,
          topicTitle: topic.title,
          level: level,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        // Hiển thị lỗi trong khung chat cho user biết
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Lỗi AI: ${data.message || 'Server không phản hồi. Hãy thử lại.'}`,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Lỗi kết nối mạng!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!topic)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-amber-500"></div>
          <p className="text-sm text-gray-400">Đang tải dữ liệu bài học...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen items-start justify-center gap-6 bg-[#121212] p-4 md:p-6">
      {/* DANH SÁCH TỪ CẦN LUYỆN */}
      <div className="sticky top-0 hidden w-1/4 md:block">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>

        <div className="flex h-[calc(100vh-140px)] flex-col overflow-hidden bg-[#1d1d1d] shadow-xl">
          <div className="z-10 shrink-0 bg-[#1d1d1d] p-6 pb-2">
            <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-amber-500">
              <Sparkles size={20} /> Nhiệm vụ
            </h3>
            {/*SELECT LEVEL*/}
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 p-2">
              <Settings2 size={16} className="text-gray-400" />
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full cursor-pointer bg-transparent text-sm text-white outline-none"
              >
                <option value="beginner">Cơ bản (Beginner)</option>
                <option value="advanced">Nâng cao (Advanced)</option>
              </select>
            </div>
            <p className="text-xs text-gray-400">Sử dụng các từ sau trong hội thoại:</p>
          </div>

          <div
            className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1 overflow-y-auto p-6 pt-2"
            onWheel={(e) => e.stopPropagation()}
          >
            <ul className="space-y-2 pb-4">
              {topic.words.length > 0 ? (
                topic.words.map((word, idx) => {
                  const isUsed = messages.some(
                    (m) => m.role === 'user' && m.content.toLowerCase().includes(word.toLowerCase())
                  );

                  return (
                    <li
                      key={idx}
                      className={`flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-all ${
                        isUsed
                          ? 'border-green-500/50 bg-green-900/20 text-green-400'
                          : 'border-white/5 bg-black/30 text-white'
                      }`}
                    >
                      <span>{word}</span>
                      {isUsed && <span className="font-bold text-green-500">✔</span>}
                    </li>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 italic">Chủ đề này chưa có từ vựng.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/*KHUNG CHAT */}
      <div className="relative flex h-[85vh] w-full flex-col overflow-hidden bg-[#1d1d1d] shadow-2xl md:w-2/3">
        {/* Header Chat */}
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

        {/* Nội dung Chat */}
        <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1 space-y-4 overflow-y-auto p-4">
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
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm md:text-base ${
                  msg.role === 'user'
                    ? 'rounded-br-none bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                    : 'rounded-bl-none border border-white/5 bg-white/5 text-gray-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-start">
              <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Bot size={16} className="text-gray-300" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-none border border-white/5 bg-white/5 p-4">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-100"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

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
        </div>
      </div>
    </div>
  );
};

export default AiRoleplayPage;
