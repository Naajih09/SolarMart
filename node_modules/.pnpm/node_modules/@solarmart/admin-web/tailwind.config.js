/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}", "../../packages/shared/src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0f766e",
          deep: "#0f172a",
          yellow: "#f59e0b",
          slate: "#334155",
          cream: "#f8fafc",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(15, 118, 110, 0.22), transparent 38%), radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.16), transparent 28%), linear-gradient(135deg, rgba(15, 23, 42, 0.04), transparent 45%)",
      },
    },
  },
  plugins: [],
};
