import React, { useState } from 'react';
import { Package } from 'lucide-react';

const ProductGallery = ({ images = [], alt = 'Dehydrated Fruit' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-oat-dark/20 flex items-center justify-center text-ink-muted border border-forest/15">
        <Package className="w-16 h-16 opacity-40" />
      </div>
    );
  }

  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-3">
      {/* Main Image Display */}
      <div className="aspect-square w-full rounded-xl overflow-hidden bg-oat-light border border-forest/15 shadow-xs relative group">
        <img
          src={activeImage.url}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                selectedIndex === idx
                  ? 'border-forest shadow-xs ring-1 ring-forest/30'
                  : 'border-forest/20 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
