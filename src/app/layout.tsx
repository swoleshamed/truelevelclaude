// ===========================================
// FILE: src/app/layout.tsx
// PURPOSE: Root layout for TrueLevel application
// Provides global styles and base HTML structure
// ===========================================

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueLevel - Chemical Inventory Management",
  description: "Mobile-first chemical inventory management for car wash operators and distributors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
