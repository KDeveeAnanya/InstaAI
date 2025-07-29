/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff720d',
        accent: '#cbf498',
        dark: '#0f172a',
        background: '#000000',
        lightPurple: '#b5a3ff',
        coolGrey: '#6b7280',
        mintGreen: '#00c896',
        coralRed: '#ff5d5d',
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
