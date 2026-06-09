'use client';
import { useState, useEffect } from 'react';
import { booksApi } from '@/lib/books';
import { readerBorrowsApi } from '@/lib/borrows';
import { tokenStore } from '@/lib/api';
import type { BookTitle } from '@/lib/types';
import { X, BookmarkPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Props = {
  bookId: number | null;
  onClose: () => void;
};

export default function BookDetailModal({ bookId, onClose }: Props) {
  const [book, setBook] = useState<(BookTitle & { price?: number }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [readerType, setReaderType] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!bookId) {
      setBook(null);
      setError('');
      setSuccess('');
      return;
    }
    setLoading(true);
    booksApi.getById(bookId)
      .then(setBook)
      .catch((e) => setError(e.message || 'Lỗi tải sách'))
      .finally(() => setLoading(false));

    const token = tokenStore.get();
    setIsLoggedIn(!!token);
    setUserLoaded(false);
    if (token) {
      fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : null)
        .then((u) => {
          setReaderType(u?.readerType || '');
          setUserLoaded(true);
        })
        .catch(() => setUserLoaded(true));
    } else {
      setUserLoaded(true);
    }
  }, [bookId]);

  const handleBorrow = async () => {
    if (!book) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const record = await readerBorrowsApi.reserve(book.id);
      setSuccess(`Đặt sách thành công! Mã phiếu: ${String(record.borrowCode).padStart(4, '0')}. Vui lòng đến thư viện trong 24h để nhận sách.`);
    } catch (e: any) {
      setError(e.message || 'Lỗi đặt sách');
    } finally {
      setSubmitting(false);
    }
  };

  if (!bookId) return null;

  const price = book?.price || 0;
  const isExternal = readerType === 'EXTERNAL';
  const isInternal = readerType === 'INTERNAL';
  const showDeposit = isExternal && price > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Chi tiết tài liệu</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={40} /></div>
          ) : !book ? (
            <div className="text-center py-20 text-gray-500">{error || 'Không tải được dữ liệu'}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="aspect-3/4 bg-gray-100 rounded-xl overflow-hidden">
                  {(book.coverImageUrl || book.coverImage) ? (
                    <img
                      src={(book.coverImageUrl || book.coverImage)?.startsWith('http') ? (book.coverImageUrl || book.coverImage) : `${API_URL}${book.coverImageUrl || book.coverImage}`}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>

                {showDeposit && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
                    <span className="text-gray-700">* Phí cọc (100%): </span>
                    <span className="font-bold text-red-600">{price.toLocaleString('vi-VN')}đ</span>
                    <p className="text-xs text-gray-600 mt-1">
                      Tiền cọc sẽ trừ vào ví khi đặt sách. Khi trả sẽ hoàn lại sau khi trừ phí thuê 3.000đ/ngày và phạt trễ (nếu có).
                    </p>
                  </div>
                )}

                {isInternal && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                    <span className="font-bold text-green-700">✓ Mượn miễn phí</span>
                    <p className="text-xs text-gray-600 mt-1">
                      Bạn là độc giả nội bộ, không cần đặt cọc. Sẽ phạt 5.000đ/ngày nếu trả trễ.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap gap-2 mb-3">
                  {((book.categories?.map(c => c.name) || book.categoryNames) || []).map((c) => (
                    <span key={c} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold uppercase">{c}</span>
                  ))}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">{book.title}</h2>

                <div className="text-sm text-gray-600 space-x-4 mb-4">
                  <span><span className="text-gray-500">Tác giả:</span> <span className="font-bold text-gray-800">{((book.authors?.map(a => a.name) || book.authorNames) || []).join(', ') || 'N/A'}</span></span>
                  <span><span className="text-gray-500">NXB:</span> <span className="font-bold text-gray-800">{book.publisher?.name || (book.publisherNames || []).join(', ') || 'N/A'}</span></span>
                  <span><span className="text-gray-500">Năm XB:</span> <span className="font-bold text-gray-800">{book.publicationYear || 'N/A'}</span></span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-6 flex-1">
                  {book.description || 'Chưa có mô tả.'}
                </p>

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex gap-2 mb-3">
                    <CheckCircle2 size={20} className="shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
                {error && !loading && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex gap-2 mb-3">
                    <AlertCircle size={20} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {!isLoggedIn ? (
                  <button
                    onClick={() => (window.location.href = '/login')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    Đăng nhập để mượn sách
                  </button>
                ) : success ? (
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold"
                  >
                    Đóng
                  </button>
                ) : !userLoaded ? (
                  <button disabled className="w-full bg-gray-300 text-white py-3.5 rounded-xl font-bold">
                    <Loader2 className="inline animate-spin mr-2" size={16} />Đang kiểm tra...
                  </button>
                ) : (
                  <button
                    onClick={handleBorrow}
                    disabled={submitting}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <BookmarkPlus size={18} />}
                    {isExternal && price > 0
                      ? `Mượn sách (Cọc ${price.toLocaleString('vi-VN')}đ)`
                      : isInternal
                      ? 'Mượn sách (Miễn phí)'
                      : 'Mượn sách này'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}