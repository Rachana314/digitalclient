/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandRed: "#EF4136",
        brandBlue: "#5273FF",
        brandOrange: "#FA6800",
        brandBlack: "#1A1A1A",
        brandBg: "#F6F7F9",
      },
    },
  },
  plugins: [],
};
