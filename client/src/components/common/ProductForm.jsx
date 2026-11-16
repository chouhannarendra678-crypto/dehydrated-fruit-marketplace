import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Sparkles, Scale } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import ImageUploader from './ImageUploader';

const ProductForm = ({
  initialData = null,
  categories = [],
  onSubmit,
  loading = false,
  submitLabel = 'Submit for Admin Approval',
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [shelfLife, setShelfLife] = useState('12 Months');
  const [storageInstructions, setStorageInstructions] = useState('Store in an airtight container in a cool, dry place.');
  const [addedSugar, setAddedSugar] = useState(false);
  const [preservatives, setPreservatives] = useState(false);
  const [ingredientsText, setIngredientsText] = useState('');

  // Nutrition
  const [calories, setCalories] = useState(300);
  const [carbs, setCarbs] = useState(75);
  const [sugar, setSugar] = useState(60);
  const [protein, setProtein] = useState(2.5);
  const [fiber, setFiber] = useState(6.0);
  const [fat, setFat] = useState(0.8);

  // Weight Variants (100g, 250g, 500g, 1kg)
  const [variants, setVariants] = useState([
    { weight: '100g', price: 150, mrp: 180, SKU: '', stock: 50, isDefault: true },
    { weight: '250g', price: 350, mrp: 420, SKU: '', stock: 30, isDefault: false },
  ]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategoryId(initialData.category?._id || initialData.category || '');
      setDescription(initialData.description || '');
      setImages(initialData.images || []);
      setShelfLife(initialData.shelfLife || '12 Months');
      setStorageInstructions(initialData.storageInstructions || '');
      setAddedSugar(Boolean(initialData.addedSugar));
      setPreservatives(Boolean(initialData.preservatives));
      setIngredientsText(
        Array.isArray(initialData.ingredients)
          ? initialData.ingredients.join(', ')
          : initialData.ingredients || ''
      );

      if (initialData.nutrition) {
        setCalories(initialData.nutrition.calories || 0);
        setCarbs(initialData.nutrition.carbohydrates || 0);
        setSugar(initialData.nutrition.sugar || 0);
        setProtein(initialData.nutrition.protein || 0);
        setFiber(initialData.nutrition.fiber || 0);
        setFat(initialData.nutrition.fat || 0);
      }

      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(
          initialData.variants.map((v) => ({
            weight: v.weight,
            price: v.price,
            mrp: v.mrp || v.price,
            SKU: v.SKU,
            stock: v.stock,
            isDefault: Boolean(v.isDefault),
          }))
        );
      }
    } else if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0]._id);
    }
  }, [initialData, categories]);

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleAddVariant = () => {
    const standardWeights = ['100g', '250g', '500g', '1kg'];
    const nextWeight = standardWeights[variants.length % standardWeights.length];
    setVariants([
      ...variants,
      {
        weight: nextWeight,
        price: 200,
        mrp: 240,
        SKU: '',
        stock: 20,
        isDefault: false,
      },
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) {
      alert('At least one weight variant is required.');
      return;
    }
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert('Please add at least one product image URL.');
      return;
    }

    const sanitizedVariants = variants.map((v) => ({
      ...v,
      SKU: v.SKU.trim() || `${name.slice(0, 4).toUpperCase()}-${v.weight.toUpperCase()}`,
      price: Number(v.price),
      mrp: Number(v.mrp) || Number(v.price),
      stock: Number(v.stock),
    }));

    const payload = {
      name,
      category: categoryId,
      description,
      images,
      shelfLife,
      storageInstructions,
      addedSugar,
      preservatives,
      ingredients: ingredientsText.split(',').map((s) => s.trim()).filter(Boolean),
      nutrition: {
        servingSize: '100g',
        calories: Number(calories),
        carbohydrates: Number(carbs),
        sugar: Number(sugar),
        protein: Number(protein),
        fiber: Number(fiber),
        fat: Number(fat),
      },
      variants: sanitizedVariants,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Basic Product Information */}
      <div className="bg-oat-card rounded-lg p-6 sm:p-8 border border-forest/15 shadow-2xs space-y-6">
        <h3 className="text-base font-bold font-display text-forest pb-3 border-b border-forest/15 flex items-center gap-2">
          <Package className="w-5 h-5 text-forest" />
          <span>Basic Product Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Product Title"
              type="text"
              placeholder="e.g. Ratnagiri Sun-Dried Alphonso Mango Slices"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
              Fruit Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-forest/20 bg-oat-light/60 py-2.5 px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
              required
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Shelf Life"
              type="text"
              placeholder="e.g. 12 Months"
              value={shelfLife}
              onChange={(e) => setShelfLife(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
              Product Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe drying technique, orchard origin, taste profile, and culinary uses..."
              className="w-full rounded-md border border-forest/20 bg-oat-light/60 p-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-forest resize-none leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Cloudinary Image Uploader */}
        <div className="pt-2 border-t border-forest/15">
          <ImageUploader images={images} onChange={setImages} />
        </div>
      </div>

      {/* 2. Weight Variants (100g, 250g, 500g, 1kg) */}
      <div className="bg-oat-card rounded-lg p-6 sm:p-8 border border-forest/15 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-forest/15">
          <h3 className="text-base font-bold font-display text-forest flex items-center gap-2">
            <Scale className="w-5 h-5 text-forest" />
            <span>Weight Tiers & Inventory (100g, 250g, 500g, 1kg)</span>
          </h3>
          <Button size="sm" variant="outline" onClick={handleAddVariant}>
            <Plus className="w-4 h-4 mr-1" /> Add Variant
          </Button>
        </div>

        <div className="space-y-4">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="p-4 rounded-md bg-oat border border-forest/15 grid grid-cols-2 sm:grid-cols-6 gap-3 items-end"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest mb-1">
                  Weight (e.g. 250g)
                </label>
                <input
                  type="text"
                  value={v.weight}
                  onChange={(e) => handleVariantChange(idx, 'weight', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-forest/20 bg-oat-card text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest mb-1">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.price}
                  onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-forest/20 bg-oat-card text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest mb-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.mrp}
                  onChange={(e) => handleVariantChange(idx, 'mrp', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-forest/20 bg-oat-card text-xs text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  placeholder="Auto if empty"
                  value={v.SKU}
                  onChange={(e) => handleVariantChange(idx, 'SKU', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-forest/20 bg-oat-card text-xs font-mono uppercase text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-forest/20 bg-oat-card text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="p-2 rounded-md text-tomato hover:bg-tomato/10 transition-colors cursor-pointer"
                  aria-label="Remove variant"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Nutrition & Pure Ingredients */}
      <div className="bg-oat-card rounded-lg p-6 sm:p-8 border border-forest/15 shadow-2xs space-y-6">
        <h3 className="text-base font-bold font-display text-forest pb-3 border-b border-forest/15 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-forest" />
          <span>Ingredients & Nutritional Facts (Per 100g)</span>
        </h3>

        <div className="space-y-4">
          <Input
            label="Ingredients (comma-separated)"
            type="text"
            placeholder="e.g. 100% Dehydrated Alphonso Mango, Rock Salt"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-forest mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full p-2 border border-forest/20 rounded-md bg-oat-light/60 text-xs text-ink"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-forest mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full p-2 border border-forest/20 rounded-md bg-oat-light/60 text-xs text-ink"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-forest mb-1">Natural Sugar (g)</label>
              <input
                type="number"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                className="w-full p-2 border border-forest/20 rounded-md bg-oat-light/60 text-xs text-ink"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-forest mb-1">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full p-2 border border-forest/20 rounded-md bg-oat-light/60 text-xs text-ink"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-forest mb-1">Fiber (g)</label>
              <input
                type="number"
                step="0.1"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                className="w-full p-2 border border-forest/20 rounded-md bg-oat-light/60 text-xs text-ink"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-forest mb-1">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full p-2 border border-forest/20 rounded-md bg-oat-light/60 text-xs text-ink"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-6 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
              <input
                type="checkbox"
                checked={addedSugar}
                onChange={(e) => setAddedSugar(e.target.checked)}
                className="rounded border-forest/30 text-forest w-4 h-4 focus:ring-forest"
              />
              Contains Added Sugar / Syrups
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
              <input
                type="checkbox"
                checked={preservatives}
                onChange={(e) => setPreservatives(e.target.checked)}
                className="rounded border-forest/30 text-forest w-4 h-4 focus:ring-forest"
              />
              Contains Preservatives / Sulfites
            </label>
          </div>

          <Input
            label="Storage Instructions"
            type="text"
            value={storageInstructions}
            onChange={(e) => setStorageInstructions(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
