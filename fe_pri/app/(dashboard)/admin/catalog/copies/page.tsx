'use client';
import React, { useState, useEffect } from 'react';
import { bookCopiesApi } from '@/lib/bookCopies';
import { booksApi } from '@/lib/books';
import { shelvesApi } from '@/lib/shelves';
import type { BookCopy, BookTitle, ShelfLocation } from '@/lib/types';
import {
  Search, Plus, Edit, Trash2, X, Loader2,
  ChevronDown, BookOpen, PenTool, MapPin, Layers
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Sẵn sàng', color: 'bg-emerald-100 text-emerald-800' },
  BORROWED: { label: 'Đang mượn', color: 'bg-amber-100 text-amber-800' },
  LOST: { label: 'Đã mất', color: 'bg-gray-100 text-gray-800' },
  DAMAGED: { label: 'Hư hỏng', color: 'bg-red-100 text-red-800' },
  MAINTENANCE: { label: 'Bảo trì', color: 'bg-orange-100 text-orange-800' },
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


export default function BookCopyManagementPage() {
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [bookTitles, setBookTitles] = useState<BookTitle[]>([]);
  const [shelves, setShelves] = useState<ShelfLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<BookCopy | null>(null);
  const [bookId, setBookId] = useState<number | ''>('');
  const [status, setStatus] = useState('AVAILABLE');
  const [copyCodeInput, setCopyCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, b, s] = await Promise.all([
        bookCopiesApi.list(),
        booksApi.list(),
        shelvesApi.list(),
      ]);
      setCopies(c);
      setBookTitles(b);
      setShelves(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredBooks = bookTitles.filter((b) => {
    const authorStr = ((b.authors?.map(a => a.name) || b.authorNames) || []).join(', ').toLowerCase();
    return b.title.toLowerCase().includes(search.toLowerCase()) ||
           authorStr.includes(search.toLowerCase());
  });

  const openAdd = (preselectedBookId?: number) => {
    setEditing(null);
    setBookId(preselectedBookId || '');
    setStatus('AVAILABLE');
    setCopyCodeInput('');
    setError('');
    setIsOpen(true);
  };

  const openEdit = (c: BookCopy) => {
    setEditing(c);
    setBookId(c.book?.id || c.bookId || '');
    setStatus(c.status);
    setCopyCodeInput(c.copyCode);
    setError('');
    setIsOpen(true);
  };

  const genCopyCode = (bid: number) => {
    const num = String(Date.now()).slice(-6);
    return `TLU-B${bid}-C${num}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!bookId) return setError('Chọn đầu sách');
    setSubmitting(true);
    try {
      const data = {
        copyCode: editing ? copyCodeInput : genCopyCode(Number(bookId)),
        status,
        bookId: Number(bookId),
      };
      if (editing) await bookCopiesApi.update(editing.id, data);
      else await bookCopiesApi.create(data);
      setIsOpen(false);
      fetchAll();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: BookCopy) => {
    if (!confirm(`Xóa bản sao "${c.copyCode}"?`)) return;
    try { await bookCopiesApi.remove(c.id); fetchAll(); } catch (e: any) { alert(e.message); }
  };

  const toggleExpand = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="grow p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh mục Sách</h2>
          <p className="text-sm text-gray-500 mt-1">Chế độ xem bảng: Quản lý chi tiết từng đầu sách và các bản sao trực tiếp.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          <button onClick={() => openAdd()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-md shadow-indigo-200 text-sm font-medium transition-all flex items-center gap-2 shrink-0">
            <Plus size={18} /> Thêm bản sao
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold w-16 text-center">Bìa</th>
                <th className="px-6 py-4 font-semibold">Thông tin sách</th>
                <th className="px-6 py-4 font-semibold">Nhà xuất bản</th>
                <th className="px-6 py-4 font-semibold text-center">Số lượng</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><Loader2 className="animate-spin text-indigo-500 mx-auto" size={24} /></td></tr>
              ) : filteredBooks.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">Không tìm thấy sách nào.</td></tr>
              ) : (
                filteredBooks.map((book) => {
                  const bookCopies = copies.filter(c => c.book?.id === book.id || c.bookId === book.id);
                  const isExpanded = expandedRow === book.id;

                  return (
                    <React.Fragment key={book.id}>
                      <tr className="hover:bg-indigo-50/30 transition-colors group bg-white relative z-10">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="w-12 h-16 bg-indigo-50 text-indigo-300 rounded shadow-sm border border-indigo-100 mx-auto flex items-center justify-center overflow-hidden">
                            {book.coverImageUrl ? (
                              <img src={book.coverImageUrl.startsWith('http') ? book.coverImageUrl : `${API_URL}${book.coverImageUrl}`} alt={book.title} className="w-full h-full object-cover" />
                            ) : <div className="flex items-center justify-center text-xs text-gray-400 h-full text-center">No img</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 text-base mb-1">{book.title}</div>
                          <div className="text-gray-500 flex items-center gap-1.5 text-xs mb-1">
                            <PenTool size={12} className="text-gray-400" /> {book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật'}
                          </div>
                          <div className="text-gray-500 flex items-center gap-1.5 text-xs">
                            <MapPin size={12} className="text-gray-400" /> Vị trí kệ: <span className="font-medium text-indigo-600">{book.shelf?.name || 'Chưa xếp kệ'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {book.publisher?.name || 'Đang cập nhật'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 font-semibold h-7 px-3 rounded-full border border-gray-200">
                            {bookCopies.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => toggleExpand(book.id)}
                            className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${isExpanded ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white'}`}
                          >
                            <span>Bản sao</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={5} className="p-0 border-0">
                          <div className={`grid transition-all duration-300 ease-in-out bg-slate-50 ${isExpanded ? 'grid-rows-[1fr] opacity-100 border-b-2 border-indigo-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                              <div className="px-12 py-6">
                                <div className="flex justify-between items-end mb-4">
                                  <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
                                    <Layers size={16} /> Danh sách mã vật lý
                                  </h4>
                                </div>

                                {bookCopies.length > 0 ? (
                                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                      <thead className="bg-gray-100/50 text-gray-500">
                                        <tr>
                                          <th className="px-4 py-2.5 font-medium">Mã Bản Sao</th>
                                          <th className="px-4 py-2.5 font-medium text-center">Tình trạng</th>
                                          <th className="px-4 py-2.5 font-medium text-right">Hành động</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {bookCopies.map(copy => {
                                          const st = STATUS_LABELS[copy.status] || { label: copy.status, color: 'bg-gray-100 text-gray-800' };
                                          return (
                                            <tr key={copy.id} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 font-mono text-indigo-700 font-medium">{copy.copyCode}</td>
                                              <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>
                                                  {st.label}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-3">
                                                  <button onClick={() => openEdit(copy)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                                                  <button onClick={() => handleDelete(copy)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                                    <BookOpen className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm">Chưa có bản sao vật lý nào trong kho.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">{editing ? 'Sửa Bản sao' : 'Thêm Bản sao'}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm border border-red-200">{error}</div>}

              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Đầu sách *</label>
                <select value={bookId} onChange={(e) => setBookId(e.target.value === '' ? '' : Number(e.target.value))} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">-- Chọn đầu sách --</option>
                  {bookTitles.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Mã bản sao</label>
                  <input
                    type="text"
                    value={editing ? copyCodeInput : ''}
                    onChange={(e) => setCopyCodeInput(e.target.value)}
                    disabled={!editing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50 outline-none disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Trạng thái</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                    {Object.entries(STATUS_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Hủy bỏ</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm">
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