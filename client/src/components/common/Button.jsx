import React from 'react';

/**
 * Reusable Button component aligned to Oat Milk / Forest Green / Tomato Red
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md tracking-tight transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:ring-offset-1 focus:ring-offset-oat disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-forest hover:bg-forest-dark text-white border border-forest shadow-xs active:translate-y-px',
    secondary: 'bg-oat-light hover:bg-oat text-forest border border-forest/25 shadow-xs active:translate-y-px',
    outline: 'border border-forest/35 text-forest hover:bg-forest hover:text-white bg-transparent active:translate-y-px',
    ghost: 'text-forest hover:bg-forest/10 bg-transparent',
    danger: 'bg-tomato hover:bg-tomato-dark text-white border border-tomato shadow-xs active:translate-y-px',
    accent: 'bg-tomato hover:bg-tomato-dark text-white border border-tomato shadow-xs active:translate-y-px',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;

