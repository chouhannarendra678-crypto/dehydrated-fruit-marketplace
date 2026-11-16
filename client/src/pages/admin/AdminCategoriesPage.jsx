import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../services/categoryApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminCategoriesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  const { data, isLoading, error, refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories = data?.data?.categories || [];

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setIsEditing(true);
    setSelectedCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.image?.url || cat.image || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      if (isEditing && selectedCategory) {
        await updateCategory({
          id: selectedCategory._id,
          name: name.trim(),
          description: description.trim(),
          image: imageUrl.trim() ? { url: imageUrl.trim() } : undefined,
        }).unwrap();
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim(),
          image: imageUrl.trim() ? { url: imageUrl.trim() } : undefined,
        }).unwrap();
      }

      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.data?.message || 'Failed to save fruit category.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete._id).unwrap();
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
      refetch();
    } catch (err) {
      alert(err?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Fruit Taxonomy & Categories</h1>
          <p className="text-xs text-ink/70 mt-1">
            Organize dehydrated fruit varietals, SEO slugs, and discovery banners.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-oat-light rounded-lg text-sm font-semibold hover:bg-forest-light transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <Loader text="Loading fruit categories..." />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-tomato text-sm">
          Failed to load categories. Please refresh.
        </div>
      ) : categories.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={FolderTree}
            title="No Categories Configured"
            description="Create dehydrated fruit categories to organize seller listings and customer browsing."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-oat-card rounded-xl border border-forest/15 shadow-2xs p-5 flex flex-col justify-between hover:border-forest/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold border border-forest/15">
                      <FolderTree className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-forest">{cat.name}</h3>
                      <span className="font-mono text-[11px] text-ink/60">/categories/{cat.slug}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-forest/10 text-forest border border-forest/20">
                    Active
                  </span>
                </div>

                <p className="text-xs text-ink/70 mt-3 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided for this dehydrated fruit category.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-forest/15 flex items-center justify-between">
                <a
                  href={`/categories/${cat.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
                >
                  <span>Browse Store</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-ink/60 hover:text-forest hover:bg-forest/10 rounded-lg transition-colors border border-forest/10"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCategoryToDelete(cat);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 text-tomato/70 hover:text-tomato hover:bg-tomato/10 rounded-lg transition-colors border border-tomato/20"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={isEditing ? `Edit Category: ${selectedCategory?.name}` : 'Add New Fruit Category'}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 text-xs">
            {formError && (
              <div className="p-3 bg-tomato/10 text-tomato rounded-lg flex items-center gap-2 border border-tomato/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-forest mb-1">
                Category Name <span className="text-tomato">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sun-Dried Mangoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-forest mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Natural solar dehydrated tropical mango slices without sulfur dioxide..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block font-semibold text-forest mb-1">
                Image / Icon URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-forest/15">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-oat hover:bg-forest/10 text-forest font-semibold rounded-lg border border-forest/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-4 py-2 bg-forest text-oat-light font-semibold rounded-lg hover:bg-forest-light transition-colors disabled:opacity-50"
              >
                {isCreating || isUpdating ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && categoryToDelete && (
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title={`Delete Category: ${categoryToDelete.name}`}
        >
          <div className="space-y-4 pt-2 text-xs">
            <p className="text-ink/80 leading-relaxed">
              Are you sure you want to delete <strong className="text-forest">{categoryToDelete.name}</strong>?
              This action cannot be undone. Products linked to this category should be reassigned.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-forest/15">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-oat hover:bg-forest/10 text-forest font-semibold rounded-lg border border-forest/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-tomato text-white font-semibold rounded-lg hover:bg-tomato/90 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
