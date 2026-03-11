/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        violet: {
          primary: '#7B61FF',
          dark: '#6B51EF',
          light: '#9B81FF',
        },
        mint: {
          neon: '#00E5A8',
          light: '#33EEBB',
          dark: '#00CC96',
        },
        dark: {
          bg: '#0A0A0F',
          card: '#1A1A2E',
          border: '#2A2A3E',
        }
      },
      backgroundImage: {
        'gradient-violet': 'linear-gradient(135deg, #7B61FF 0%, #9B81FF 100%)',
        'gradient-mint': 'linear-gradient(135deg, #00E5A8 0%, #33EEBB 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 100%)',
      },
      boxShadow: {
        'glow-violet': '0 0 20px rgba(123, 97, 255, 0.3)',
        'glow-mint': '0 0 20px rgba(0, 229, 168, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}