import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

const WEIGHT_OPTIONS = ['100g', '250g', '500g', '1kg'];

const ProductFilters = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  weight,
  onSelectWeight,
  availability,
  onToggleAvailability,
  addedSugarOnly,
  onToggleAddedSugar,
  preservativesOnly,
  onTogglePreservatives,
  selectedRating,
  onSelectRating,
  onResetFilters,
  className = '',
}) => {
  return (
    <div className={`bg-oat-card rounded-lg p-5 border border-forest/15 shadow-xs space-y-5 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-forest/15">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-forest" />
          <h3 className="font-bold text-sm text-forest font-display tracking-tight">Filter Fruits</h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[11px] font-semibold text-ink-muted hover:text-tomato inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-forest">Category</h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectCategory('')}
            className={`w-full text-left text-xs py-1.5 px-2.5 rounded-md transition-colors cursor-pointer ${
              !selectedCategory ? 'bg-forest font-bold text-white shadow-2xs' : 'text-ink hover:bg-oat-dark/50'
            }`}
          >
            All Harvests
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-md transition-colors cursor-pointer ${
                selectedCategory === cat.slug ? 'bg-forest font-bold text-white shadow-2xs' : 'text-ink hover:bg-oat-dark/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Weight Options */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-forest">Weight Tier</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {WEIGHT_OPTIONS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onSelectWeight(weight === w ? '' : w)}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold border transition-all cursor-pointer text-center ${
                weight === w
                  ? 'border-forest bg-forest text-white font-bold shadow-2xs'
                  : 'border-forest/20 text-forest bg-oat-light/60 hover:bg-oat'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-forest">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={availability === 'in_stock'}
            onChange={(e) => onToggleAvailability(e.target.checked ? 'in_stock' : '')}
            className="rounded text-forest focus:ring-forest/30 w-4 h-4 cursor-pointer accent-forest"
          />
          <span className="text-ink font-medium">In Stock Only</span>
        </label>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-forest">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <input
            type="number"
            placeholder="Min"
            value={minPrice || ''}
            onChange={(e) => onPriceChange('min', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md border border-forest/20 bg-oat-light/80 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-forest"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice || ''}
            onChange={(e) => onPriceChange('max', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md border border-forest/20 bg-oat-light/80 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-forest"
          />
        </div>
      </div>

      {/* Health & Nutrition Attributes */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-forest">Diet & Purity</h4>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addedSugarOnly === false}
              onChange={(e) => onToggleAddedSugar(e.target.checked ? false : '')}
              className="rounded text-forest focus:ring-forest/30 w-4 h-4 cursor-pointer accent-forest"
            />
            <span className="text-ink font-medium">Zero Added Sugar</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preservativesOnly === false}
              onChange={(e) => onTogglePreservatives(e.target.checked ? false : '')}
              className="rounded text-forest focus:ring-forest/30 w-4 h-4 cursor-pointer accent-forest"
            />
            <span className="text-ink font-medium">No Sulfites / Preservatives</span>
          </label>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-forest">Minimum Rating</h4>
        <div className="flex gap-1.5 text-xs">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onSelectRating(selectedRating === r ? '' : r)}
              className={`flex-1 py-1 rounded-md border text-center font-semibold transition-colors cursor-pointer ${
                selectedRating === r
                  ? 'border-forest bg-forest text-white font-bold shadow-2xs'
                  : 'border-forest/20 bg-oat-light/60 hover:bg-oat text-forest'
              }`}
            >
              {r}★+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
