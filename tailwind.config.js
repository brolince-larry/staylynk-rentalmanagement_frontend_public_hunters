import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Premium brand ramp — matches the logo's purple mark.
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Gold accent — matches the logo's roofline.
        gold: {
          50: '#fefaf0',
          100: '#fdf2d8',
          200: '#fbe4ab',
          300: '#f8d074',
          400: '#f3b73f',
          500: '#e9a020',
          600: '#c97f16',
          700: '#a35f15',
          800: '#854c18',
          900: '#6f4018',
        },
        // App-wide dark surfaces, named for reuse instead of repeating hex literals.
        ink: {
          900: '#141421',
          950: '#0d0d14',
        },
      },
      boxShadow: {
        premium: '0 24px 70px -18px rgba(124, 58, 237, 0.4)',
        'premium-gold': '0 24px 70px -18px rgba(233, 160, 32, 0.35)',
        'premium-sm': '0 10px 30px -10px rgba(124, 58, 237, 0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 45%, #e9a020 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(233,160,32,0.12) 100%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-16px) rotate(0.4deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%':      { opacity: '0.9',  transform: 'scale(1.08)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.6s linear infinite',
        'glow-pulse': 'glow-pulse 4.5s ease-in-out infinite',
        marquee: 'marquee 42s linear infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
