import React, { useState, useEffect } from 'react';
import { Bot, Calendar, Star, Eye, ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AiHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null); // Để hiện Modal chi tiết
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch('https://project-doan1-backend.onrender.com/api/chat/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setSessions(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] p-6 pt-24 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full bg-white/5 p-2 transition hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-amber-500">
              <Bot /> Lịch sử Luyện tập AI
            </h1>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <span className="font-bold text-amber-500">{sessions.length}</span> phiên học
          </div>
        </div>

        {/* List Sessions */}
        {loading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 py-10 text-center">
            <p className="mb-4 text-gray-400">Bạn chưa có lịch sử luyện tập nào.</p>
            <button
              onClick={() => navigate('/topics')}
              className="rounded-lg bg-amber-500 px-6 py-2 font-bold text-white hover:bg-amber-600"
            >
              Bắt đầu ngay
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] p-5 transition-all hover:border-amber-500/50"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white transition-colors group-hover:text-amber-500">
                      {session.topic_title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} /> {new Date(session.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg font-bold ${session.score >= 80 ? 'bg-green-500/20 text-green-500' : session.score >= 50 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}
                  >
                    <span className="text-lg">{session.score}</span>
                  </div>
                </div>

                {/* Nút xem chi tiết */}
                {session.report_card && (
                  <button
                    onClick={() => setSelectedReport(session.report_card)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
                  >
                    <Eye size={16} /> Xem bảng điểm chi tiết
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL BẢNG ĐIỂM (Tái sử dụng UI cũ) --- */}
        {selectedReport && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-amber-500/30 bg-[#1a1a1a] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-6 text-center text-xl font-bold text-white">
                📊 Kết quả Phiên học
              </h2>

              {/* Điểm số */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-amber-500 bg-amber-500/10">
                  <span className="text-3xl font-extrabold text-white">{selectedReport.score}</span>
                </div>
              </div>

              {/* Nhận xét */}
              <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 text-sm font-bold text-amber-500">Nhận xét của AI:</h4>
                <p className="text-sm text-gray-300 italic">"{selectedReport.feedback}"</p>
              </div>

              {/* Lỗi sai & Từ hay */}
              <div className="mb-4 grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <h4 className="mb-2 text-xs font-bold text-red-400 uppercase">Cần khắc phục</h4>
                  <ul className="list-inside list-disc space-y-1 text-xs text-gray-400">
                    {selectedReport.mistakes?.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full rounded-xl bg-gray-700 py-3 font-bold text-white hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiHistoryPage;
