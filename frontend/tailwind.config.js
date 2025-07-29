/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // Add this line
  theme: {
    extend: {
      colors: {
        primary: "#FF6B00",
        mintGreen: "#9BFFB0",
        coolGrey: "#9CA3AF",
        dark: "#1F1F1F",
      },
    },
  },
  plugins: [],
};
