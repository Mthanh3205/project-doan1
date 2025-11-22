import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AiRoleplayPage = () => {
  const { deckId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Giả lập lấy từ vựng từ API (Bạn hãy thay bằng call API thật lấy vocabulary theo deckId)
  const [topic, setTopic] = useState({
    title: 'Nhà hàng (Restaurant)',
    words: ['Menu', 'Appetizer', 'Delicious', 'Bill', 'Reservation'],
  });

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  // Tin nhắn chào mừng đầu tiên
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Xin chào! Hôm nay chúng ta sẽ luyện tập chủ đề "${topic.title}". Tôi sẽ đóng vai nhân viên nhà hàng nhé. Bạn muốn dùng gì hôm nay? (Gợi ý: Hãy dùng từ 'Menu')`,
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Thêm tin nhắn của User vào UI ngay lập tức
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('accessToken');
      // 2. Gọi API Backend
      const res = await fetch('https://project-doan1-backend.onrender.com/api/chat/roleplay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userMessage: input,
          history: newMessages.slice(-6), // Chỉ gửi 6 tin gần nhất để tiết kiệm token
          targetWords: topic.words,
          topicTitle: topic.title,
        }),
      });

      const data = await res.json();

      // 3. Thêm phản hồi của AI vào UI
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center gap-6 bg-[#121212] p-6 pt-20">
      {/* CỘT TRÁI: DANH SÁCH TỪ CẦN LUYỆN (TARGET) */}
      <div className="hidden w-1/4 md:block">
        <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#1d1d1d] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-amber-500">
            <Sparkles size={20} /> Nhiệm vụ
          </h3>
          <p className="mb-4 text-sm text-gray-400">
            Hãy cố gắng sử dụng các từ sau trong cuộc hội thoại:
          </p>
          <ul className="space-y-3">
            {topic.words.map((word, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 p-3 font-medium text-white"
              >
                {word}
                {/* Logic kiểm tra: Nếu user đã dùng từ này thì hiện dấu tích xanh */}
                {messages.some(
                  (m) => m.role === 'user' && m.content.toLowerCase().includes(word.toLowerCase())
                ) && <span className="text-green-500">✔</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CỘT PHẢI: KHUNG CHAT */}
      <div className="flex h-[80vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1d1d1d] shadow-2xl md:w-2/4">
        {/* Header Chat */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-black/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600">
            <Bot text-white size={24} />
          </div>
          <div>
            <h2 className="font-bold text-white">AI Tutor</h2>
            <p className="flex items-center gap-1 text-xs text-green-400">● Đang nhập vai</p>
          </div>
        </div>

        {/* Nội dung Chat */}
        <div className="scrollbar-thin scrollbar-thumb-gray-700 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'rounded-br-none bg-amber-600 text-white'
                    : 'rounded-bl-none bg-white/10 text-gray-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 rounded-2xl rounded-bl-none bg-white/10 p-4">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Chat */}
        <div className="flex gap-2 border-t border-white/10 bg-black/20 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-amber-500 p-3 text-white transition-all hover:bg-amber-600 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiRoleplayPage;
