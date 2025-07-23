/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-red-900',
    'bg-purple-500',
    'bg-blue-600',
    'bg-green-600',
    'bg-yellow-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-gray-600',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

