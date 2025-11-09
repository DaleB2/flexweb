/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#13062B",
        plum: "#2B0B59",
        iris: "#5B2BEA",
        fuchsia: "#FF6AD5",
        amber: "#FFC857",
        lilac: "#D9CEFF",
        moon: "#F5F2FF",
        blush: "#FF9AC0",
        cloud: "#FDFBFF",
      },
      boxShadow: {
        card: "0 25px 70px rgba(19,6,43,0.28)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        pop: ["Poppins", "system-ui", "sans-serif"],
        helv: ["Helvetica", "Arial", "sans-serif"],
        display: ["Poppins", "Helvetica", "Arial", "sans-serif"],
      },
      backgroundImage: {
        heroOrb: "radial-gradient(circle at top right, rgba(255,106,213,0.4), transparent 60%)",
        heroDepth: "linear-gradient(135deg, rgba(91,43,234,0.65), rgba(19,6,43,0.95))",
      },
    },
  },
  plugins: [],
};
