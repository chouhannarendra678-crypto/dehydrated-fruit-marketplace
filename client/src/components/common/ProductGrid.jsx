import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

const ProductGrid = ({ products = [], emptyTitle = 'No Products Found', emptyDescription = 'No dehydrated fruits match your selected criteria.' }) => {
  if (!products || products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
};

export default ProductGrid;
