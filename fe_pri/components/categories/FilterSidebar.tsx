'use client';
import type { Category } from '@/lib/types';

type Props = {
  categories: Category[];
  selectedCategoryIds: Set<number>;
  onToggleCategory: (id: number) => void;

  authorOptions: string[];
  selectedAuthors: Set<string>;
  onToggleAuthor: (name: string) => void;

  publisherOptions: string[];
  selectedPublishers: Set<string>;
  onTogglePublisher: (name: string) => void;

  yearOptions: number[];
  selectedYear: number | null;
  onChangeYear: (year: number | null) => void;

  onClearAll: () => void;
};

export default function FilterSidebar({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  authorOptions,
  selectedAuthors,
  onToggleAuthor,
  publisherOptions,
  selectedPublishers,
  onTogglePublisher,
  yearOptions,
  selectedYear,
  onChangeYear,
  onClearAll,
}: Props) {
  const hasAnyFilter =
    selectedCategoryIds.size > 0 ||
    selectedAuthors.size > 0 ||
    selectedPublishers.size > 0 ||
    selectedYear !== null;

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-5">
      {/* Clear all */}
      {hasAnyFilter && (
        <button
          onClick={onClearAll}
          className="w-full text-xs font-semibold text-red-600 hover:text-red-700 text-left px-1"
        >
          ✕ Xóa tất cả bộ lọc
        </button>
      )}

      <FilterGroup title="Theo Thể loại">
        {categories.length === 0 ? (
          <p className="text-xs text-gray-400 px-1">Đang tải...</p>
        ) : (
          categories.map((c) => (
            <CheckboxRow
              key={c.id}
              label={c.name}
              checked={selectedCategoryIds.has(c.id)}
              onChange={() => onToggleCategory(c.id)}
            />
          ))
        )}
      </FilterGroup>

      <FilterGroup title="Theo Tác giả">
        {authorOptions.length === 0 ? (
          <p className="text-xs text-gray-400 px-1">Không có dữ liệu</p>
        ) : (
          authorOptions.map((a) => (
            <CheckboxRow
              key={a}
              label={a}
              checked={selectedAuthors.has(a)}
              onChange={() => onToggleAuthor(a)}
            />
          ))
        )}
      </FilterGroup>

      <FilterGroup title="Theo NXB">
        {publisherOptions.length === 0 ? (
          <p className="text-xs text-gray-400 px-1">Không có dữ liệu</p>
        ) : (
          publisherOptions.map((p) => (
            <CheckboxRow
              key={p}
              label={p}
              checked={selectedPublishers.has(p)}
              onChange={() => onTogglePublisher(p)}
            />
          ))
        )}
      </FilterGroup>

      <FilterGroup title="Năm xuất bản">
        <select
          value={selectedYear ?? ''}
          onChange={(e) =>
            onChangeYear(e.target.value === '' ? null : Number(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-500"
        >
          <option value="">Tất cả các năm</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </FilterGroup>
    </aside>
  );
}


function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <h3 className="font-bold text-sm text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:text-red-600 group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-red-600 cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-red-600 select-none">
        {label}
      </span>
    </label>
  );
}