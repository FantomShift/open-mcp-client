/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gray-750": "#2D3748",
        "gray-850": "#1A202C",
        "true-black": "#000000",
        "true-white": "#FFFFFF",
        "off-black": "#121212",
        "charcoal": "#1a1a1a",
      },
      animation: {
        "pulse-subtle": "pulse 2s infinite ease-in-out",
      },
      backgroundColor: {
        'dark': {
          DEFAULT: '#000000',
          'hover': '#121212',
          'accent': '#1a1a1a',
        }
      },
      textColor: {
        'dark': {
          DEFAULT: '#FFFFFF',
          'muted': '#CCCCCC',
        }
      },
      borderColor: {
        'dark': {
          DEFAULT: '#333333',
          'accent': '#444444',
        }
      }
    },
  },
  plugins: [],
};

export default config; 