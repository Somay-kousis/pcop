/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        claude: {
          bg: '#18181B',
          sidebar: '#141416',
          card: '#262626',
          border: '#333333',
          hover: '#2D2D30',
          accent: '#D97757', // Authentic Claude Terracotta / Burnt Orange
          accentHover: '#C15C3D',
          text: '#F4F4F5',
          muted: '#A1A1AA'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
