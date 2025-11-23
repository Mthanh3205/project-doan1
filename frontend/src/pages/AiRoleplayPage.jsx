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
  const messagesEndRef = useRef(null);

  // 1. Lấy dữ liệu Topic & Từ vựng khi vào trang
  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        // Gọi API lấy từ vựng (Bạn đã làm ở bài trước)
        const res = await fetch(
          `https://project-doan1-backend.onrender.com/api/gettopiccard/deck/${deckId}/roleplay-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error('Không lấy được dữ liệu bộ từ vựng');

        const data = await res.json();

        if (data.title) {
          setTopic(data);
          // Tin nhắn chào mừng
          setMessages([
            {
              role: 'assistant',
              content: `Xin chào! Hôm nay chúng ta sẽ luyện tập chủ đề "${data.title}". Tôi sẽ đóng vai một nhân vật liên quan. Hãy bắt đầu nhé!`,
            },
          ]);
        }
      } catch (error) {
        console.error('Lỗi:', error);
        alert('Lỗi tải dữ liệu bài học: ' + error.message);
      }
    };

    fetchTopicData();
  }, [deckId]);

  // Auto scroll xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !topic) return;

    // Hiển thị tin nhắn User ngay lập tức
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
          history: newHistory.slice(-6), // Gửi 6 tin gần nhất
          targetWords: topic.words,
          topicTitle: topic.title,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        // Hiển thị lỗi màu đỏ trong khung chat
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Lỗi AI: ${data.message || 'Server không phản hồi'}`,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Lỗi kết nối mạng!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!topic)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="flex min-h-screen justify-center gap-6 bg-[#121212] p-4 pt-20 md:p-6">
      {/* Cột Trái: Từ vựng */}
      <div className="hidden w-1/4 md:block">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>
        <div className="sticky top-24 max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1d1d1d] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-amber-500">
            <Sparkles size={20} /> Nhiệm vụ
          </h3>
          <p className="mb-4 text-xs text-gray-400">Sử dụng các từ sau:</p>
          <ul className="space-y-2">
            {topic.words.map((word, idx) => (
              <li
                key={idx}
                className="flex justify-between rounded-lg border border-white/5 bg-black/30 p-3 font-medium text-white"
              >
                {word}
                {messages.some(
                  (m) => m.role === 'user' && m.content.toLowerCase().includes(word.toLowerCase())
                ) && <span className="text-green-500">✔</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cột Phải: Khung Chat */}
      <div className="flex h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1d1d1d] shadow-2xl md:w-2/3">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-black/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{topic.title} Tutor</h2>
            <p className="flex items-center gap-1 text-xs text-green-400">● Đang nhập vai</p>
          </div>
        </div>

        {/* Messages */}
        <div className="scrollbar-thin scrollbar-thumb-gray-700 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="mt-1 mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Bot size={16} className="text-gray-300" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed md:text-base ${
                  msg.role === 'user'
                    ? 'rounded-br-none bg-amber-600 text-white'
                    : 'rounded-bl-none border border-white/5 bg-white/10 text-gray-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-start">
              <div className="ml-10 flex items-center gap-1 rounded-2xl rounded-bl-none bg-white/10 p-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex shrink-0 gap-2 border-t border-white/10 bg-black/20 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn tiếng Anh..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-amber-500 p-3 text-white hover:bg-amber-600 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiRoleplayPage;
