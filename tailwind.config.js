/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme")

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      dark: "#454545",
      accent: "#FF6000",
      lighter: "#FFA559",
      light: "#FFE6C7"
    },
    extend: {
      fontFamily: {
        sans: ['"Sofia Sans Condensed"', ...defaultTheme.fontFamily.sans]
      },
      gridTemplateColumns: {
        population: "60px 100px 60px 100px 60px",
        "population-mobile": "60px 1fr 60px 1fr 60px"
      }
    }
  },
  plugins: []
}
