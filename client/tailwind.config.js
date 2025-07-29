// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  extend: {
    colors: {
      primary: '#4f46e5',        // Indigo-600
      'primary-dark': '#4338ca'  // Indigo-700
    }
  }
},
  darkMode: 'class', // Enable dark mode support
  plugins: [],
}
