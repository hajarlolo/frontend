/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandNavy: '#0F172A',
        brandViolet: '#361D78',
        brandMagenta: '#711A61',
        brand: {
          violet: '#361D78',
          magenta: '#711A61',
          paper: '#FFFFFF',
          text: '#1F2937',
          mist: '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 25px -12px rgba(54, 29, 120, 0.35)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #361D78 0%, #711A61 100%)',
        'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(54, 29, 120, 0.15) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(113, 26, 97, 0.1) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(54, 29, 120, 0.15) 0, transparent 50%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
