/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9F6', // Alabaster Paper Base
        slate: {
          50: '#FAF9F6',
          100: '#F2F1ED',
          200: '#E3E1DB', // Warm Clay border
          300: '#CAC7BD',
          400: '#A19E92',
          500: '#7F7C71', // Sage Warm Gray
          600: '#5F5D54',
          700: '#42403A',
          800: '#282723',
          900: '#11161B', // Ink Black
        },
        indigo: {
          50: '#F0F4FA',
          100: '#E1EBF5',
          200: '#C3D5EB',
          500: '#3E6D9C',
          600: '#2B4C7E', // Renaissance Cobalt Accent
          700: '#1F385C',
          800: '#14253D',
          900: '#0B1421',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#E2B13C', // Manuscript Ochre
          600: '#D49D42',
          700: '#B27D2E',
        },
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#568A6B', // Archival Sage
          600: '#446E54',
          700: '#33523E',
        },
        red: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          600: '#A83B3B', // Academic Crimson
          650: '#A83B3B',
          700: '#8A2F2F',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'draw-line': 'drawLine 2s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
