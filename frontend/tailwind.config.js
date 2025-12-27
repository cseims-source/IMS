/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          "50": "#eef2ff",
          "100": "#e0e7ff",
          "200": "#c7d2fe",
          "300": "#a5b4fc",
          "400": "#818cf8",
          "500": "#6366f1",
          "600": "#4f46e5", // Indigo Night (Primary)
          "700": "#4338ca",
          "800": "#3730a3",
          "900": "#312e81",
          "950": "#1e1b4b",
        },
        secondary: {
          "500": "#8b5cf6", // Electric Violet
          "600": "#7c3aed",
        },
        accent: {
          "500": "#06b6d4", // Glacier Cyan (Success / Replaces Green)
          "600": "#0891b2",
        }
      },
      borderRadius: {
        'ims': '2rem',
        'hub': '3rem',
        'node': '1.2rem',
      },
      animation: {
        'float': 'float-badge 3s ease-in-out infinite',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'float-badge': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.3', filter: 'blur(40px)' },
          '50%': { opacity: '0.6', filter: 'blur(60px)' },
        },
        'slide-up': {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}