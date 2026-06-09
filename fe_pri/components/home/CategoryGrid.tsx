'use client';
import Link from 'next/link';
import {
  Cpu,
  TrendingUp,
  BookOpen,
  Globe,
  FlaskConical,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/lib/types';

type CategoryGridProps = {
  categories: Category[];
  loading?: boolean;
};

const ICON_MAP: Record<string, LucideIcon> = {
  CNTT: Cpu,
  'Công nghệ thông tin': Cpu,
  'Kinh tế': TrendingUp,
  'Văn học': BookOpen,
  'Ngoại ngữ': Globe,
  'Khoa học': FlaskConical,
  'Pháp luật': Scale,
};

const DEFAULT_ICON = BookOpen;

export default function CategoryGrid({ categories, loading }: CategoryGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-12">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh mục Thể loại</h2>
          <p className="text-sm text-gray-500 mt-1">
            Duyệt qua các lĩnh vực nổi bật.
          </p>
        </div>
        <Link
          href="/categories"
          className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors whitespace-nowrap"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {loading
          ?
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-xl aspect-square animate-pulse"
              />
            ))
          : categories.slice(0, 6).map((cat) => {
              const Icon = ICON_MAP[cat.name] ?? DEFAULT_ICON;
              return (
                <Link
                  key={cat.id}
                  href={`/categories?categoryId=${cat.id}`}
                  className="group flex flex-col items-center justify-center gap-3 bg-white border border-gray-100 rounded-xl aspect-square hover:border-red-200 hover:shadow-md transition-all"
                >
                  <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-red-50 transition-colors">
                    <Icon
                      size={22}
                      className="text-gray-600 group-hover:text-red-600 transition-colors"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600 text-center px-2">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}