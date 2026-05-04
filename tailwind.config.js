/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  // Aktifkan class-based dark mode
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Default theme — Emerald (ibadah)
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Accent — Amber (streak/reward)
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Haid Mode theme — Rose
        haid: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        // Surface colors
        surface: '#f8fafc',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        arabic: ['"Scheherazade New"', 'serif'],
      },
      fontSize: {
        // Arabic text sizes
        'arabic-sm': ['1.25rem', { lineHeight: '2rem' }],
        'arabic-base': ['1.5rem', { lineHeight: '2.5rem' }],
        'arabic-lg': ['1.875rem', { lineHeight: '3rem' }],
        'arabic-xl': ['2.25rem', { lineHeight: '3.5rem' }],
      },
      spacing: {
        // Safe area untuk bottom nav
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        'pulse-reward': 'pulseReward 0.6s ease-in-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseReward: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
    },
  },
  plugins: [],
}

