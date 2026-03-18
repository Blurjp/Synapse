import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Synapse Design Color Palette - Purple to Blue Gradient
        primary: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7", // Gradient start (purple)
          600: "#9333EA",
          700: "#7C3AED", // Gradient middle
          800: "#6D28D9",
          900: "#5B21B6",
        },
        accent: {
          400: "#60A5FA",
          500: "#3B82F6", // Gradient end (blue)
          600: "#2563EB",
        },
        secondary: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        success: {
          500: "#22C55E",
          600: "#16A34A",
        },
        warning: {
          500: "#F59E0B",
          600: "#D97706",
        },
        danger: {
          500: "#EF4444",
          600: "#DC2626",
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #3B82F6 100%)',
        'gradient-primary-light': 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 50%, #DBEAFE 100%)',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
