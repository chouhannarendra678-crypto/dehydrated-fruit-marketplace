import React from 'react';

/**
 * Reusable Spinner / Loading Skeleton
 */
const Loader = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  fullScreen = false,
  message = 'Loading...',
}) => {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-forest/20 border-t-forest`}
      />
      {message && (
        <p className="text-xs font-semibold uppercase tracking-wider text-forest/70">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-oat/90 backdrop-blur-xs">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{spinner}</div>;
};

export default Loader;

