/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          hover: 'var(--primary-hover-color)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          hover: 'var(--secondary-hover-color)',
        },
        terciary: {
          DEFAULT: 'var(--terciary-color)',
          hover: 'var(--terciary-hover-color)',
        },
      },
    },
  },
  plugins: [],
}
