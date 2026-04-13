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
          light: '#6CC8C6',
          DEFAULT: '#0EA5A4',
          dark: '#0B8483', // using this for gradient
        },
        button: '#1496A3',
        background: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E5E7EB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        }
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #0EA5A4 0%, #0B8483 100%)',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
