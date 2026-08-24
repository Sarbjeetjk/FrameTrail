/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          rose: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          card: '#ffffff',
          glass: 'rgba(255, 255, 255, 0.85)',
          border: 'rgba(226, 232, 240, 0.8)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-indigo': '0 10px 40px -10px rgba(99, 102, 241, 0.25)',
        'glow-cyan': '0 10px 40px -10px rgba(6, 182, 212, 0.25)',
        'glow-amber': '0 10px 40px -10px rgba(245, 158, 11, 0.25)',
        'glass-card': '0 20px 30px -10px rgba(15, 23, 42, 0.05), 0 0 1px 1px rgba(255, 255, 255, 0.8) inset',
      },
    },
  },
  plugins: [],
}
