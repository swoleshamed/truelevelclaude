// ===========================================
// FILE: src/app/layout.tsx
// PURPOSE: Root layout for TrueLevel application
// Provides global styles, PWA configuration, and base HTML structure
// ===========================================

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "TrueLevel - Chemical Inventory Management",
  description: "Mobile-first chemical inventory management for car wash operators and distributors",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TrueLevel",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "TrueLevel",
    title: "TrueLevel - Chemical Inventory Management",
    description: "Mobile-first chemical inventory management for car wash operators and distributors",
  },
  twitter: {
    card: "summary",
    title: "TrueLevel - Chemical Inventory Management",
    description: "Mobile-first chemical inventory management for car wash operators and distributors",
  },
};

export const viewport: Viewport = {
  themeColor: "#34D239",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TrueLevel" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#34D239" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
