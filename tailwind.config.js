/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme")

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sofia Sans Condensed"', ...defaultTheme.fontFamily.sans]
      },
      gridTemplateColumns: {
        population: "60px 100px 60px 100px 60px"
      }
    }
  },
  plugins: []
}
