import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          500: '#9945FF',
          600: '#8A3FF0',
          700: '#7B36E1',
        },
        green: {
          400: '#14F195',
          500: '#00D084',
          600: '#00B373',
        },
        gray: {
          800: '#1A1B23',
          900: '#0F1114',
        }
      },
    },
  },
  plugins: [],
}

export default config