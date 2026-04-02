/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9ba',
          400: '#ec7896',
          500: '#df4d74',
          600: '#cb2d5d',
          700: '#a9204b',
          800: '#7B2D3B',
          900: '#6a2736',
          950: '#3d1019',
        },
        gold: {
          50: '#fdfaf0',
          100: '#faf3db',
          200: '#f4e4b6',
          300: '#ecd088',
          400: '#e2b65a',
          500: '#C9A96E',
          600: '#b8924a',
          700: '#9a723d',
          800: '#7d5c37',
          900: '#674c30',
          950: '#3b2818',
        },
        cream: {
          50: '#FEFAF3',
          100: '#FDF5E6',
          200: '#FAEDd4',
          300: '#F5E0BE',
          400: '#EDCEA0',
          500: '#E3BA82',
        },
        warmgray: {
          50: '#FAF9F7',
          100: '#F5F0EB',
          200: '#EBE5DE',
          300: '#D9D0C5',
          400: '#C0B3A4',
          500: '#A89888',
          600: '#8F7E6E',
          700: '#76675A',
          800: '#5F534A',
          900: '#2C2C2C',
          950: '#1A1A1A',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
