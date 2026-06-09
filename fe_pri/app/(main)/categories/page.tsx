'use client';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';

import BookCard from '@/components/home/BookCard';
import FilterSidebar from '@/components/categories/FilterSidebar';
import Pagination from '@/components/categories/Pagination';
import { booksApi } from '@/lib/books';
import { categoriesApi } from '@/lib/categories';
import type { BookTitle, Category } from '@/lib/types';


import BookDetailModal from '@/components/BookDetailModal';

const PAGE_SIZE = 9;

type SortValue = 'latest' | 'oldest' | 'title-asc';

const SORT_LABELS: Record<SortValue, string> = {
  latest: 'Mới nhất',
  oldest: 'Cũ nhất',
  'title-asc': 'A → Z',
};

export default function CategoriesPageWrapper() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CategoriesPage />
    </Suspense>
  );
}

function CategoriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialKeyword = searchParams.get('q') ?? '';
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const initialCategoryId = searchParams.get('categoryId');

  const [allBooks, setAllBooks] = useState<BookTitle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [keyword] = useState(initialKeyword); ày
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(
    initialCategoryId ? new Set([Number(initialCategoryId)]) : new Set()
  );
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(new Set());
  const [selectedPublishers, setSelectedPublishers] = useState<Set<string>>(new Set());
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sort, setSort] = useState<SortValue>('latest');
  const [page, setPage] = useState(0);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryIds(new Set([Number(initialCategoryId)]));
    } else {
      setSelectedCategoryIds(new Set());
    }
  }, [initialCategoryId]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.allSettled([
      categoriesApi.list(),
      booksApi.search({ keyword: keyword || undefined, size: 1000 }),
    ]).then(([catRes, bookRes]) => {
      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value);
      } else {
        console.error('Lỗi tải categories:', catRes.reason);
      }

      if (bookRes.status === 'fulfilled') {
        setAllBooks(Array.isArray(bookRes.value) ? bookRes.value : (bookRes.value as any).content || []);
      } else {
        console.error('Lỗi tải books:', bookRes.reason);
        setError('Không tải được danh sách sách. Vui lòng thử lại.');
      }

      setLoading(false);
    });
  }, [keyword]);

  useEffect(() => {
    setPage(0);
  }, [selectedCategoryIds, selectedAuthors, selectedPublishers, selectedYear, sort]);

  const authorOptions = useMemo(() => {
    const set = new Set<string>();
    allBooks.forEach((b) => {
      if (b.authors) b.authors.forEach((a) => set.add(a.name));
      if (b.authorNames) b.authorNames.forEach((a) => set.add(a));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [allBooks]);

  const publisherOptions = useMemo(() => {
    const set = new Set<string>();
    allBooks.forEach((b) => {
      if (b.publisher) set.add(b.publisher.name);
      if (b.publisherNames) b.publisherNames.forEach((p) => set.add(p));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [allBooks]);

  const yearOptions = useMemo(() => {
    const set = new Set<number>();
    allBooks.forEach((b) => b.publicationYear && set.add(b.publicationYear));
    return Array.from(set).sort((a, b) => b - a); // mới → cũ
  }, [allBooks]);

  const filteredBooks = useMemo(() => {
    let result = [...allBooks];

    if (selectedCategoryIds.size > 0) {
      const selectedNames = new Set(
        categories.filter((c) => selectedCategoryIds.has(c.id)).map((c) => c.name)
      );
      result = result.filter((b) => {
        const catNames = b.categories?.map(c => c.name) || b.categoryNames || [];
        return catNames.some((cn) => selectedNames.has(cn));
      });
    }

    if (selectedAuthors.size > 0) {
      result = result.filter((b) => {
        const authorNames = b.authors?.map(a => a.name) || b.authorNames || [];
        return authorNames.some((an) => selectedAuthors.has(an));
      });
    }

    if (selectedPublishers.size > 0) {
      result = result.filter((b) => {
        const publisherNames = (b.publisher ? [b.publisher.name] : []) || b.publisherNames || [];
        return publisherNames.some((pn) => selectedPublishers.has(pn));
      });
    }

    if (selectedYear !== null) {
      result = result.filter((b) => b.publicationYear === selectedYear);
    }

    result.sort((a, b) => {
      switch (sort) {
        case 'oldest':    return a.id - b.id;
        case 'title-asc': return a.title.localeCompare(b.title, 'vi');
        default:          return b.id - a.id; // latest
      }
    });

    return result;
  }, [
    allBooks,
    categories,
    selectedCategoryIds,
    selectedAuthors,
    selectedPublishers,
    selectedYear,
    sort,
  ]);

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const paginatedBooks = filteredBooks.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAuthor = (name: string) => {
    setSelectedAuthors((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const togglePublisher = (name: string) => {
    setSelectedPublishers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSelectedCategoryIds(new Set());
    setSelectedAuthors(new Set());
    setSelectedPublishers(new Set());
    setSelectedYear(null);
    router.replace('/categories');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Danh mục tài liệu</span>
        {keyword && (
          <>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">
              Kết quả: &quot;{keyword}&quot;
            </span>
          </>
        )}
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        <FilterSidebar
          categories={categories}
          selectedCategoryIds={selectedCategoryIds}
          onToggleCategory={toggleCategory}
          authorOptions={authorOptions}
          selectedAuthors={selectedAuthors}
          onToggleAuthor={toggleAuthor}
          publisherOptions={publisherOptions}
          selectedPublishers={selectedPublishers}
          onTogglePublisher={togglePublisher}
          yearOptions={yearOptions}
          selectedYear={selectedYear}
          onChangeYear={setSelectedYear}
          onClearAll={clearAllFilters}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Danh sách tài liệu</h1>
              {!loading && (
                <p className="text-sm text-gray-500 mt-1">
                  {filteredBooks.length} kết quả
                </p>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen((p) => !p)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 transition-colors"
              >
                {SORT_LABELS[sort]}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10">
                  {(Object.keys(SORT_LABELS) as SortValue[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSort(s);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        s === sort ? 'font-bold text-red-600' : 'text-gray-700'
                      }`}
                    >
                      {SORT_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : filteredBooks.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
               {paginatedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => setSelectedBookId(book.id)}
                />
              ))}
              </div>

              <Pagination
                current={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </div>
      <BookDetailModal
        bookId={selectedBookId}
        onClose={() => setSelectedBookId(null)}
      />
    </div>
  );
}


function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 size={28} className="animate-spin mr-3" />
      <span>Đang tải dữ liệu...</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-12 text-center">
      <p className="font-medium">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-6 py-12 text-center">
      <p className="font-medium">Không tìm thấy tài liệu phù hợp.</p>
      <p className="text-sm mt-1">Thử bỏ bớt bộ lọc hoặc đổi từ khóa.</p>
    </div>
  );
}