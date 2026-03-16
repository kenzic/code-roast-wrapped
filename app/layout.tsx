import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Roast",
  description: "Turn any GitHub repo into a roast video.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#10251c] text-[#efdfb7] antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
