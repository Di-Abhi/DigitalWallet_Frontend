/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
        },
        accent: { DEFAULT: '#06b6d4', dark: '#0891b2' },
        surface: {
          light: '#f8fafc', dark: '#0f172a',
          card: { light: '#ffffff', dark: '#1e293b' },
          border: { light: '#e2e8f0', dark: '#334155' },
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(100%)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(6,182,212,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(6,182,212,0)' } },
      }
    },
  },
  plugins: [],
}
