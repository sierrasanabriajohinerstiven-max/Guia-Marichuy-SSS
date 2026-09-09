import React from 'react';
import { Category } from '../../../types/db';
import { cn } from '../../../lib/cn';

export interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={cn(
          'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer',
          selectedCategoryId === null
            ? 'bg-[#3E2723] text-[#F9F6F0] shadow-xs'
            : 'bg-white/80 text-[#6B6B6B] hover:text-[#3E2723] hover:bg-white border border-[#3E2723]/10'
        )}
      >
        Todas las Variedades
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer',
              isSelected
                ? 'bg-[#3E2723] text-[#F9F6F0] shadow-xs'
                : 'bg-white/80 text-[#6B6B6B] hover:text-[#3E2723] hover:bg-white border border-[#3E2723]/10'
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
