/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}", "../../packages/shared/src/**/*.{js,jsx}"],
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
        soft: "0 24px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(34, 197, 94, 0.22), transparent 38%), radial-gradient(circle at bottom right, rgba(134, 239, 172, 0.18), transparent 28%), linear-gradient(135deg, rgba(5, 46, 22, 0.06), transparent 45%)",
      },
    },
  },
  plugins: [],
};
