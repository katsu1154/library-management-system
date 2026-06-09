'use client';
import { useState, useEffect } from 'react';
import { shelvesApi } from '@/lib/shelves';
import type { ShelfLocation } from '@/lib/types';
import { Search, Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import Pagination from '@/components/categories/Pagination';
import toast, { Toaster } from 'react-hot-toast';

export default function ShelfManagementPage() {
  const [shelves, setShelves] = useState<ShelfLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const size = 5;
  const [totalPages, setTotalPages] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ShelfLocation | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      setShelves(await shelvesApi.list());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = shelves.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setPage(0);
  }, [search]);

  useEffect(() => {
    const newTotalPages = Math.ceil(filtered.length / size);
    setTotalPages(newTotalPages);

    if (page >= newTotalPages && newTotalPages > 0) {
      setPage(newTotalPages - 1);
    }
  }, [filtered.length, size, page]);

  const displayShelves = filtered.slice(page * size, (page + 1) * size);

  const openAdd = () => {
    setEditing(null);
    setName(''); setLocation(''); setDescription(''); setMaxCapacity(0);
    setError('');
    setIsOpen(true);
  };

  const openEdit = (s: ShelfLocation) => {
    setEditing(s);
    setName(s.name || '');
    setLocation(s.location || '');
    setDescription(s.description || '');
    setMaxCapacity(s.maxCapacity || 0);
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Vui lòng nhập tên kệ');
    setSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        maxCapacity: maxCapacity,
      };
      if (editing) {
        await shelvesApi.update(editing.id, data);
        toast.success('Cập nhật kệ sách thành công!'); 
      } else {
        await shelvesApi.create(data);
        toast.success('Thêm kệ sách thành công!');   
      }
      setIsOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s: ShelfLocation) => {
    if (!confirm(`Xóa kệ "${s.name}"?`)) return;
    try {
      await shelvesApi.remove(s.id);
      toast.success('Đã xóa kệ sách!');             
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="grow p-6 w-full max-w-7xl mx-auto">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Kệ sách</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý vị trí, khu vực và các ngăn kệ trong thư viện.</p>
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
            <Plus size={18} /> Thêm kệ mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[50vh]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr className="text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Tên kệ</th>
                <th className="px-6 py-4 font-bold">Vị trí</th>
                <th className="px-6 py-4 font-bold">Mô tả</th>
                <th className="px-6 py-4 font-bold text-center">Tình trạng</th>
                <th className="px-6 py-4 font-bold text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 flex flex-col items-center justify-center h-full"><Loader2 className="animate-spin text-gray-400" size={24} /></td></tr>
              ) : displayShelves.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">Chưa có kệ nào.</td></tr>
              ) : displayShelves.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{s.location || '---'}</td>
                    <td className="px-6 py-4 text-gray-600">{s.description || '---'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 font-bold h-7 px-3 rounded-full border border-gray-200">
                        {s.currentCapacity} / {s.maxCapacity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openEdit(s)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Sửa"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(s)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Xóa"><Trash2 size={18} /></button>
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

      {/* MODAL GIAO DIỆN MỚI */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">{editing ? 'Sửa Kệ Sách' : 'Thêm Kệ Sách'}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm border border-red-200">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Tên kệ *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Vị trí</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Mô tả</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Sức chứa tối đa (Quyển) *</label>
                <input type="number" min="1" value={maxCapacity} onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white transition-all" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors">Hủy bỏ</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors">
                  {submitting && <Loader2 size={14} className="animate-spin" />} Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}