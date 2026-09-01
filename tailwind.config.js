/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: #0F766E (Dark Teal)
        primary: {
          DEFAULT: '#0F766E',
          light: '#CCFBF1',
          hover: '#115E59',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0F766E', // Exact Dark Teal
          800: '#115E59', // Hover
          900: '#134e4a',
          950: '#042f2e',
        },
        teal: {
          primary: '#0F766E',
          hover: '#115E59',
          light: '#CCFBF1',
          dark: '#134e4a',
        },
        // Positive / Growth: #16A34A
        growth: {
          DEFAULT: '#16A34A',
          light: '#f0fdf4',
          border: '#bbf7d0',
          dark: '#15803d',
        },
        // Loss / Negative: #DC2626
        expense: {
          DEFAULT: '#DC2626',
          light: '#fef2f2',
          border: '#fecaca',
          dark: '#b91c1c',
        },
        // Warning: #F59E0B
        warning: {
          DEFAULT: '#F59E0B',
          light: '#fffbeb',
          border: '#fde68a',
        },
        // Text Primary: #0F172A
        textPrimary: '#0F172A',
        // Background: #F8FAFC
        surface: '#F8FAFC',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(15, 118, 110, 0.1), 0 8px 10px -6px rgba(15, 118, 110, 0.04)',
      },
    },
  },
  plugins: [],
};
