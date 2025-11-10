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
        truelyBlue: "#0B8DF4",
        truelyNavy: "#051947",
        truelyLime: "#9CFF00",
        truelyMint: "#B5FFE1",
        truelySky: "#4AB9FF",
      },
      boxShadow: {
        card: "0 25px 70px rgba(19,6,43,0.28)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        pop: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        helv: ["Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-poppins)", "Helvetica", "Arial", "sans-serif"],
      },
      backgroundImage: {
        heroGrad: "linear-gradient(160deg, #071943 0%, #042461 45%, #020d2b 100%)",
        heroOverlay: "linear-gradient(135deg, rgba(11,141,244,0.38), rgba(5,25,71,0.9))",
        heroHalo: "radial-gradient(circle at top, rgba(74,185,255,0.55), transparent 70%)",
        heroOrb: "radial-gradient(circle at top right, rgba(255,106,213,0.4), transparent 60%)",
        heroDepth: "linear-gradient(135deg, rgba(91,43,234,0.65), rgba(19,6,43,0.95))",
      },
    },
  },
  plugins: [],
};
