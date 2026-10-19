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
          DEFAULT: '#17243A',
          50: '#F0F4FA',
          100: '#DDE5F2',
          200: '#B8CBE5',
          300: '#8FAED4',
          400: '#5C8BBF',
          500: '#346DA8',
          600: '#235082',
          700: '#1B3A5F',
          800: '#17243A',
          900: '#0E1724',
          950: '#070C14',
        },
        germanRed: {
          DEFAULT: '#D94747',
          50: '#FDF2F2',
          100: '#FCE6E6',
          200: '#F9C2C2',
          300: '#F49393',
          400: '#EC6161',
          500: '#D94747',
          600: '#BF2828',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#691D1D',
        },
        ivory: {
          DEFAULT: '#F5F1E8',
          50: '#FCFAF7',
          100: '#F5F1E8',
          200: '#EBE2D0',
          300: '#DDD0B4',
          400: '#CBB993',
          500: '#B5A072',
        },
        dark: {
          DEFAULT: '#202A39',
          muted: '#687386',
        },
        german: {
          der: '#2563EB', // Masculine
          die: '#DC2626', // Feminine
          das: '#16A34A', // Neuter
          pl: '#D97706',  // Plural
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(23, 36, 58, 0.05), 0 1px 2px -1px rgba(23, 36, 58, 0.05)',
        'card': '0 4px 6px -1px rgba(23, 36, 58, 0.07), 0 2px 4px -2px rgba(23, 36, 58, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(23, 36, 58, 0.09), 0 4px 6px -4px rgba(23, 36, 58, 0.05)',
      }
    },
  },
  plugins: [],
}
