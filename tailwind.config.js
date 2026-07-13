/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#16231F',
        surface: '#FFFFFF',
        canvas: '#F6F7F5',
        muted: '#6B7A75',
        teal: {
          DEFAULT: '#2F6F6B',
          light: '#3FA79D',
          dark: '#1D4A47',
        },
        readout: '#0D1F1C',
        amber: '#B8783A',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
