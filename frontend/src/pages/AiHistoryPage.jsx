import React, { useState, useEffect } from 'react';
import { Bot, Calendar, Star, Eye, ArrowLeft, Trash2, Frown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AiHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();

  // Lấy dữ liệu
  const fetchHistory = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;

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

  useEffect(() => {
    fetchHistory();
  }, []);

  //  HÀM XÓA THỰC SỰ (GỌI API)
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Chặn click lan ra ngoài (không mở modal)

    if (!window.confirm('Bạn chắc chắn muốn xóa lịch sử này vĩnh viễn?')) return;

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`https://project-doan1-backend.onrender.com/api/chat/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        // Xóa thành công trên server -> Cập nhật giao diện
        setSessions((prev) => prev.filter((s) => s.id !== id));
        toast.success('Đã xóa phiên học.');
      } else {
        toast.error('Lỗi khi xóa: ' + data.message);
      }
    } catch (error) {
      toast.error('Lỗi kết nối server');
    }
  };

  //  HÀM XỬ LÝ CLICK XEM CHI TIẾT
  const handleViewDetail = (session) => {
    if (!session.report_card) {
      toast.warning('Phiên học này chưa có bảng điểm (Dữ liệu cũ hoặc chưa kết thúc).');
      return;
    }
    setSelectedReport(session.report_card);
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6 pt-24 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full bg-white/5 p-2 transition hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-amber-500">
                <Bot /> Lịch sử Luyện tập AI
              </h1>
              <p className="mt-1 text-xs text-gray-500">Xem lại các bảng điểm và nhận xét của AI</p>
            </div>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <span className="text-2xl font-bold text-amber-500">{sessions.length}</span>
            <span className="text-xs text-amber-200 uppercase">Phiên học</span>
          </div>
        </div>

        {/* LIST SESSIONS */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <Frown size={48} className="mb-4 text-gray-600" />
            <p className="mb-4 text-gray-400">Bạn chưa có lịch sử luyện tập nào.</p>
            <button
              onClick={() => navigate('/topics')}
              className="rounded-lg bg-amber-500 px-6 py-2 font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600"
            >
              Bắt đầu ngay
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleViewDetail(session)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#1d1d1d] p-5 transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 transition-all duration-500 group-hover:to-amber-500/5"></div>

                <div className="relative z-10">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg border border-white/5 bg-white/5 p-2 transition-colors group-hover:border-amber-500/30">
                      <Bot size={20} className="text-gray-400 group-hover:text-amber-500" />
                    </div>
                    {/* Hiển thị điểm hoặc dấu gạch ngang nếu chưa có điểm */}
                    <div
                      className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl font-bold shadow-inner ${session.score >= 80 ? 'border border-green-500/30 bg-green-500/20 text-green-500' : session.score >= 50 ? 'border border-yellow-500/30 bg-yellow-500/20 text-yellow-500' : session.score > 0 ? 'border border-red-500/30 bg-red-500/20 text-red-500' : 'bg-gray-700 text-gray-400'}`}
                    >
                      <span className="text-lg">{session.score || '-'}</span>
                    </div>
                  </div>

                  <h3 className="mb-1 truncate text-lg font-bold text-white transition-colors group-hover:text-amber-500">
                    {session.topic_title}
                  </h3>
                  <p className="mb-4 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} /> {new Date(session.created_at).toLocaleString('vi-VN')}
                  </p>

                  <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500/10 py-2 text-xs font-bold text-amber-500 transition-all hover:bg-amber-500 hover:text-white">
                      <Eye size={14} /> {session.report_card ? 'Xem chi tiết' : 'Chưa có điểm'}
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      className="rounded-lg bg-white/5 p-2 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-500"
                      title="Xóa lịch sử này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL BẢNG ĐIỂM  */}
        {selectedReport && (
          <div
            className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md duration-200"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-[#1a1a1a] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 z-10 h-2 w-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"></div>

              <div
                className="flex-1 overflow-y-auto overscroll-contain p-6"
                style={{ scrollbarWidth: 'none' }}
                onWheel={(e) => e.stopPropagation()}
              >
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                <h2 className="mt-2 mb-6 text-center text-2xl font-bold text-white">
                  📊 Kết quả Phiên học
                </h2>

                <div className="mb-6 flex justify-center">
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                    <span className="text-4xl font-extrabold text-white">
                      {selectedReport.score}
                    </span>
                    <span className="text-xs tracking-widest text-amber-300 uppercase">Điểm</span>
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-500">
                    <Bot size={16} /> Nhận xét của AI:
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-300 italic">
                    "{selectedReport.feedback}"
                  </p>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <h4 className="mb-3 text-xs font-bold text-red-400 uppercase">Cần khắc phục</h4>
                    <ul className="list-inside list-disc space-y-2 text-xs text-gray-400">
                      {selectedReport.mistakes?.length > 0 ? (
                        selectedReport.mistakes.map((m, i) => (
                          <li key={i} className="leading-relaxed">
                            {m}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">Không có lỗi đáng kể.</li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                    <h4 className="mb-3 text-xs font-bold text-green-400 uppercase">Từ vựng tốt</h4>
                    <ul className="list-inside list-disc space-y-2 text-xs text-gray-400">
                      {selectedReport.best_words?.length > 0 ? (
                        selectedReport.best_words.map((w, i) => (
                          <li key={i} className="leading-relaxed">
                            {w}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">Chưa ghi nhận.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="z-10 border-t border-white/10 bg-[#1a1a1a] p-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full rounded-xl bg-gray-700 py-3 font-bold text-white transition-colors hover:bg-gray-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiHistoryPage;
