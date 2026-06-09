'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  current: number;
  totalPages: number;
  onChange: (page: number) => void;
};


export default function Pagination({ current, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = computePages(current, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 0}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
      >
        <ChevronLeft size={16} /> Trước
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`gap-${idx}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`min-w-9 px-3 py-2 border rounded-lg text-sm transition-colors ${
              p === current
                ? 'bg-red-600 border-red-600 text-white font-bold'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages - 1}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
      >
        Sau <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function computePages(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const pages: (number | '...')[] = [];
  const first = 0;
  const last = total - 1;

  pages.push(first);

  const start = Math.max(1, current - 1);
  const end = Math.min(last - 1, current + 1);

  if (start > 1) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < last - 1) pages.push('...');

  pages.push(last);
  return pages;
}