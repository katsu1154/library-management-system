'use client';
import { useState, useEffect } from 'react';
import { authorsApi } from '@/lib/authors';
import { publishersApi } from '@/lib/publishers';
import type { Author, Publisher } from '@/lib/types';
import Pagination from '@/components/categories/Pagination';
import { Search, UserPlus, Building2, Edit, Trash2, X, Loader2 } from 'lucide-react';

type Tab = 'authors' | 'publishers';

export default function AuthorsPublishersPage() {
  const [tab, setTab] = useState<Tab>('authors');
  const [search, setSearch] = useState('');

  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const size = 5;
  const [totalPages, setTotalPages] = useState(0);

  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [publisherModalOpen, setPublisherModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [a, p] = await Promise.all([authorsApi.list(), publishersApi.list()]);
      setAuthors(a);
      setPublishers(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredAuthors = authors.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPublishers = publishers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeDataLength = tab === 'authors' ? filteredAuthors.length : filteredPublishers.length;

  useEffect(() => {
    setPage(0);
  }, [tab, search]);

  useEffect(() => {
    const newTotalPages = Math.ceil(activeDataLength / size);
    setTotalPages(newTotalPages);
    
    if (page >= newTotalPages && newTotalPages > 0) {
      setPage(newTotalPages - 1);
    }
  }, [activeDataLength, size, page]);

  const displayAuthors = filteredAuthors.slice(page * size, (page + 1) * size);
  const displayPublishers = filteredPublishers.slice(page * size, (page + 1) * size);

  const openAddAuthor = () => { setEditingAuthor(null); setAuthorModalOpen(true); };
  const openEditAuthor = (a: Author) => { setEditingAuthor(a); setAuthorModalOpen(true); };
  const openAddPublisher = () => { setEditingPublisher(null); setPublisherModalOpen(true); };
  const openEditPublisher = (p: Publisher) => { setEditingPublisher(p); setPublisherModalOpen(true); };

  const deleteAuthor = async (a: Author) => {
    if (!confirm(`Xóa tác giả "${a.name}"?`)) return;
    try { await authorsApi.remove(a.id); fetchData(); } catch (e: any) { alert(e.message); }
  };
  const deletePublisher = async (p: Publisher) => {
    if (!confirm(`Xóa NXB "${p.name}"?`)) return;
    try { await publishersApi.remove(p.id); fetchData(); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="grow p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tác giả & Nhà Xuất Bản</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh sách tác giả và các nhà xuất bản của hệ thống thư viện.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
          <button onClick={openAddAuthor} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md shadow-blue-200 text-sm font-medium transition-all flex items-center gap-2 shrink-0">
            <UserPlus size={18} /> Tác giả
          </button>
          <button onClick={openAddPublisher} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-md shadow-purple-200 text-sm font-medium transition-all flex items-center gap-2 shrink-0">
            <Building2 size={18} /> NXB
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[60vh]">
        <div className="px-6 border-b flex gap-6 bg-gray-50/50">
          <button
            onClick={() => setTab('authors')}
            className={`py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'authors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            Danh sách Tác giả
          </button>
          <button
            onClick={() => setTab('publishers')}
            className={`py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'publishers' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            Danh sách Nhà Xuất Bản
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <Loader2 className="animate-spin text-gray-400 mb-2" size={24} />
              <span className="text-gray-500 text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : tab === 'authors' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold w-20 text-center">Ảnh</th>
                  <th className="px-6 py-4 font-bold">Tên tác giả</th>
                  <th className="px-6 py-4 font-bold">Tiểu sử</th>
                  <th className="px-6 py-4 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {displayAuthors.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-500">Chưa có tác giả nào.</td></tr>
                ) : displayAuthors.map((a) => {
                  const initials = a.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm mx-auto shadow-sm">
                          {initials}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{a.name}</td>
                      <td className="px-6 py-4 text-gray-600 line-clamp-2" title={a.biography}>{a.biography || '---'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => openEditAuthor(a)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"><Edit size={18} /></button>
                          <button onClick={() => deleteAuthor(a)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Tên NXB</th>
                  <th className="px-6 py-4 font-bold">Địa chỉ</th>
                  <th className="px-6 py-4 font-bold">Liên hệ</th>
                  <th className="px-6 py-4 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {displayPublishers.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-500">Chưa có NXB nào.</td></tr>
                ) : displayPublishers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-gray-600">{p.address || '---'}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-pre-wrap">{p.contactInfo || '---'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openEditPublisher(p)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"><Edit size={18} /></button>
                        <button onClick={() => deletePublisher(p)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

      <AuthorModal
        isOpen={authorModalOpen}
        author={editingAuthor}
        onClose={() => setAuthorModalOpen(false)}
        onSuccess={fetchData}
      />
      <PublisherModal
        isOpen={publisherModalOpen}
        publisher={editingPublisher}
        onClose={() => setPublisherModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}

function AuthorModal({ isOpen, author, onClose, onSuccess }: { isOpen: boolean; author: Author | null; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setName(author?.name || '');
    setBiography(author?.biography || '');
    setError('');
  }, [isOpen, author]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Vui lòng nhập họ tên');
    setSubmitting(true);
    try {
      const data = { name: name.trim(), biography: biography.trim() };
      if (author) await authorsApi.update(author.id, data);
      else await authorsApi.create(data);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-900">{author ? 'Sửa Tác giả' : 'Thêm Tác giả'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm border border-red-200">{error}</div>}
          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700">Họ tên *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700">Tiểu sử</label>
            <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">Hủy bỏ</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors">
              {submitting && <Loader2 size={14} className="animate-spin" />} Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PublisherModal({
  isOpen, publisher, onClose, onSuccess
}: {
  isOpen: boolean;
  publisher: Publisher | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setName(publisher?.name || '');
    setAddress(publisher?.address || '');
    setContactInfo(publisher?.contactInfo || '');
    setError('');
  }, [isOpen, publisher]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Vui lòng nhập tên NXB');
    setSubmitting(true);
    try {
      const data = { name: name.trim(), address: address.trim(), contactInfo: contactInfo.trim() };
      if (publisher) await publishersApi.update(publisher.id, data);
      else await publishersApi.create(data);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-900">{publisher ? 'Sửa NXB' : 'Thêm Nhà Xuất Bản'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm border border-red-200">{error}</div>}

          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700">Tên NXB *</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700">Địa chỉ</label>
            <input
              type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700">Thông tin liên hệ</label>
            <textarea
              value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} rows={3} placeholder="SĐT, Email, Ghi chú..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">Hủy bỏ</button>
            <button
              type="submit" disabled={submitting}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />} Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}