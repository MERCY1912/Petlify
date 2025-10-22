import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff9f2',
          100: '#ffe9d1',
          200: '#ffd3a3',
          300: '#ffb46b',
          400: '#ff8e33',
          500: '#ff6f0f',
          600: '#f25404',
          700: '#c34406',
          800: '#9c380d',
          900: '#7f300f',
        },
        forest: '#356859',
        sand: '#f8f4ec',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
      boxShadow: {
        card: '0 10px 40px rgba(53, 104, 89, 0.08)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
