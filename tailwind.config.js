/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#1F7A3F",
          deep: "#103B22",
          yellow: "#F5C245",
          slate: "#2C2C2C",
          cream: "#F9F7F1",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 45px rgba(16, 59, 34, 0.12)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(245, 194, 69, 0.28), transparent 35%), radial-gradient(circle at bottom right, rgba(31, 122, 63, 0.2), transparent 30%)",
      },
    },
  },
  plugins: [],
};
