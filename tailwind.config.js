/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold:     '#F5C518',
          'gold-d': '#C89B00',
          red:      '#C8102E',
          dark:     '#0A0A0F',
          dark2:    '#12121A',
          dark3:    '#1A1A28',
          dark4:    '#22223A',
          muted:    '#888899',
        },
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body:    ['var(--font-barlow)', 'sans-serif'],
        cond:    ['var(--font-barlow-cond)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
