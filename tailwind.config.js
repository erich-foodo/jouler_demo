/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'thermal': {
          'hot': '#FF4444',
          'warm': '#FF8844', 
          'cool': '#4488FF',
          'cold': '#4444FF',
          'neutral': '#888888'
        },
        'utility': {
          'primary': '#1E40AF',
          'secondary': '#059669',
          'accent': '#DC2626'
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

