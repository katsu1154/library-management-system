'use client';
import { useState, useEffect } from 'react';
import { feedbacksApi, type Feedback, type FeedbackType, TYPE_LABELS, STATUS_LABELS } from '@/lib/feedbacks';
import { Send, Loader2, MessageSquare, Paperclip } from 'lucide-react';

const TYPE_OPTIONS: FeedbackType[] = ['BOOK_DAMAGE', 'BOOK_REQUEST', 'SERVICE_FEEDBACK', 'OTHER'];

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-gray-600',
  PROCESSING: 'text-orange-600',
  RESOLVED: 'text-green-600',
  REJECTED: 'text-red-600',
};

export default function MyFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<FeedbackType>('BOOK_DAMAGE');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      setFeedbacks(await feedbacksApi.myFeedbacks());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return setError('Vui lòng nhập nội dung');
    setSubmitting(true);
    setError('');
    try {
      await feedbacksApi.create({ type, content: content.trim(), attachment: attachment || undefined });
      setContent('');
      setAttachment(null);
      alert('Gửi phản ánh thành công!');
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageSquare className="text-red-600" /> Phản ánh / Hỗ trợ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-bold text-gray-800 mb-4 pb-3 border-b">Gửi Phản ánh / Đề xuất</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">Loại phản ánh</label>
              <select value={type} onChange={(e) => setType(e.target.value as FeedbackType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">Nội dung chi tiết</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
                placeholder="Nhập nội dung chi tiết..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">Đính kèm ảnh (Nếu có)</label>
              <div className="flex items-center gap-3">
                <input type="file" id="fb-file" className="hidden" accept="image/*" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => document.getElementById('fb-file')?.click()} className="bg-red-100 text-red-700 px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-red-200">
                  <Paperclip size={14} /> {attachment ? 'Đổi ảnh' : 'Chọn ảnh'}
                </button>
                <span className="text-sm text-gray-500 max-w-[200px] truncate">{attachment ? attachment.name : 'Chưa chọn tệp'}</span>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

            <button type="submit" disabled={submitting}
              className="w-full bg-[#1e293b] hover:bg-slate-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Gửi yêu cầu
            </button>
          </form>
        </div>

        {/* DANH SÁCH */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-bold text-gray-800 mb-4 pb-3 border-b">Yêu cầu đã gửi</h2>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-500" size={24} /></div>
          ) : feedbacks.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-10">Bạn chưa gửi phản ánh nào.</p>
          ) : (
            <div className="space-y-3 max-h-125 overflow-y-auto">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded">{TYPE_LABELS[fb.type]}</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(fb.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2 mb-2">{fb.content}</p>
                  {fb.attachmentUrl && (
                    <img src={fb.attachmentUrl} alt="Attachment" className="max-h-32 rounded-lg object-cover mb-2 border border-gray-200" />
                  )}
                  <p className="text-xs">
                    <span className="text-gray-500">Trạng thái: </span>
                    <span className={`font-bold ${STATUS_COLOR[fb.status] || 'text-gray-700'}`}>{STATUS_LABELS[fb.status]}</span>
                  </p>
                  {fb.adminResponse && (
                    <div className="mt-2 pt-2 border-t bg-blue-50/30 -mx-3 px-3 -mb-3 pb-3 rounded-b-lg">
                      <p className="text-xs font-bold text-blue-700 mb-1">Phản hồi từ thư viện:</p>
                      <p className="text-xs text-gray-700">{fb.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}