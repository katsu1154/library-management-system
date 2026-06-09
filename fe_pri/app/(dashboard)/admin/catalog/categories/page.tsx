'use client';
import { useState, useEffect } from 'react';
import { categoriesApi } from '@/lib/categories';
import type { Category } from '@/lib/types';
import { Search, Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import Pagination from '@/components/categories/Pagination';

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 5;
  const [totalPages, setTotalPages] = useState(0);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      setCategories(data);
      setTotalPages(Math.ceil(data.length / size));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / size));
    if (page >= Math.ceil(filtered.length / size)) {
      setPage(0);
    }
  }, [search, filtered.length, size]);

  const currentData = filtered.slice(page * size, (page + 1) * size);

  const formatCode = (name: string) => {
    const words = name.trim().split(/\s+/);
    const initials = words.map((w) => w[0]?.toUpperCase()).join('').slice(0, 3);
    return `TL-${initials}`;
  };

  const openAdd = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setError('');
    setIsOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setDescription(c.description || '');
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Vui lòng nhập tên thể loại');
    setSubmitting(true);
    try {
      if (editing) {
        await categoriesApi.update(editing.id, { name: name.trim(), description: description.trim() });
      } else {
        await categoriesApi.create({ name: name.trim(), description: description.trim() });
      }
      setIsOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Xóa thể loại "${c.name}"?`)) return;
    try {
      await categoriesApi.remove(c.id);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="grow p-6 w-full max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh mục Thể loại</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý và phân loại các đầu sách trong thư viện.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition-all"
            />
          </div>
          <button onClick={openAdd} className="bg-[#dc2626] hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md shadow-red-200 text-sm font-medium transition-all flex items-center gap-2 shrink-0">
            <Plus size={18} /> Thêm thể loại
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr className="text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold w-32">Mã TL</th>
                <th className="px-6 py-4 font-bold">Tên thể loại</th>
                <th className="px-6 py-4 font-bold">Mô tả</th>
                <th className="px-6 py-4 font-bold w-32">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500 flex justify-center"><Loader2 className="animate-spin" size={24}/></td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">Chưa có thể loại nào.</td></tr>
              ) : currentData.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">{formatCode(c.name)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-75 truncate">{c.description || '---'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">Hoạt động</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => openEdit(c)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Sửa"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(c)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Xóa"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              current={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">{editing ? 'Sửa Thể loại' : 'Thêm Thể loại'}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm border border-red-200">{error}</div>}
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Tên thể loại *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Mô tả</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none transition-all" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors">Hủy bỏ</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors">
                  {submitting && <Loader2 size={14} className="animate-spin" />}Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}