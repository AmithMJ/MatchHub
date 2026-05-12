/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1d4ed8',
          dark: '#1e40af',
          light: '#3b82f6',
        },
        sports: {
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#f59e0b',
          dark: '#0f172a',
        }
      },
      backgroundImage: {
        'sports-gradient': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      backdropFilter: {
        'blur-md': 'blur(12px)',
      }
    },
  },
  plugins: [],
}
