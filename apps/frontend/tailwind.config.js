export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0D',
        surface: '#16161A',
        'text-primary': '#F4F2EC',
        'text-secondary': '#87867E',
        'text-tertiary': '#3C3C40',
        accent: '#FF2E7E',
        valid: '#34D9A0',
        error: '#FF3B30',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
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
