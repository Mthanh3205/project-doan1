import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Bot, User, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AiRoleplayPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState(null); // State lưu dữ liệu thật
  const messagesEndRef = useRef(null);

  // 1. LẤY DỮ LIỆU TỪ BACKEND KHI TRANG LOAD
  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(
          `https://project-doan1-backend.onrender.com/api/gettopiccard/deck/${deckId}/roleplay-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (data.title) {
          setTopic(data); // Lưu dữ liệu thật vào state

          // KHỞI TẠO TIN NHẮN CHÀO MỪNG DỰA TRÊN CHỦ ĐỀ THẬT
          setMessages([
            {
              role: 'assistant',
              content: `Xin chào! Hôm nay chúng ta sẽ luyện tập chủ đề "${data.title}". 
              Tôi sẽ đóng vai một người liên quan đến chủ đề này. Hãy bắt đầu cuộc trò chuyện nhé!
              (Gợi ý: Hãy thử dùng từ '${data.words[0] || 'Hello'}')`,
            },
          ]);
        }
      } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
      }
    };

    fetchTopicData();
  }, [deckId]);

  // Tự động cuộn xuống
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !topic) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch('https://project-doan1-backend.onrender.com/api/chat/roleplay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userMessage: input,
          history: newMessages.slice(-6),
          targetWords: topic.words, // Gửi từ vựng thật lên cho AI
          topicTitle: topic.title, // Gửi chủ đề thật lên cho AI
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu chưa tải xong dữ liệu thì hiện Loading
  if (!topic)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );

  return (
    <div className="flex min-h-screen justify-center gap-6 bg-[#121212] p-6 pt-20">
      {/* CỘT TRÁI: DANH SÁCH TỪ CẦN LUYỆN */}
      <div className="hidden w-1/4 md:block">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>

        <div className="scrollbar-thin scrollbar-thumb-gray-700 sticky top-24 max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1d1d1d] p-6">
          <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-amber-500">
            <Sparkles size={20} /> Nhiệm vụ
          </h3>
          <p className="mb-4 text-xs text-gray-400">Dùng các từ sau trong hội thoại:</p>

          <ul className="space-y-3">
            {topic.words.length > 0 ? (
              topic.words.map((word, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 p-3 font-medium text-white transition-all hover:border-amber-500/50"
                >
                  <span>{word}</span>
                  {/* Kiểm tra xem user đã dùng từ này chưa (Case insensitive) */}
                  {messages.some(
                    (m) => m.role === 'user' && m.content.toLowerCase().includes(word.toLowerCase())
                  ) && (
                    <span className="rounded-full bg-green-500/10 p-1 text-xs text-green-500">
                      ✔
                    </span>
                  )}
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Chủ đề này chưa có từ vựng nào.</p>
            )}
          </ul>
        </div>
      </div>

      {/* CỘT PHẢI: KHUNG CHAT */}
      <div className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1d1d1d] shadow-2xl md:w-2/4">
        {/* Header Chat */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-black/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{topic.title} Tutor</h2>
            <p className="flex animate-pulse items-center gap-1 text-xs text-green-400">
              ● Đang nhập vai
            </p>
          </div>
        </div>

        {/* Nội dung Chat */}
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
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-md md:text-base ${
                  msg.role === 'user'
                    ? 'rounded-br-none bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                    : 'rounded-bl-none border border-white/5 bg-white/10 text-gray-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-start">
              <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Bot size={16} className="text-gray-300" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-none bg-white/10 p-4">
                <span className="mr-2 text-xs text-gray-400">AI đang soạn tin...</span>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 delay-100"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Chat */}
        <div className="flex shrink-0 gap-2 border-t border-white/10 bg-black/20 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn tiếng Anh..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-amber-500 p-3 text-white shadow-lg transition-all hover:bg-amber-600 hover:shadow-amber-500/20 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiRoleplayPage;
