'use client';
import { useState, useMemo } from 'react';
import { notificationsApi } from '@/lib/notifications';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ALL_TARGETS = [
  { value: 'ALL', label: 'Tất cả người dùng' },
  { value: 'INTERNAL', label: 'Sinh viên TLU' },
  { value: 'EXTERNAL', label: 'Độc giả ngoài trường' },
  { value: 'STAFF', label: 'Thủ thư / Kế toán' },
];

export default function SendNotificationPage() {
  const { user } = useAuth(); 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableTargets = useMemo(() => {
    const role = user?.roleName?.toUpperCase();
    
    if (role !== 'ROLE_ADMIN') {
      return ALL_TARGETS.filter((t) => t.value !== 'STAFF');
    }
    
    return ALL_TARGETS;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) return setError('Điền đủ tiêu đề + nội dung');
    setSubmitting(true);
    try {
      await notificationsApi.create({ title: title.trim(), content: content.trim(), targetType });
      alert('Đã gửi thông báo thành công!');
      setTitle(''); setContent(''); setTargetType('ALL');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Tạo và Gửi Thông báo</h1>

      <div className="bg-white rounded-xl border p-6">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl mx-auto">
          <div>
            <label className="block text-sm font-bold mb-1">Tiêu đề thông báo</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Đối tượng nhận thông báo</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableTargets.map((t) => (
                <label key={t.value} className={`border rounded-lg px-3 py-2.5 text-sm cursor-pointer flex items-center gap-2 transition-colors ${targetType === t.value ? 'border-red-500 bg-red-50 font-medium' : 'border-gray-300 hover:bg-gray-50'}`}>
                  <input type="radio" name="target" value={t.value} checked={targetType === t.value} onChange={(e) => setTargetType(e.target.value)} className="accent-red-600 w-4 h-4" />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Nội dung chi tiết</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Soạn nội dung thông báo tại đây..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
          </div>

          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

          <div className="flex justify-end">
            <button type="submit" disabled={submitting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}Gửi Thông Báo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}