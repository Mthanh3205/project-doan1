import { useState, useEffect } from 'react';
import { Trash2, Eye, Bot, Calendar, Search, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AiSessionsManager() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  // LẤY DỮ LIỆU
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(
          'https://project-doan1-backend.onrender.com/api/admin/ai-sessions',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setSessions(data);
          setFilteredSessions(data);
        }
      } catch (err) {
        toast.error('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // XỬ LÝ TÌM KIẾM (Client-side search)
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = sessions.filter(
      (s) =>
        s.user?.name?.toLowerCase().includes(lowerTerm) ||
        s.user?.email?.toLowerCase().includes(lowerTerm) ||
        s.topic_title?.toLowerCase().includes(lowerTerm)
    );
    setFilteredSessions(filtered);
  }, [searchTerm, sessions]);

  //HÀM XÓA
  const handleDelete = async (id) => {
    if (!window.confirm('Xóa lịch sử học này? Hành động không thể hoàn tác.')) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/ai-sessions/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const newSessions = sessions.filter((s) => s.id !== id);
        setSessions(newSessions);
        setFilteredSessions(newSessions);
        toast.success('Đã xóa thành công');
      }
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  // HÀM XEM CHI TIẾT (Check null)
  const handleViewDetail = (session) => {
    if (!session.report_card) {
      toast.warning('Phiên học này không có bảng điểm (Dữ liệu cũ hoặc chưa kết thúc).');
      return;
    }
    setSelectedSession(session);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Bot className="text-amber-500" /> Quản lý Phiên học AI
          <span className="rounded-lg bg-white/10 px-2 py-1 text-sm font-normal text-gray-400">
            {sessions.length}
          </span>
        </h1>

        <div className="relative w-full md:w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm user, chủ đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#1a1a1a] pr-4 pl-10 text-sm text-gray-300 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-xl">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/5 text-xs text-gray-300 uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Người dùng</th>
              <th className="px-6 py-4 font-semibold">Chủ đề</th>
              <th className="px-6 py-4 text-center font-semibold">Điểm số</th>
              <th className="px-6 py-4 font-semibold">Thời gian</th>
              <th className="px-6 py-4 text-right font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredSessions.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Không tìm thấy kết quả nào.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr key={session.id} className="group transition-colors hover:bg-white/5">
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-600 text-xs font-bold text-white shadow-md">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Topic */}
                  <td className="px-6 py-4">
                    <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500">
                      {session.topic_title}
                    </span>
                  </td>
                  {/* Score */}
                  <td className="px-6 py-4 text-center">
                    {session.score > 0 ? (
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${session.score >= 80 ? 'border-green-500/20 bg-green-500/10 text-green-500' : session.score >= 50 ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}
                      >
                        {session.score}
                      </span>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                  {/* Date */}
                  <td className="flex h-full items-center gap-2 px-6 py-4 text-xs text-gray-500">
                    {new Date(session.created_at).toLocaleString('vi-VN')}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleViewDetail(session)}
                        className="rounded p-2 text-gray-500 transition hover:bg-blue-500/10 hover:text-blue-500"
                        title="Xem chi tiết bảng điểm"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="rounded p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-500"
                        title="Xóa phiên học"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT (GIAO DIỆN REPORT CARD)  */}
      {selectedSession && selectedSession.report_card && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="animate-in fade-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-[#1a1a1a] shadow-2xl duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="absolute top-0 left-0 z-10 h-2 w-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"></div>

            {/* Scroll Content */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain p-6"
              style={{ scrollbarWidth: 'none' }}
              onWheel={(e) => e.stopPropagation()}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>

              <h2 className="mt-2 mb-6 text-center text-xl font-bold text-white">
                Kết quả của <span className="text-amber-500">{selectedSession.user?.name}</span>
              </h2>

              <div className="mb-6 flex justify-center">
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  <span className="text-4xl font-extrabold text-white">
                    {selectedSession.score}
                  </span>
                  <span className="text-xs tracking-widest text-amber-300 uppercase">Điểm</span>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-500">
                  <Bot size={16} /> Nhận xét của AI:
                </h4>
                <p className="text-sm leading-relaxed text-gray-300 italic">
                  "{selectedSession.report_card.feedback}"
                </p>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-red-400 uppercase">
                    <AlertCircle size={14} /> Cần khắc phục
                  </h4>
                  <ul className="list-inside list-disc space-y-2 text-xs text-gray-400">
                    {selectedSession.report_card.mistakes?.length > 0 ? (
                      selectedSession.report_card.mistakes.map((m, i) => (
                        <li key={i} className="leading-relaxed">
                          {m}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">Không có lỗi đáng kể.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="z-10 border-t border-white/10 bg-[#1a1a1a] p-4">
              <button
                onClick={() => setSelectedSession(null)}
                className="w-full rounded-xl bg-gray-700 py-3 font-bold text-white transition-colors hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
