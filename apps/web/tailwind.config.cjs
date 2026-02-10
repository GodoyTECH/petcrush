/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        gold: "#ffd36e",
        mint: "#7dffb2",
        coral: "#ff7aa2",
        sky: "#7ae0ff"
      },
      boxShadow: {
        glow: "0 0 30px rgba(255, 211, 110, 0.25)"
      }
    }
  },
  plugins: []
};
