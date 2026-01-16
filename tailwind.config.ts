// ===========================================
// FILE: tailwind.config.ts
// PURPOSE: Tailwind CSS configuration with TrueLevel design tokens
// PRD REFERENCE: UI Spec - Design Tokens
// ===========================================

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Design tokens from UI Spec
      colors: {
        // Background colors
        bg: {
          primary: "#F7F5F2",
          secondary: "#FFFFFF",
          tertiary: "#F0EDE8",
        },
        // Text colors
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
          inverse: "#FFFFFF",
        },
        // Primary action color
        primary: {
          DEFAULT: "#34D239",
          hover: "#2DB832",
          active: "#28A32D",
        },
        // Secondary action
        secondary: {
          DEFAULT: "#374151",
          hover: "#4B5563",
        },
        // Status colors
        success: "#34D239",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        // Borders
        border: {
          light: "#E5E2DD",
          medium: "#D1CCC4",
        },
        // Tank status colors
        tank: {
          green: "#34D239",
          yellow: "#F59E0B",
          red: "#EF4444",
          empty: "#E5E7EB",
        },
      },
      // Typography
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      // Spacing (additional to Tailwind defaults)
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      // Shadows
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      // Border radius
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
