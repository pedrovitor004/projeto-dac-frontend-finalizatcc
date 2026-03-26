/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ifpb: {
          green: "#32a041",
          dark: "#1b5e20",
        },
      },
    },
  },
  plugins: [],
};
