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
  title: "Flex Mobile — Travel eSIM Store",
  description: "Unlimited travel eSIM data in 190+ destinations. Inspired by Truely.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} font-pop`}>
      <body className="min-h-screen bg-coal text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
