/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#05374d', // Azul oscuro
        secondary: '#1a5673', // Azul medio
        accent: '#f4a261', // Naranja cálido
        neutral: '#f8fafc', // Blanco grisáceo claro
        // Colores para modo oscuro
        'dark-bg': '#0f172a', // Fondo principal (slate-900)
        'dark-bg-secondary': '#1e293b', // Fondo contenedores (slate-800)
        'dark-bg-tertiary': '#334155', // Fondo alternado (slate-700)
        'dark-text-primary': '#f3f4f6', // Texto principal (gray-100)
        'dark-text-secondary': '#d1d5db', // Texto secundario (gray-300)
        'dark-text-accent': '#f4a261', // Texto destacado (accent)
        'dark-primary': '#1e40af', // Botones/interactivos (indigo-800)
        'dark-secondary': '#3b82f6', // Hovers (blue-500)
        'dark-border': '#4b5563', // Bordes (gray-600)
        'dark-shadow': '#1e293b', // Sombras (slate-800)
        'dark-error': '#f87171', // Errores (red-400)
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};