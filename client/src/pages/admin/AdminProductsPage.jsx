import React, { useState } from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  ExternalLink,
  Power,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
  useAdminGetAllProductsQuery,
  useAdminUpdateProductStatusMutation,
} from '../../services/productApi';

const AdminProductsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inspectProduct, setInspectProduct] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'REJECT' | 'ACTIVATE' | 'DEACTIVATE'
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading, refetch } = useAdminGetAllProductsQuery({
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] = useAdminUpdateProductStatusMutation();

  const handleOpenActionModal = (product, type) => {
    setSelectedProduct(product);
    setActionType(type);
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedProduct || !actionType) return;

    try {
      let targetStatus = 'APPROVED';
      if (actionType === 'REJECT') targetStatus = 'REJECTED';
      if (actionType === 'DEACTIVATE') targetStatus = 'INACTIVE';
      if (actionType === 'ACTIVATE') targetStatus = 'APPROVED';

      await updateStatus({
        id: selectedProduct._id,
        status: targetStatus,
        rejectionReason: actionType === 'REJECT' ? rejectionReason : undefined,
      }).unwrap();

      setSelectedProduct(null);
      setActionType(null);
      refetch();
    } catch (err) {
      alert(err?.data?.message || 'Failed to update product status.');
    }
  };

  const products = data?.data?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15">
        <h1 className="font-display text-2xl font-bold text-forest">Product Quality Moderation & Catalog</h1>
        <p className="text-xs text-ink/70 mt-1">
          Review seller-submitted dehydrated fruits, inspect nutrition & purity standards, approve batches, or toggle catalog visibility.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-oat-card p-4 rounded-xl border border-forest/15 shadow-2xs">
        <div className="flex flex-wrap gap-2 text-xs">
          {['', 'PENDING_APPROVAL', 'APPROVED', 'INACTIVE', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-forest text-oat-light font-semibold shadow-xs'
                  : 'bg-oat text-ink/75 hover:bg-forest/10 border border-forest/10'
              }`}
            >
              {st === '' ? 'All Products' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            type="text"
            icon={Search}
            placeholder="Search product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table / Cards */}
      {isLoading ? (
        <Loader message="Loading products for moderation..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description="There are currently no products matching your filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((p) => {
            const thumbnail =
              p.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={p._id}
                className="bg-oat-card p-5 rounded-xl border border-forest/15 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-oat shrink-0 border border-forest/15">
                    <img src={thumbnail} alt={p.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-forest truncate">{p.name}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          p.status === 'APPROVED'
                            ? 'bg-forest/10 text-forest border-forest/20'
                            : p.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : p.status === 'INACTIVE'
                            ? 'bg-oat text-ink/60 border-forest/10'
                            : 'bg-tomato/10 text-tomato border-tomato/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink/70">
                      <span>Seller: <strong className="text-forest font-semibold">{p.seller?.storeName || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Category: {p.category?.name || 'N/A'}</span>
                      <span>•</span>
                      <span>Min Price: <strong className="text-forest">₹{p.minPrice}</strong></span>
                      <span>•</span>
                      <span>Variants: {p.variants?.length || 0}</span>
                      <span>•</span>
                      <span>Sugar: {p.addedSugar ? 'Yes' : 'Zero Added'}</span>
                    </div>

                    {p.status === 'REJECTED' && p.rejectionReason && (
                      <p className="text-xs text-tomato font-medium">
                        Rejection reason: {p.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  <button
                    onClick={() => setInspectProduct(p)}
                    className="p-2 rounded-lg text-ink/60 hover:text-forest hover:bg-forest/10 border border-forest/10 transition-colors"
                    title="Inspect Product Specifications"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {p.status === 'APPROVED' && (
                    <Link
                      to={`/products/${p.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-ink/60 hover:text-forest hover:bg-forest/10 border border-forest/10 transition-colors"
                      title="View live product"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}

                  {/* Approve / Activate */}
                  {p.status !== 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenActionModal(p, p.status === 'INACTIVE' ? 'ACTIVATE' : 'APPROVE')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1 text-oat" />
                      {p.status === 'INACTIVE' ? 'Activate' : 'Approve'}
                    </Button>
                  )}

                  {/* Deactivate (if Approved) */}
                  {p.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenActionModal(p, 'DEACTIVATE')}
                    >
                      <Power className="w-3.5 h-3.5 mr-1 text-ink/60" />
                      Deactivate
                    </Button>
                  )}

                  {/* Reject */}
                  {p.status !== 'REJECTED' && p.status !== 'INACTIVE' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleOpenActionModal(p, 'REJECT')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Product Modal */}
      {inspectProduct && (
        <Modal
          isOpen={Boolean(inspectProduct)}
          onClose={() => setInspectProduct(null)}
          title={`Specifications: ${inspectProduct.name}`}
        >
          <div className="space-y-4 text-xs pt-1">
            <div className="flex gap-4 items-start">
              <img
                src={inspectProduct.images?.[0]?.url || ''}
                alt={inspectProduct.name}
                className="w-20 h-20 rounded-lg object-cover border border-forest/15 bg-oat"
              />
              <div>
                <h4 className="font-display font-bold text-sm text-forest">{inspectProduct.name}</h4>
                <p className="text-ink/70 mt-1 leading-relaxed">{inspectProduct.description}</p>
                <div className="mt-2 text-ink/75">
                  <strong className="text-forest">Producer:</strong> {inspectProduct.seller?.storeName}
                </div>
              </div>
            </div>

            {/* Ingredients & Purity */}
            <div className="p-3 bg-oat rounded-lg border border-forest/10 space-y-1">
              <div><strong className="text-forest">Ingredients:</strong> {inspectProduct.ingredients || '100% Dehydrated Fruit'}</div>
              <div><strong className="text-forest">Added Sugar:</strong> {inspectProduct.addedSugar ? 'Yes' : 'Zero Added Sugar'}</div>
              <div><strong className="text-forest">Preservatives:</strong> {inspectProduct.preservatives ? 'Yes' : 'Zero Preservatives'}</div>
              {inspectProduct.shelfLife && <div><strong className="text-forest">Shelf Life:</strong> {inspectProduct.shelfLife}</div>}
              {inspectProduct.storageInstructions && <div><strong className="text-forest">Storage:</strong> {inspectProduct.storageInstructions}</div>}
            </div>

            {/* Nutrition Facts */}
            {inspectProduct.nutrition && (
              <div className="border border-forest/15 rounded-lg p-3 bg-oat-card">
                <h5 className="font-display font-bold text-forest mb-2">Nutritional Values (per 100g)</h5>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-oat p-2 rounded-lg border border-forest/10">
                    <span className="text-ink/60 block text-[10px]">Calories</span>
                    <strong className="text-forest">{inspectProduct.nutrition.calories || 0} kcal</strong>
                  </div>
                  <div className="bg-oat p-2 rounded-lg border border-forest/10">
                    <span className="text-ink/60 block text-[10px]">Carbs</span>
                    <strong className="text-forest">{inspectProduct.nutrition.carbohydrates || 0}g</strong>
                  </div>
                  <div className="bg-oat p-2 rounded-lg border border-forest/10">
                    <span className="text-ink/60 block text-[10px]">Natural Sugars</span>
                    <strong className="text-forest">{inspectProduct.nutrition.naturalFruitSugars || 0}g</strong>
                  </div>
                  <div className="bg-oat p-2 rounded-lg border border-forest/10">
                    <span className="text-ink/60 block text-[10px]">Fiber</span>
                    <strong className="text-forest">{inspectProduct.nutrition.fiber || 0}g</strong>
                  </div>
                  <div className="bg-oat p-2 rounded-lg border border-forest/10">
                    <span className="text-ink/60 block text-[10px]">Protein</span>
                    <strong className="text-forest">{inspectProduct.nutrition.protein || 0}g</strong>
                  </div>
                  <div className="bg-oat p-2 rounded-lg border border-forest/10">
                    <span className="text-ink/60 block text-[10px]">Fat</span>
                    <strong className="text-forest">{inspectProduct.nutrition.fat || 0}g</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Weight Variants */}
            {inspectProduct.variants && inspectProduct.variants.length > 0 && (
              <div>
                <h5 className="font-display font-bold text-forest mb-1.5">Weight Variants & Live Stock</h5>
                <div className="space-y-1">
                  {inspectProduct.variants.map((v) => (
                    <div key={v._id} className="p-2.5 bg-oat rounded-lg border border-forest/10 flex justify-between items-center text-xs">
                      <span className="font-semibold text-forest">{v.weight}</span>
                      <span className="text-ink/75">Price: <strong className="text-forest">₹{v.price}</strong> (MRP: ₹{v.mrp})</span>
                      <span>Stock: <strong className={v.stock > 0 ? 'text-forest font-bold' : 'text-tomato font-bold'}>{v.stock} units</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setInspectProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Moderation Modal */}
      <Modal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        title={`${actionType} Product: ${selectedProduct?.name}`}
      >
        <div className="space-y-4 text-xs">
          {actionType === 'APPROVE' || actionType === 'ACTIVATE' ? (
            <p className="text-ink/85 leading-relaxed">
              This product will be published to the customer marketplace. Customers will be able to discover, compare, and purchase it.
            </p>
          ) : actionType === 'DEACTIVATE' ? (
            <p className="text-ink/85 leading-relaxed">
              Deactivating this product will hide it from the public marketplace while preserving all seller and order histories.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-ink/85 leading-relaxed">
                Please provide the rejection reason. This guidance will be displayed in the seller portal so they can correct their listing.
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Image resolution is low, or ingredients list requires clarity on drying technique..."
                  className="w-full rounded-lg border border-forest/20 bg-oat-card p-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-forest/15">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProduct(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'REJECT' ? 'danger' : 'primary'}
              size="sm"
              loading={isUpdating}
              onClick={handleConfirmAction}
            >
              Confirm {actionType}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;