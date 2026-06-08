import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        glass: {
          border: "rgba(255, 255, 255, 0.05)",
          bg: "rgba(255, 255, 255, 0.03)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
