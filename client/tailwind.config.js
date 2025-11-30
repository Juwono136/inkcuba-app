/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {},
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        inkcuba: {
          "primary": "#000000",
          "secondary": "#F5f5f5",
          "base-100": "#f5f5f5", // Main background
          "base-200": "#f5f5f5",
          "base-300": "#E5E5E5", // Border color
        },
      },
    ],
  },
};
