'use client';
import { useState, useEffect } from 'react';
import { feedbacksApi, type Feedback, type FeedbackStatus, TYPE_LABELS, STATUS_LABELS } from '@/lib/feedbacks';
import { Search, Eye, X, Loader2 } from 'lucide-react';

const formatFeedbackId = (id: number) => `PA-${String(id).padStart(4, '0')}`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-red-50 text-red-700',
  PROCESSING: 'bg-orange-50 text-orange-700',
  RESOLVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-gray-100 text-gray-700',
};

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editing, setEditing] = useState<Feedback | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try { setFeedbacks(await feedbacksApi.allFeedbacks()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = feedbacks.filter((fb) => {
    const q = search.toLowerCase();
    const matchSearch = !q || formatFeedbackId(fb.id).toLowerCase().includes(q) || fb.senderName.toLowerCase().includes(q);
    const matchStatus = !filterStatus || fb.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col min-h-[85vh]">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold">Xử lý Phản ánh & Khiếu nại</h1>
      </div>

      <div className="p-4 bg-gray-50/50 border-b flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text"  value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
          <option value="">Trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium">Tìm kiếm</button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b">
              <th className="px-6 py-4 font-bold">Mã PA</th>
              <th className="px-6 py-4 font-bold">Thời gian</th>
              <th className="px-6 py-4 font-bold">Người gửi</th>
              <th className="px-6 py-4 font-bold">Tiêu đề</th>
              <th className="px-6 py-4 font-bold">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500"><Loader2 className="inline animate-spin" size={20} /> Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Không có phản ánh.</td></tr>
            ) : filtered.map((fb) => (
              <tr key={fb.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-gray-700">{formatFeedbackId(fb.id)}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(fb.createdAt)}</td>
                <td className="px-6 py-4 font-bold">{fb.senderName}</td>
                <td className="px-6 py-4 text-gray-700">{TYPE_LABELS[fb.type]}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[fb.status] || ''}`}>
                    {STATUS_LABELS[fb.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setEditing(fb)} className="text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                    <Eye size={12} />Xem & Xử lý
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProcessModal feedback={editing} onClose={() => setEditing(null)} onSuccess={() => { setEditing(null); fetchData(); }} />
      )}
    </div>
  );
}

function ProcessModal({ feedback, onClose, onSuccess }: { feedback: Feedback; onClose: () => void; onSuccess: () => void }) {
  const [response, setResponse] = useState(feedback.adminResponse || '');
  const [status, setStatus] = useState<FeedbackStatus>(feedback.status === 'PENDING' ? 'PROCESSING' : feedback.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await feedbacksApi.process(feedback.id, { status, adminResponse: response.trim() });
      alert('Cập nhật thành công!');
      onSuccess();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2"><Eye size={18} className="text-blue-600" />Xử lý Phản ánh</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded">{TYPE_LABELS[feedback.type]}</span>
              <span className="text-xs text-gray-500">{new Date(feedback.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <p className="text-sm font-bold text-gray-800 mb-2">Người gửi: {feedback.senderName} ({feedback.senderLoginName})</p>
            <p className="text-sm text-gray-700 italic">&quot;{feedback.content}&quot;</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5">Nội dung trả lời & Cập nhật trạng thái</label>
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={4}
              placeholder="Nhập nội dung trả lời..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5">Phân loại Trạng thái</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
              <option value="PROCESSING">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>

          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">Hủy</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader2 size={14} className="animate-spin" />}Lưu & Trả lời
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}