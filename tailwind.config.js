/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",   // semua file dalam folder app (Expo Router)
    "./components/**/*.{js,jsx,ts,tsx}", // kalau ada komponen terpisah
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
