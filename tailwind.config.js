/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#0d6e26', // Logo Kannada 'ರ' glyph green
          900: '#0a5c20', // Logo deep brand Kaveri farm green
          950: '#063d14',
        },
        fresh: {
          DEFAULT: '#22c55e',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#22c55e',
          600: '#16a34a',
          700: '#0d6e26',
          800: '#0a5c20',
          900: '#063d14',
        },
        harvest: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24', // Logo sun & wheat highlight
          500: '#f59e0b', // Logo golden paddy grain
          600: '#d97706', // Logo orbital swoop amber
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        aiBlue: {
          DEFAULT: '#1d68d8',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1d68d8', // Logo 'Ai' badge electric royal blue
          700: '#1d4ed8',
          800: '#0f3a7d', // Logo Kannada text deep navy
          900: '#0c2340', // Logo midnight navy
          950: '#08172c',
        },
        skyAzure: {
          DEFAULT: '#38bdf8',
          50: '#f0f9ff',
          100: '#e0f2fe', // Logo morning horizon sky
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        sunlight: {
          DEFAULT: '#fbbf24',
          light: '#fef08a',
          dark: '#f59e0b',
        },
        soil: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2.5s ease-in-out infinite',
        'ripple': 'ripple 2s ease-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
