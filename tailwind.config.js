/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#2A2118',
        surface: '#FFFCF7',
        canvas: '#F5E8DA',
        muted: '#8A7A68',
        sage: {
          DEFAULT: '#5F7350',
          light: '#8FA873',
          dark: '#3F4C36',
        },
        readout: '#2A1F17',
        terracotta: '#BD6B4C',
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
