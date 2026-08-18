/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ธีมแดงเลือดนก (Crimson / Oxblood) — อ้างอิงผ่าน CSS custom properties เสมอ
        primary: {
          DEFAULT: "var(--primary)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          tint: "var(--primary-tint)",
        },
        accent: {
          gold: "var(--accent-gold)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          alt: "var(--surface-alt)",
        },
        border: {
          DEFAULT: "var(--border-color)",
        },
        status: {
          success: "var(--status-success)",
          pending: "var(--status-pending)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
        },
      },
      backgroundColor: {
        base: "var(--bg)",
      },
      textColor: {
        ink: "var(--text)",
        muted: "var(--text-muted)",
      },
      fontFamily: {
        sans: ["Sarabun", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
