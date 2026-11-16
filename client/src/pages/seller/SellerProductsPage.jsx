import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProductForm from '../../components/common/ProductForm';
import {
  useGetSellerProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../services/productApi';
import { useGetCategoriesQuery } from '../../services/categoryApi';
import { useGetSellerProfileQuery } from '../../services/sellerApi';

const SellerProductsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const { data: profileData } = useGetSellerProfileQuery();
  const { data: catData } = useGetCategoriesQuery();
  const { data: productsData, isLoading, refetch } = useGetSellerProductsQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const seller = profileData?.data?.seller || {};
  const isApproved = seller.status === 'APPROVED';
  const categories = catData?.data?.categories || [];
  const products = productsData?.data?.products || [];

  const handleCreateProduct = async (formData) => {
    try {
      await createProduct(formData).unwrap();
      setIsAddModalOpen(false);
      refetch();
    } catch (err) {
      alert(err?.data?.message || 'Failed to create product.');
    }
  };

  const handleUpdateProduct = async (formData) => {
    try {
      await updateProduct({ id: editingProduct._id, ...formData }).unwrap();
      setEditingProduct(null);
      refetch();
    } catch (err) {
      alert(err?.data?.message || 'Failed to update product.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;
    try {
      await deleteProduct(deletingProductId).unwrap();
      setDeletingProductId(null);
      refetch();
    } catch (err) {
      alert(err?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="text-2xl font-bold font-display text-forest">My Fruit Products</h1>
          <p className="text-xs text-ink-muted mt-1">
            Manage your dehydrated fruit listings, weight variants, stock counts, and admin approval statuses.
          </p>
        </div>

        {isApproved ? (
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add New Product
          </Button>
        ) : (
          <div className="p-2.5 rounded-md bg-oat-card border border-forest/20 text-xs text-[#C88E2D] font-semibold">
            Account {seller.status || 'PENDING'}: Product creation unlocks upon admin approval.
          </div>
        )}
      </div>

      {/* Product List */}
      {isLoading ? (
        <Loader message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Listed Yet"
          description={
            isApproved
              ? 'Click "Add New Product" to list your first batch of dehydrated fruits.'
              : 'Complete your FSSAI & bank verification. Once approved by the administrator, you can publish products.'
          }
          actionLabel={isApproved ? 'Add Product Now' : 'Check Verification'}
          onAction={isApproved ? () => setIsAddModalOpen(true) : () => (window.location.href = '/seller/settings')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((p) => {
            const thumbnail = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={p._id}
                className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-oat shrink-0 border border-forest/15">
                    <img src={thumbnail} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold font-display text-sm text-forest">{p.name}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          p.status === 'APPROVED'
                            ? 'bg-forest/10 text-forest border-forest/20'
                            : p.status === 'PENDING_APPROVAL'
                            ? 'bg-[#C88E2D]/10 text-[#C88E2D] border-[#C88E2D]/20'
                            : 'bg-tomato/10 text-tomato border-tomato/20'
                          }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                      <span>Category: {p.category?.name || 'General'}</span>
                      <span>•</span>
                      <span>Min Price: ₹{p.minPrice}</span>
                      <span>•</span>
                      <span>Total Stock: {p.totalStock} units</span>
                      <span>•</span>
                      <span>Variants: {p.variants?.length || 0}</span>
                    </div>

                    {p.status === 'REJECTED' && p.rejectionReason && (
                      <p className="text-[11px] text-tomato font-medium">
                        Rejection reason: {p.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {p.status === 'APPROVED' && (
                    <Link
                      to={`/products/${p.slug}`}
                      target="_blank"
                      className="p-2 rounded-md text-forest hover:bg-forest/10 transition-colors"
                      title="View public page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingProduct(p)}
                    className="p-2 rounded-md text-forest hover:bg-forest/10 transition-colors cursor-pointer"
                    title="Edit product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingProductId(p._id)}
                    className="p-2 rounded-md text-tomato hover:bg-tomato/10 transition-colors cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Dehydrated Fruit Product"
        maxWidth="max-w-4xl"
      >
        <ProductForm
          categories={categories}
          onSubmit={handleCreateProduct}
          loading={isCreating}
          submitLabel="Submit Product for Admin Review"
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title={`Edit Product: ${editingProduct?.name}`}
        maxWidth="max-w-4xl"
      >
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onSubmit={handleUpdateProduct}
          loading={isUpdating}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProductId)}
        onClose={() => setDeletingProductId(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message="Are you sure you want to permanently delete this dehydrated fruit product and all its weight variants?"
        confirmText="Delete Product"
        isDestructive
        loading={isDeleting}
      />
    </div>
  );
};

export default SellerProductsPage;