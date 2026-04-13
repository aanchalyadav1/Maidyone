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
          light: '#A6FFCB',
          DEFAULT: '#1FA2A6',
          dark: '#147a7d',
        },
        accent: {
          DEFAULT: '#F9D423',
        },
        background: '#f4f6f8',
        card: '#ffffff',
        text: {
          primary: '#333333',
          secondary: '#888888',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Or 'Outfit' based on the design
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 162, 166, 0.37)'
      }
    },
  },
  plugins: [],
}
