/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F7F1E7',
          light: '#FFF9F1',
          muted: '#E9DFD1',
        },
        orange: {
          DEFAULT: '#E9853B',
          dark: '#CA6429',
          light: '#FDEEE4',
        },
        charcoal: {
          DEFAULT: '#252522',
          dark: '#1C1C1A',
          muted: '#353530',
        },
        secondary: '#81796F',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(37, 37, 34, 0.06)',
        'card': '0 8px 30px rgba(37, 37, 34, 0.08)',
        'float': '0 20px 40px -10px rgba(37, 37, 34, 0.12)',
      }
    },
  },
  plugins: [],
}
