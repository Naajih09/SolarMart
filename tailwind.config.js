/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#22C55E",
          deep: "#052E16",
          yellow: "#86EFAC",
          slate: "#1F3B2E",
          cream: "#F4FFF7",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 45px rgba(5, 46, 22, 0.16)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(134, 239, 172, 0.25), transparent 35%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.2), transparent 30%)",
      },
    },
  },
  plugins: [],
};
