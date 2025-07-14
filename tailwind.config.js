/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        pink: {
          DEFAULT: 'var(--pink)',
          light: 'rgba(255, 180, 210, 1)', // màu hồng nhạt
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        title: ['"Berlin Sans FB Demi"', 'sans-serif'],  // cho P-QUIZZ
        content: ['FWWC2023', 'sans-serif'],              // cho phần nội dung
      },
    },
  },
  plugins: [],
}