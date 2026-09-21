/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        base: {
          950: "#060d14",
          900: "#0a1628",
          800: "#0f1f35",
          700: "#152840",
          600: "#1c3352",
          500: "#243f63",
        },
        ice: {
          400: "#67e8f9",
          500: "#22d3ee",
          600: "#06b6d4",
          700: "#0891b2",
        },
        status: {
          ok:       "#10b981",
          warn:     "#f59e0b",
          critical: "#f43f5e",
          offline:  "#6b7280",
          sync:     "#8b5cf6",
        },
        text: {
          primary:   "#e2e8f0",
          secondary: "#94a3b8",
          muted:     "#475569",
          accent:    "#38bdf8",
        },
        data: {
          fuel:      "#f97316",
          power:     "#facc15",
          temp:      "#60a5fa",
          food:      "#4ade80",
          people:    "#a78bfa",
        },
      },
    },
  },
  plugins: [],
}
