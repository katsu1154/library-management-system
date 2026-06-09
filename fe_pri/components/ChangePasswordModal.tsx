'use client';
import { useState } from 'react';
import { X, Loader2, Lock } from 'lucide-react';
import { tokenStore } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPwd !== confirmPwd) return setError('Mật khẩu mới không khớp');
    if (newPwd.length < 6) return setError('Mật khẩu mới tối thiểu 6 ký tự');

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenStore.get()}` },
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      if (!res.ok) throw new Error((await res.text()) || 'Lỗi đổi mật khẩu');
      alert('✅ Đổi mật khẩu thành công!');
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2"><Lock size={18} className="text-red-600" />Đổi mật khẩu</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Mật khẩu hiện tại *</label>
            <input type="password" required value={oldPwd} onChange={(e) => setOldPwd(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Mật khẩu mới *</label>
            <input type="password" required value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Nhập lại mật khẩu mới *</label>
            <input type="password" required value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
          </div>
          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm border rounded-lg">Hủy</button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center gap-2">
              {submitting && <Loader2 size={14} className="animate-spin" />}Xác nhận đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}