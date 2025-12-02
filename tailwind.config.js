/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e6f7ff',
          200: '#bfeeff',
          300: '#99e4ff',
          400: '#66d7ff',
          500: '#2ec0e6',
          600: '#08a0cc',
          700: '#0b7fa3',
          800: '#085f7a',
          900: '#043f4f'
        },
        surface: {
          DEFAULT: '#f7f9fb',
          muted: '#f1f5f9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Poppins', 'Inter']
      },
      spacing: {
        18: '4.5rem'
      },
      boxShadow: {
        'card': '0 6px 18px rgba(17,24,39,0.06)',
        'card-lg': '0 12px 30px rgba(17,24,39,0.08)'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 320ms ease-out both',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 400ms ease-out'
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%)',
        'gradient-neon': 'linear-gradient(135deg, #2ec0e6 0%, #08a0cc 100%)',
        'gradient-accent': 'linear-gradient(to right, rgba(46, 192, 230, 0.1), rgba(8, 160, 204, 0.1))'
      }
    }
  },
  plugins: [],
};
