'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import BookCard from '@/components/home/BookCard';
import { booksApi } from '@/lib/books';
import { categoriesApi } from '@/lib/categories';
import type { BookTitle, Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import BookDetailModal from '@/components/BookDetailModal';
export default function HomePage() {
  const router = useRouter();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [latestBooks, setLatestBooks] = useState<BookTitle[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([categoriesApi.list(), booksApi.list()]).then(
      ([catRes, bookRes]) => {
        if (catRes.status === 'fulfilled') {
          setCategories(catRes.value);
        } else {
          console.error('Lỗi load categories:', catRes.reason);
        }
        setLoadingCats(false);

        if (bookRes.status === 'fulfilled') {
          const sorted = [...bookRes.value].sort((a, b) => b.id - a.id);
          setLatestBooks(sorted.slice(0, 4));
        } else {
          console.error('Lỗi load books:', bookRes.reason);
          setError('Không tải được danh sách sách. Vui lòng thử lại.');
        }
        setLoadingBooks(false);
      }
    );
  }, []);

  const handleSearch = (keyword: string, categoryId: number | null) => {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (categoryId) params.set('categoryId', String(categoryId));
    router.push(`/categories?${params.toString()}`);
  };

  return (
    <>
      <HeroSection categories={categories} onSearch={handleSearch} />
      <CategoryGrid categories={categories} loading={loadingCats} />

      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Sách Mới Cập Nhật</h2>
          <p className="text-sm text-gray-500 mt-1">
            Những đầu sách và giáo trình mới nhất vừa được thêm vào kho.
          </p>
        </div>

        {loadingBooks ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-xl aspect-3/4 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-12 text-center">
            <p className="font-medium">{error}</p>
          </div>
        ) : latestBooks.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-6 py-12 text-center">
            <p>Chưa có sách nào trong thư viện.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {latestBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => setSelectedBookId(book.id)}
              />
            ))}
          </div>
        )}
      </section>
      <BookDetailModal
        bookId={selectedBookId}
        onClose={() => setSelectedBookId(null)}
      />
    </>
  );
}