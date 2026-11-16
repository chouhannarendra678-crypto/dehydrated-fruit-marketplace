import React, { forwardRef } from 'react';

/**
 * Reusable Input component styled in Oat Milk / Forest Green / Tomato Red
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  className = '',
  containerClassName = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-forest mb-1.5">
          {label} {required && <span className="text-tomato">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`block w-full rounded-md border bg-oat-light/60 focus:bg-white text-sm text-ink transition-all duration-150 placeholder:text-ink-subtle/70
            ${Icon ? 'pl-9 pr-3' : 'px-3'}
            py-2
            ${
              error
                ? 'border-tomato text-ink focus:border-tomato focus:ring-tomato/20'
                : 'border-forest/20 hover:border-forest/40 focus:border-forest focus:ring-forest/20'
            }
            focus:outline-none focus:ring-1
            disabled:bg-oat-dark/30 disabled:text-ink-muted disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-tomato font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-ink-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

