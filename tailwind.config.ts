import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#204CC7',
          // NOTE: `light` is intentionally a HEX (not rgba) so the Tailwind
          // opacity modifier (`bg-brand-light/50`) behaves multiplicatively.
          // #EDF1FB is visually identical to rgba(32,76,199,0.08) over white,
          // so existing plain `bg-brand-light` usages look unchanged, while
          // `bg-brand-light/40|50|60` now correctly produce even-softer tones
          // instead of the heavy 50%-blue fill the old rgba alpha produced.
          light: '#EDF1FB',
          hover: '#1a3fa3',
          dark: '#17378C',
        },
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
