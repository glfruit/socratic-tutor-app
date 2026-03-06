import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4A6FA5",
        accent: "#E8B339",
        background: "#F8F9FA",
        tutor: "#E8EEF4"
      },
      boxShadow: {
        card: "0 10px 25px rgba(74, 111, 165, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
