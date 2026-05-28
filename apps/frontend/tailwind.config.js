export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        'text-primary': '#ffffff',
        'text-secondary': '#666666',
        'text-tertiary': '#555555',
        accent: '#00ff88',
        error: '#ff2d00',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      spacing: {
        'page': '16px',
        'section': '24px',
        'element': '8px',
      },
      borderRadius: {
        'container': '0px',
        'button': '4px',
      },
    },
  },
  plugins: [],
};
