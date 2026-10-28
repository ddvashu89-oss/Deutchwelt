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
        // Deep Teutonic Obsidian Space
        space: {
          950: '#030712', // Canvas Background
          900: '#070D1A', // Elevated Shell
          850: '#0B1325', // Glass Card Base
          800: '#101B33', // Card Highlight / Hover
          750: '#162444', // Surface Interactive
          700: '#1D2E55', // Structural Border
          600: '#2A3F70', // Subtle Line
        },
        // Electric Sapphire / Royal Prussian Blue (Brand Primary)
        brand: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        // German National Tricolor Modernized Luxury Accents
        germanGold: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        germanRed: {
          DEFAULT: '#F43F5E',
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
        },
        germanBlack: {
          DEFAULT: '#0A0E17',
          deep: '#03060B',
        },
        // Role Themes
        student: {
          DEFAULT: '#06B6D4',
          cyan: '#06B6D4',
          emerald: '#10B981',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        teacher: {
          DEFAULT: '#0D9488',
          teal: '#0D9488',
          emerald: '#10B981',
          glow: 'rgba(13, 148, 136, 0.25)',
        },
        admin: {
          DEFAULT: '#8B5CF6',
          violet: '#8B5CF6',
          indigo: '#6366F1',
          glow: 'rgba(139, 92, 246, 0.25)',
        },
        // German Grammar Articles
        german: {
          der: '#3B82F6', // Masculine (Royal Blue)
          die: '#F43F5E', // Feminine (Crimson Red)
          das: '#10B981', // Neuter (Emerald Green)
          pl: '#F59E0B',  // Plural (Amber Gold)
        },
        // Backwards compatibility aliases
        navy: {
          DEFAULT: '#0B1325',
          800: '#070D1A',
          900: '#030712',
        },
        forest: {
          DEFAULT: '#0D9488',
        },
        mint: {
          DEFAULT: '#10B981',
        },
        canvas: {
          DEFAULT: '#030712',
          dark: '#010307',
        },
        ivory: {
          DEFAULT: '#070D1A',
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
        '5xl': '40px',
      },
      boxShadow: {
        'glow-brand': '0 0 30px -5px rgba(59, 130, 246, 0.35)',
        'glow-gold': '0 0 30px -5px rgba(245, 158, 11, 0.35)',
        'glow-student': '0 0 30px -5px rgba(6, 182, 212, 0.35)',
        'glow-teacher': '0 0 30px -5px rgba(13, 148, 136, 0.35)',
        'glow-admin': '0 0 30px -5px rgba(139, 92, 246, 0.35)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-elevated': '0 20px 50px -10px rgba(0, 0, 0, 0.65)',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};
