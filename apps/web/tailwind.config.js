import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, './index.html'),
    path.join(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
    './apps/web/index.html',
    './apps/web/src/**/*.{js,ts,jsx,tsx}',
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Forest Green / Pine Palette (Donezo Theme)
        forest: {
          DEFAULT: '#144E3D',
          50: '#F0F9F6',
          100: '#DDF2EB',
          200: '#BCE5D7',
          300: '#8DD3BE',
          400: '#56B99E',
          500: '#2F9C80',
          600: '#217E66',
          700: '#1A6452',
          800: '#144E3D',
          900: '#113F32',
          950: '#09241C',
        },
        // Fresh Mint Accent
        mint: {
          DEFAULT: '#34D399',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Navy aliased to sleek deep pine/forest so all existing classes match seamlessly
        navy: {
          DEFAULT: '#144E3D',
          50: '#F4F7F5',
          100: '#E4ECE8',
          200: '#C7D9D1',
          300: '#A4C0B4',
          400: '#7EA595',
          500: '#5A8B77',
          600: '#3D715C',
          700: '#255745',
          800: '#144E3D',
          900: '#0E362A',
          950: '#072018',
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
        canvas: {
          DEFAULT: '#0A0D17',
          dark: '#05070D',
        },
        ivory: {
          DEFAULT: '#0D111F',
          50: '#161D33',
          100: '#11162B',
          200: '#0A0D17',
        },
        dark: {
          DEFAULT: '#F8FAFC',
          muted: '#94A3B8',
        },
        german: {
          der: '#2563EB',
          die: '#DC2626',
          das: '#16A34A',
          pl: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(17, 24, 39, 0.04), 0 1px 2px -1px rgba(17, 24, 39, 0.04)',
        'card': '0 4px 6px -1px rgba(17, 24, 39, 0.05), 0 2px 4px -2px rgba(17, 24, 39, 0.04)',
        'card-hover': '0 12px 20px -3px rgba(17, 24, 39, 0.08), 0 4px 6px -4px rgba(17, 24, 39, 0.04)',
      }
    },
  },
  plugins: [],
};
