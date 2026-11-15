/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uptc: {
          gold: "#F3B229",
          "gold-dark": "#D4960E",
          "gold-light": "#FDE68A",
          black: "#18181B",
          dark: "#0F172A",
          gray: "#334155",
          slate: "#1E293B",
          light: "#F8FAFC"
        }
      }
    },
  },
  plugins: [],
}
