import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#fbfbf8',
        ink: '#1b1b1b',
        graphite: '#3b3b35',
        accent: '#5a6b5a',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        float: '0 10px 20px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
