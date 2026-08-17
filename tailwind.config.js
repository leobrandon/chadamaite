/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fff5f7',
          100: '#ffeef2',
          200: '#ffd6e1',
          300: '#fcaec4',
          400: '#f7799e',
          500: '#ee4b7b',
          600: '#db275e',
          700: '#b81747',
          800: '#99163d',
          900: '#801637',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#ccdccd',
          300: '#a7c3a9',
          400: '#7fa382',
          500: '#628666',
        },
        cream: {
          50: '#fdfbf7',
          100: '#fbf7ef',
          200: '#f6eedb',
          300: '#ede0bf',
          400: '#dfca9b',
        },
        gold: {
          50: '#fdfbee',
          100: '#faf5d3',
          200: '#f5e9a3',
          300: '#eed86a',
          400: '#e3be34',
          500: '#cfa11d',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        handwriting: ['"Great Vibes"', 'cursive'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
