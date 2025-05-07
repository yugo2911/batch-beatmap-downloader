module.exports = {
  content: ["./src/**/*.{ts,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        monokai: {
          blue: "#2c5c87",
          dark: "#192227",
          light: "#263238",
          border: "#141C20",
          light2: "#37474f",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
};
