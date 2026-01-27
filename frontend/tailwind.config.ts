import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // This links the Tailwind class 'primary' to your CSS variable
        primary: 'var(--primary)', 
      },
    },
  },
  plugins: [],
} satisfies Config;