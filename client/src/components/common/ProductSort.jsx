import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const ProductSort = ({ value = 'newest', onChange }) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <label htmlFor="sort-select" className="text-ink-muted hidden sm:inline font-semibold">
        Sort By:
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none pl-3 pr-8 py-1.5 rounded-md border border-forest/20 bg-oat-light font-semibold text-forest text-xs focus:outline-none focus:ring-1 focus:ring-forest/30 focus:border-forest cursor-pointer shadow-2xs"
        >
          <option value="newest">Newest Harvest</option>
          <option value="relevance">Relevance</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="top-rated">Top Rated</option>
          <option value="popular">Most Popular</option>
        </select>
        <ArrowUpDown className="w-3.5 h-3.5 text-forest/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};

export default ProductSort;
