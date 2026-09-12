/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#FFF9FB",
          950: "#FFF7FA",
          900: "#FFF9FC",
          850: "#FFF1F6",
          800: "#FCE5EE",
          750: "#F8DCE8",
          700: "#F3D0DF",
        },
        graphite: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          elevated: "#FFF3F7",
          border: "#F0C7D7",
          subtle: "#E8AFC5",
        },
        amber: {
          50: "#FFF2F7",
          100: "#FFE2EC",
          200: "#FFC5D8",
          300: "#FBA1C0",
          400: "#F276A4",
          500: "#E5548B",
          600: "#C73C70",
          700: "#A42B59",
          800: "#842447",
          900: "#641E38",
          950: "#421126",
          glow: "#FBA1C0",
          DEFAULT: "#E5548B",
          dim: "#A42B59",
          dark: "#641E38",
        },
        flame: {
          DEFAULT: "#FF6B35",
          hover: "#E85924",
        },
        status: {
          todo: "#94A3B8",
          in_progress: "#06B6D4",
          in_review: "#F59E0B",
          done: "#10B981",
          overdue: "#F43F5E",
        },
        priority: {
          low: "#64748B",
          medium: "#14B8A6",
          high: "#F97316",
          critical: "#EF4444",
        },
      },
      fontFamily: {
        heading: ["-apple-system", "BlinkMacSystemFont", "'SF Pro Display'", "'Helvetica Neue'", "Helvetica", "Arial", "sans-serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "'SF Pro Text'", "'Helvetica Neue'", "Helvetica", "Arial", "sans-serif"],
        mono: ["'SF Mono'", "SFMono-Regular", "ui-monospace", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        amber: "0 0 24px -4px rgba(229, 84, 139, 0.22)",
        "amber-subtle": "0 0 12px -2px rgba(229, 84, 139, 0.14)",
        glow: "0 0 30px -5px rgba(229, 84, 139, 0.18)",
        overdue: "0 0 20px -2px rgba(244, 63, 94, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ticker-slide": "ticker 25s linear infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}
