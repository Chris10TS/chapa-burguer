'use client';

export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="sticky top-0 z-30 bg-chapa-cream/95 backdrop-blur-sm py-3 -mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-chapa-yellow text-chapa-brown shadow-md scale-105'
                : 'bg-white text-chapa-brown/70 hover:bg-chapa-yellow/20 shadow-card'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
