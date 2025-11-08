/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: "#2FEFCC",         // Bright Turquoise
        bottle: "#092927",       // Bottle Green
        daisy: "#FDF074",        // Paris Daisy
        heliotrope: "#E57EFB",   // Heliotrope
        anakiwa: "#87EFFF",      // Anakiwa
        royal: "#2954E5",        // Royal Blue
        persian: "#5213D0",      // Persian Blue
        violet: "#18063E",       // Violet
        nurse: "#F3F6F3",        // Gray Nurse
        coal: "#060808"          // Woodsmoke
      },
      boxShadow: {
        card: "0 14px 40px rgba(9,41,39,.12)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      fontFamily: {
        pop: ['Poppins', 'system-ui', 'sans-serif'],
        helv: ['Helvetica', 'Arial', 'sans-serif'],
        // MD Nichrome is licensed; we’ll fall back to Poppins/Helvetica.
        display: ['Poppins', 'Helvetica', 'Arial', 'sans-serif']
      },
      backgroundImage: {
        heroGrad: "linear-gradient(180deg,#6FD4FF 0%,#CDBBFD 50%,#F7D2D7 100%)"
      }
    }
  },
  plugins: []
}
