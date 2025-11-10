import type { Metadata } from "next";
import "./globals.css";
import { ToastHost } from "@/components/ui/use-toast";

export const metadata: Metadata = {
  title: "Flex eSIM — Truely-inspired checkout",
  description:
    "Explore destinations, pay securely, and activate your travel eSIM through a Truely-style stacked card journey.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-aurora text-white">
        <ToastHost>{children}</ToastHost>
      </body>
    </html>
  );
}
