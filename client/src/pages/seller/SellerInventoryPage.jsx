import React from 'react';
import EmptyState from '../../components/common/EmptyState';
import { Boxes } from 'lucide-react';

const SellerInventoryPage = () => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-forest/15">
        <h1 className="text-2xl font-bold font-display text-forest">Inventory Management</h1>
        <p className="text-xs text-ink-muted mt-1">
          Adjust stock levels across weight variants (100g, 250g, 500g, 1kg) and avoid negative inventory.
        </p>
      </div>

      <EmptyState
        icon={Boxes}
        title="Stock Tracking"
        description="Per-variant inventory management interface active for all verified products."
      />
    </div>
  );
};

export default SellerInventoryPage;
