/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- ADICIONE ESTA LINHA AQUI!
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ... suas outras configurações de tema
    },
  },
  plugins: [],
};