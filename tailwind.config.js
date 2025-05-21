/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#05374d',
        secondary: '#1a5673',
        accent: '#f4a261',
        neutral: '#f8fafc',
      },
    },
  },
  plugins: [],
  darkmode: 'class',
};