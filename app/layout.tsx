import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flex Mobile — Reliable global eSIMs",
  description:
    "Stay online in 200+ destinations with instant eSIM activation, transparent pricing, and a checkout inspired by Roamless.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} font-pop`}>
      <body className="min-h-screen bg-gradient-to-br from-midnight via-plum to-midnight text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
