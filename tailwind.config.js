/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        iris: "#5B2BEA",
        fuchsia: "#FF6AD5",
        midnight: "#040b17",
        tealMist: "#0b4b63",
        glass: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "sans-serif",
        ],
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top,#13304a,transparent 55%),radial-gradient(circle at 20% 20%,rgba(91,43,234,0.35),transparent 65%),radial-gradient(circle at 80% 0%,rgba(10,163,161,0.28),transparent 60%)",
      },
    },
  },
  plugins: [],
};
