'use client';
import Image from 'next/image';
import type { BookTitle } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type BookCardProps = {
  book: BookTitle;
  badge?: string;
  onClick?: () => void;
};

export default function BookCard({ book, badge, onClick }: BookCardProps) {
  const primaryCategory = book.categories?.[0]?.name ?? book.categoryNames?.[0] ?? '';
  const primaryAuthor = book.authors?.[0]?.name ?? book.authorNames?.[0] ?? 'Khuyết danh';

  const isOutOfStock = book.availableCopies !== undefined && book.availableCopies <= 0;
  const autoBadge = isOutOfStock ? 'ĐÃ HẾT' : 'CÒN SẴN';
  
  const displayBadge = badge || autoBadge;
  
  const badgeColor = displayBadge === 'ĐÃ HẾT' ? 'bg-gray-500' : 'bg-green-600';

  const coverSrc = (() => {
    const img = book.coverImageUrl || book.coverImage;
    if (!img) return '/images/book-placeholder.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads/')) return `${API_URL}${img}`;
    if (img.startsWith('/')) return img;
    return `/images/${img}`;
  })();

  const isExternalImage = coverSrc.startsWith('http');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group block w-full text-left bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${isOutOfStock ? 'opacity-85' : ''}`}
    >
      <div className="relative aspect-3/4 bg-gray-100 overflow-hidden">
        <Image
          src={coverSrc}
          alt={book.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-cover transition-transform duration-300 ${!isOutOfStock && 'group-hover:scale-105'}`}
          unoptimized={isExternalImage}
        />
        {displayBadge && (
          <span className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm ${badgeColor}`}>
            {displayBadge}
          </span>
        )}
      </div>

      <div className="p-3">
        {primaryCategory && (
          <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide mb-1">
            {primaryCategory}
          </p>
        )}
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug min-h-10 group-hover:text-red-600 transition-colors">
          {book.title}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-500 line-clamp-1 flex-1">{primaryAuthor}</p>
          <p className={`text-xs font-bold whitespace-nowrap ml-2 ${isOutOfStock ? 'text-gray-400 line-through' : 'text-red-600'}`}>
            {book.price && book.price > 0 ? `${book.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
          </p>
        </div>
      </div>
    </button>
  );
}