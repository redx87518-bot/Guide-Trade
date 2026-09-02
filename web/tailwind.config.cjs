/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00f0ff',
        secondary: '#7c3aed',
        success: '#00ff88',
        surface: '#0a0a0f',
        'surface-card': '#0f0f15',
      },
    },
  },
  plugins: [],
};
