'use client';
import { useState, useEffect } from 'react';
import { booksApi } from '@/lib/books';
import { categoriesApi } from '@/lib/categories';
import { authorsApi } from '@/lib/authors';
import { publishersApi } from '@/lib/publishers';
import { shelvesApi } from '@/lib/shelves';
import type { Author, Publisher, Category, BookTitle, ShelfLocation } from '@/lib/types';
import { X, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Props = {
  isOpen: boolean;
  mode: 'add' | 'edit';
  book: BookTitle | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function BookFormModal({ isOpen, mode, book, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [authorId, setAuthorId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [publisherId, setPublisherId] = useState<number | ''>('');
  const [defaultShelfId, setDefaultShelfId] = useState<number | ''>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shelves, setShelves] = useState<ShelfLocation[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([authorsApi.list(), publishersApi.list(), categoriesApi.list(), shelvesApi.list()])
      .then(([a, p, c, s]) => {
        setAuthors(a); setPublishers(p); setCategories(c); setShelves(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && book) {
      setTitle(book.title || '');
      setIsbn((book as any).isbn || '');
      setPublicationYear(book.publicationYear ? String(book.publicationYear) : '');
      setDescription(book.description || '');
      setPrice(book.price ? String(book.price) : '0');
      const b: any = book;
      setAuthorId(b.authors && b.authors.length > 0 ? b.authors[0].id : '');
      setCategoryId(b.categories && b.categories.length > 0 ? b.categories[0].id : '');
      setPublisherId(b.publisher?.id ?? '');
      setDefaultShelfId(b.shelf?.id ?? '');
      setCoverFile(null);
      const imgUrl = b.coverImageUrl || '';
      setCoverPreview(
        imgUrl
          ? imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`
          : ''
      );
    } else {
      setTitle(''); setIsbn(''); setPublicationYear(''); setDescription(''); setPrice('0');
      setAuthorId(''); setCategoryId(''); setPublisherId(''); setDefaultShelfId('');
      setCoverFile(null); setCoverPreview('');
    }
    setError('');
  }, [isOpen, mode, book]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tên đầu sách'); return; }
    if (!isbn.trim()) { setError('Vui lòng nhập mã ISBN'); return; }
    if (publisherId === '') { setError('Vui lòng chọn Nhà xuất bản'); return; }
    if (defaultShelfId === '') { setError('Vui lòng chọn Kệ mặc định'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('isbn', isbn);
      if (publicationYear) fd.append('publicationYear', publicationYear);
      fd.append('description', description);
      fd.append('price', price ? String(price) : '0');
      if (authorId) fd.append('authorIds', String(authorId));
      if (categoryId) fd.append('categoryIds', String(categoryId));
      if (publisherId !== '') fd.append('publisherId', String(publisherId));
      if (defaultShelfId !== '') fd.append('shelfId', String(defaultShelfId));
      
      if (coverFile) fd.append('coverImage', coverFile);

      if (mode === 'add') await booksApi.create(fd);
      else await booksApi.update(book!.id, fd);
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  if (!isOpen) return null;

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{mode === 'add' ? 'Thêm đầu sách mới' : 'Chỉnh sửa đầu sách'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

            {/* Ảnh bìa */}
            <div className="flex gap-4 items-start">
              {coverPreview && <img src={coverPreview} alt="preview" className="w-20 h-28 object-cover rounded-lg border" />}
              <div className="flex-1">
                <label className={labelCls}>Ảnh bìa {mode === 'add' && <span className="text-red-500">*</span>}</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Tên đầu sách <span className="text-red-500">*</span></label>
              <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Mã ISBN <span className="text-red-500">*</span></label>
                <input className={inputCls} value={isbn} onChange={e => setIsbn(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Năm xuất bản</label>
                <input className={inputCls} type="number" value={publicationYear} onChange={e => setPublicationYear(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Giá sách (tiền cọc đ)</label>
                <input className={inputCls} type="number" min="0" value={price} onChange={e => setPrice(e.target.value)}  />
              </div>
            </div>

            <div>
              <label className={labelCls}>Mô tả</label>
              <textarea className={inputCls} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả nội dung sách..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tác giả</label>
                <select className={inputCls} value={authorId} onChange={e => setAuthorId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">-- Chọn tác giả --</option>
                  {authors.map((a, i) => <option key={a.id ?? i} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Thể loại</label>
                <select className={inputCls} value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">-- Chọn thể loại --</option>
                  {categories.map((c, i) => <option key={c.id ?? i} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Nhà xuất bản</label>
                <select className={inputCls} value={publisherId} onChange={e => setPublisherId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">-- Chọn NXB --</option>
                  {publishers.map((p, i) => <option key={p.id ?? i} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Kệ mặc định</label>
                <select className={inputCls} value={defaultShelfId} onChange={e => setDefaultShelfId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">-- Chọn kệ sách --</option>
                  {shelves.map((s, i) => <option key={s.id ?? i} value={s.id}>{s.name} ({s.location || ''})</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {mode === 'add' ? 'Thêm sách' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
