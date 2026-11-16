import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import Button from './Button';

const ImageUploader = ({ images = [], onChange, maxImages = 5 }) => {
  const [inputUrl, setInputUrl] = useState('');

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onChange([...images, { url: inputUrl.trim(), publicId: `img_${Date.now()}` }]);
      setInputUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-bold uppercase tracking-wider text-forest">
        Product Images (Cloudinary or Image URL)
      </label>

      {/* Existing Images Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.url + idx}
            className="relative aspect-square rounded-md overflow-hidden border border-forest/20 group bg-oat shadow-2xs"
          >
            <img src={img.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-tomato text-white shadow-xs hover:bg-tomato-dark transition-colors cursor-pointer"
              aria-label="Remove Image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-forest text-oat text-[10px] font-bold">
                Cover
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Add Image Input */}
      {images.length < maxImages && (
        <div className="flex gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste Cloudinary or Web image URL (e.g. https://.../mango.jpg)"
            className="flex-1 rounded-md border border-forest/20 bg-oat-light/60 px-3.5 py-2 text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-forest"
          />
          <Button size="sm" variant="outline" onClick={handleAddUrl}>
            <Plus className="w-4 h-4 mr-1" /> Add Image
          </Button>
        </div>
      )}
      <p className="text-[11px] text-ink-muted">
        First image will be used as the primary catalog thumbnail.
      </p>
    </div>
  );
};

export default ImageUploader;
