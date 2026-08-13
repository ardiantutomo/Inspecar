import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16191C",
        surface: "#F6F7F6",
        line: "#D8DCDA",
        brand: "#0E6E64",
        critical: "#B23B32",
        caution: "#C08420",
        clear: "#2E7D52",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
