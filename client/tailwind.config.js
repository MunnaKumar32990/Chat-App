/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#25D366', // WhatsApp green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        secondary: {
          50: '#f0f4fd',
          100: '#dce3fa',
          200: '#bcc7f5',
          300: '#98a8ef',
          400: '#7586e6',
          500: '#5561de',
          600: '#4848c5',
          700: '#3a3aa3',
          800: '#2f2f80',
          900: '#292968',
        },
        success: {
          50: '#e6f7ea',
          100: '#d0f0d9',
          200: '#a0e1b3',
          300: '#6fd38c',
          400: '#3fc466',
          500: '#25D366', // WhatsApp green
          600: '#0c9133',
          700: '#096d27',
          800: '#06481a',
          900: '#03240d',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        teal: {
          500: '#128C7E', // WhatsApp teal
          700: '#075E54', // WhatsApp dark teal
        },
        blue: {
          500: '#34B7F1', // WhatsApp blue
        },
        // WhatsApp light theme colors
        whatsapp: {
          light: {
            bg: '#E5DDD5',
            bubble: {
              self: '#DCF8C6',
              other: '#FFFFFF',
            },
            header: '#075E54',
            input: '#F0F0F0',
          },
          // WhatsApp dark theme colors
          dark: {
            bg: '#0B141A',
            bubble: {
              self: '#025C4B',
              other: '#202C33',
            },
            header: '#202C33',
            input: '#2A3942',
          },
        },
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'Helvetica Neue',
          'Helvetica',
          'Lucida Grande',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'custom': '0 4px 14px 0 rgba(0, 0, 0, 0.08)',
        'custom-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
} 