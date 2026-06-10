/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Stayzium style primary blue
        secondary: '#4b5563', // gray-600
        background: '#f3f4f6', // gray-100
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
