// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

// /** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(30px, -40px)' },
        }
      }
    },
  },
}