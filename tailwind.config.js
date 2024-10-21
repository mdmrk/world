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
      },
      animation: {
        shake: "shake 5s ease infinite",
        "slide-fade": "slide-fade 1s"
      },
      transitionProperty: {
        "slide-fade": "all"
      },
      transitionTimingFunction: {
        "slide-fade-in": "ease-out",
        "slide-fade-out": "ease-out"
      },
      transitionDuration: {
        "slide-fade-in": "300ms",
        "slide-fade-out": "300ms"
      },
      keyframes: {
        "slide-fade": {
          "from, to": { transform: "translateY(-20px)", opacity: "0" }
        },
        shake: {
          "0%": { transform: "rotate(-12deg)" },
          "8%": { transform: "rotate(12deg)" },
          "10%": { transform: "rotate(24deg)" },
          "18%, 20%": { transform: "rotate(-24deg)" },
          "28%, 30%": { transform: "rotate(24deg)" },
          "38%, 40%": { transform: "rotate(-24deg)" },
          "48%, 50%": { transform: "rotate(24deg)" },
          "58%, 60%": { transform: "rotate(-24deg)" },
          "68%": { transform: "rotate(24deg)" },
          "75%, 100%": { transform: "rotate(0deg)" }
        }
      }
    }
  },
  plugins: []
}
