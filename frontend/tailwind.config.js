/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial"]
      },
      colors: {
        ink: {
          900: "#071A21",
          800: "#0B222B",
          700: "#0F2C36"
        }
      },
      backgroundImage: {
        "dash-bg": "linear-gradient(135deg, #0F2027 0%, #203A43 45%, #2C5364 100%)",
        primary: "linear-gradient(135deg, #00F5A0 0%, #00D9F5 100%)",
        danger: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
        success: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)"
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 30px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

