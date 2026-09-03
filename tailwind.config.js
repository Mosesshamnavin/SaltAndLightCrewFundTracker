/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand: Professional Teal (#0F766E)
        primary: {
          DEFAULT: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
          hover: '#115E59',
          light: '#F0FDFA',
        },
        // Alias brand to primary so legacy & report components render properly
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F766E',
          700: '#115E59',
          800: '#134E4A',
          900: '#042F2E',
        },
        teal: {
          primary: '#0F766E',
          hover: '#115E59',
          light: '#F0FDFA',
          dark: '#134E4A',
        },
        // Inflow / Income: Vibrant Emerald (#059669)
        income: {
          DEFAULT: '#059669',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          hover: '#047857',
          light: '#ECFDF5',
          border: '#A7F3D0',
        },
        growth: {
          DEFAULT: '#059669',
          light: '#ECFDF5',
          border: '#A7F3D0',
          dark: '#047857',
        },
        // Outflow / Expense: High-Contrast Rose (#E11D48)
        expense: {
          DEFAULT: '#E11D48',
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          hover: '#BE123C',
          light: '#FFF1F2',
          border: '#FECDD3',
        },
        // Warning: Warm Amber
        warning: {
          DEFAULT: '#D97706',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
        },
        // Slate Surfaces & Text
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
          muted: '#F8FAFC',
        },
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#64748B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        caveat: ['var(--font-caveat)', 'cursive'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 6px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        dropdown: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
        modal: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
