/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'tablet': '1024px',
      'lg': '1024px',
      'xl': '1280px',
      'desktop': '1440px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Strict Brand Palette: Oat Milk 60% / Forest Green 30% / Tomato Red 10%
        oat: {
          DEFAULT: '#EEE5D4', // Primary canvas background (60%)
          light: '#F7F3EB',   // Subtle elevated card surfaces
          card: '#FAF7F0',    // Clean editorial card fill
          dark: '#E0D4BE',    // Dividers and hairline borders
          border: '#D6C8AF',  // Crisp structural border
        },
        forest: {
          DEFAULT: '#1D4A35', // Primary brand color (30%)
          dark: '#133324',    // Deep dark structural surfaces
          deep: '#0F261B',    // Darkest forest for high contrast
          muted: '#2D5E46',   // Secondary headings & muted accents
          soft: '#3C7257',    // Medium forest tone
          tint: '#E7EDE9',    // Very soft tint for badges/tags
        },
        tomato: {
          DEFAULT: '#F2462E', // Accent color ONLY (10%)
          dark: '#D93822',    // Hover states on accent buttons
          light: '#F5634E',   // Light red for subtle accents
          tint: '#FCEBE8',    // Badge / alert background tint
        },
        ink: {
          DEFAULT: '#16231C', // Primary readable text
          muted: '#4A5550',   // Secondary editorial text
          subtle: '#78827D',  // Subtle captions and metadata
          light: '#9EA8A3',   // Muted borders/disabled text
        },

        // Backward-compatible 'brand' map referencing strict tokens
        brand: {
          cream: '#EEE5D4',     // 60% Oat Milk
          sand: '#F7F3EB',      // Oat light surface
          dark: '#1D4A35',      // 30% Forest Green
          primary: '#1D4A35',   // 30% Forest Green
          accent: '#F2462E',    // 10% Tomato Red
          tomato: '#F2462E',    // 10% Tomato Red
          light: '#E7EDE9',     // Forest soft tint
          charcoal: '#16231C',  // Deep readable ink
          muted: '#4A5550',     // Secondary ink
          mango: '#F2462E',     // Map old fruit accents to Tomato Red
          apricot: '#F2462E',
          berry: '#F2462E',
          fig: '#1D4A35',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(29, 74, 53, 0.05)',
        'tactile': '0 1px 3px rgba(29, 74, 53, 0.08), 0 1px 2px rgba(29, 74, 53, 0.04)',
        'card': '0 2px 6px rgba(29, 74, 53, 0.05)',
        'elevated': '0 4px 16px rgba(29, 74, 53, 0.08)',
        'soft': '0 1px 3px rgba(29, 74, 53, 0.06)',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '16px', // Restrained down from 24px
      },
    },
  },
  plugins: [],
};

