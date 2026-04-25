import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FDFCF0",
        "ivory-dark": "#F5F3DC",
        "ivory-border": "#E8E4C8",
        slate: {
          ...require("tailwindcss/colors").slate,
          blue: "#1E293B",
        },
        crimson: {
          DEFAULT: "#DC143C",
          hover: "#B01030",
          light: "#FFF0F3",
        },
        parchment: {
          DEFAULT: "#F0EAD6",
          dark: "#D4C9A8",
          text: "#5C4A2A",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        parchment: "0 4px 24px rgba(92, 74, 42, 0.12), 0 1px 4px rgba(92, 74, 42, 0.08)",
        "parchment-lg": "0 8px 40px rgba(92, 74, 42, 0.16), 0 2px 8px rgba(92, 74, 42, 0.10)",
      },
      backgroundImage: {
        "parchment-texture":
          "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(180,160,100,0.04) 28px, rgba(180,160,100,0.04) 29px)",
      },
    },
  },
  plugins: [],
};

export default config;
