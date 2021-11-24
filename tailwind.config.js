module.exports = {
  purge: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        'quri': "url('/icons/logo.svg')",
       }
    },
  },
  variants: {
    extend: {},
    margin: ['responsive', 'hover'],
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
