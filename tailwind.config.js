/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'chapa-yellow': '#F5A623',
        'chapa-yellow-light': '#FFF3D6',
        'chapa-brown': '#2B1E16',
        'chapa-brown-light': '#4A3728',
        'chapa-cream': '#FDFBF7',
        'chapa-bg': '#FAFAFA',
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(43, 30, 22, 0.08)',
        'card-hover': '0 4px 20px rgba(43, 30, 22, 0.12)',
        'float': '0 4px 24px rgba(43, 30, 22, 0.15)',
      },
    },
  },
  plugins: [],
};
