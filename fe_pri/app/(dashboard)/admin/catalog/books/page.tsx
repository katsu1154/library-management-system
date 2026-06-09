'use client';
import { useState, useEffect, useMemo } from 'react';
import { booksApi } from '@/lib/books';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import BookFormModal from '@/components/admin/BookFormModal';
import Pagination from '@/components/categories/Pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const formatBookId = (id: number) => `S-${String(id).padStart(3, '0')}`;

export default function BookManagementPage() {
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const size = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingBook, setEditingBook] = useState<any | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data: any = await booksApi.list(); 
      const booksArray = Array.isArray(data) ? data : (data.content || data.data || []);
      
      setAllBooks([...booksArray].sort((a, b) => b.id - a.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return allBooks;
    const q = searchTerm.toLowerCase();
    return allBooks.filter(b => 
      b.title?.toLowerCase().includes(q) || 
      formatBookId(b.id).toLowerCase().includes(q)
    );
  }, [allBooks, searchTerm]);

  const totalPages = Math.ceil(filteredBooks.length / size);
  const paginatedBooks = filteredBooks.slice(page * size, (page + 1) * size);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const handleAdd = () => {
    setModalMode('add');
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const fullBook = await booksApi.getById(id);
      setModalMode('edit');
      setEditingBook(fullBook);
      setIsModalOpen(true);
    } catch (e: any) {
      alert(e.message || 'Lỗi tải dữ liệu');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Xóa đầu sách "${title}"?`)) return;
    try {
      await booksApi.deleteBook(id);
      fetchBooks();
    } catch (e: any) {
      alert(e.message);
    }
  };


  return (
    <div className="grow p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Đầu sách</h2>
          <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa và quản lý thông tin các đầu sách trong hệ thống.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition-all"
            />
          </div>
          <button onClick={handleAdd} className="bg-[#dc2626] hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md shadow-red-200 text-sm font-medium transition-all flex items-center gap-2 shrink-0">
            <Plus size={18} /> Thêm đầu sách
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b bg-gray-50/80">
                <th className="px-6 py-4 font-bold">STT</th>
                <th className="px-6 py-4 font-bold">Vị trí kệ</th>
                <th className="px-6 py-4 font-bold">Mã sách</th>
                <th className="px-6 py-4 font-bold text-center">Ảnh bìa</th>
                <th className="px-6 py-4 font-bold">Tên sách</th>
                <th className="px-6 py-4 font-bold">Tác giả</th>
                <th className="px-6 py-4 font-bold">NXB</th>
                <th className="px-6 py-4 font-bold">Thể loại</th>
                <th className="px-6 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-500">Đang tải...</td></tr>
              ) : paginatedBooks.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-500">Không tìm thấy đầu sách nào.</td></tr>
              ) : (
                paginatedBooks.map((book, i) => (
                  <tr key={book.id} className="hover:bg-gray-50/50 group">
                    <td className="px-6 py-4 text-gray-500">{page * size + i + 1}</td>
                    
                    <td className="px-6 py-4 font-medium text-indigo-600">
                      {book.shelf?.name || '---'}
                    </td>
                    
                    <td className="px-6 py-4 font-semibold">{formatBookId(book.id)}</td>
                    
                    <td className="px-6 py-4">
                      <div className="w-10 h-14 bg-gray-100 rounded-md overflow-hidden border mx-auto">
                        {book.coverImageUrl ? (
                          <img src={book.coverImageUrl.startsWith('http') ? book.coverImageUrl : `${API_URL}${book.coverImageUrl}`} alt={book.title} className="w-full h-full object-cover" />
                        ) : <div className="flex items-center justify-center text-xs text-gray-400 h-full text-center">No img</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold max-w-50 truncate">{book.title}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-37.5 truncate">{book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : '---'}</td>
                    <td className="px-6 py-4 text-gray-600">{book.publisher?.name || '---'}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-37.5 truncate">{book.categories && book.categories.length > 0 ? book.categories.map((c: any) => c.name).join(', ') : '---'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleEdit(book.id)} className="text-blue-600 hover:text-blue-800" title="Sửa"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(book.id, book.title)} className="text-red-500 hover:text-red-700" title="Xóa"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      <BookFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        book={editingBook}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBooks}
      />
    </div>
  );
}