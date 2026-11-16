import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

/**
 * Reusable EmptyState component
 */
const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 tablet:p-12 text-center rounded-xl bg-oat-light border border-forest/15 shadow-xs max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-lg bg-forest/10 flex items-center justify-center text-forest mb-4 border border-forest/15">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-forest mb-1.5 tracking-tight font-display">{title}</h3>
      <p className="text-xs sm:text-sm text-ink-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

