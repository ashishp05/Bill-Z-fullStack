/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#10223b',
          DEFAULT: '#183153',
          800: '#1e3d67',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563EB',
          700: '#1d4ed8',
          DEFAULT: '#2563EB',
        },
        action: {
          orange: '#EA580C',
          orangeHover: '#C2410C',
          orangeLight: '#FFF7ED',
          orangeBorder: '#FDBA74',
        },
        success: {
          DEFAULT: '#16845B',
          50: '#ecfdf5',
          100: '#d1fae5',
        },
        warning: {
          DEFAULT: '#B7791F',
          50: '#fffbeb',
          100: '#fef3c7',
        },
        error: {
          DEFAULT: '#C0392B',
          50: '#fef2f2',
          100: '#fee2e2',
        },
        surface: {
          bg: '#F6F8FB',
          card: '#FFFFFF',
          border: '#E4E7EC',
          borderLight: '#F2F4F7',
        },
        appText: {
          primary: '#172033',
          secondary: '#667085',
          muted: '#98A2B3',
        },
        // Analytics metric card pastel palettes (matching design reference)
        pastel: {
          blue: '#E0F2FE',
          blueText: '#0369A1',
          yellow: '#FEF3C7',
          yellowText: '#B45309',
          mint: '#DCFCE7',
          mintText: '#15803D',
          lavender: '#F3E8FF',
          lavenderText: '#7E22CE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px 0 rgba(16, 24, 40, 0.03)',
        'elevated': '0 4px 6px -1px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)',
        'modal': '0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
