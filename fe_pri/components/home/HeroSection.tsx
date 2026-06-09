'use client';
import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { Category } from '@/lib/types';

type HeroSectionProps = {
  categories: Category[];

  onSearch?: (keyword: string, categoryId: number | null) => void;
};

const SUGGESTED_CHIPS = [
  'Công nghệ thông tin',
  'Kinh tế',
  'Văn học',
  'Tiểu thuyết',
];

export default function HeroSection({ categories, onSearch }: HeroSectionProps) {
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLabel =
    categoryId === null
      ? 'Tất cả'
      : categories.find((c) => c.id === categoryId)?.name ?? 'Tất cả';

  const handleSubmit = () => {
    onSearch?.(keyword.trim(), categoryId);
  };

  const handleChipClick = (chipName: string) => {
    setKeyword(chipName);
    onSearch?.(chipName, null);
  };

  return (
    <section className="relative bg-[#0f172a] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] opacity-95" />
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/library-bg.jpg)' }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Khám phá thế giới tri thức
        </h1>
        <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          Truy cập hơn 50.000 đầu sách, tài liệu nghiên cứu và tạp chí điện tử
          tại thư viện Đại học Thăng Long.
        </p>

        <div className="bg-white rounded-full shadow-2xl flex items-center p-1.5 gap-1 max-w-2xl mx-auto">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 font-medium hover:bg-gray-50 rounded-full transition-colors whitespace-nowrap"
            >
              {selectedLabel}
              <ChevronDown
                size={14}
                className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 z-10 max-h-72 overflow-y-auto">
                <button
                  onClick={() => {
                    setCategoryId(null);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium"
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoryId(cat.id);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="flex-1 bg-transparent text-gray-800 text-sm outline-none px-3 py-2.5 placeholder:text-gray-400"
          />

          <button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          <span className="text-sm text-gray-400">Gợi ý:</span>
          {SUGGESTED_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="text-sm text-gray-300 hover:text-white border border-white/15 hover:border-white/40 px-3 py-1 rounded-full transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}   