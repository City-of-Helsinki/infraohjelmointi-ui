/** This tailwind config files is modified to reflect the HDS standards */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      l: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
      '5xl': '3rem',
      'heading-s': [
        'var(--fontsize-heading-s)',
        {
          fontWeight: '500',
          letterSpacing: '0.2px',
          lineHeight: '1.4',
        },
      ],
      'heading-m': [
        'var(--fontsize-heading-m)',
        {
          fontWeight: '500',
          letterSpacing: '-0.2px',
          lineHeight: '32px',
        },
      ],
      'heading-l': [
        'var(--fontsize-heading-l)',
        {
          fontWeight: '400',
          letterSpacing: '-0.4px',
          lineHeight: '1',
        },
      ],
      'heading-xl': [
        'var(--fontsize-heading-xl)',
        {
          fontWeight: '400',
          letterSpacing: '-1.0px',
          lineHeight: 'var(--lineheight-s)',
        },
      ],
    },
    colors: {
      black: 'var(--color-black)',
      'black-90': 'var(--color-black-90)',
      'black-80': 'var(--color-black-80)',
      'black-60': 'var(--color-black-60)',
      gray: 'var(--color-black-20)',
      white: 'var(--color-white)',
      fog: 'var(--color-fog)',
      bus: 'var(--color-bus)',
      'bus-m': 'var(--color-bus-medium-light)',
      'bus-l': 'var(--color-bus-light)',
      'bus-d': 'var(--color-bus-dark)',
      transparent: 'transparent',
      error: 'var(--color-error)',
      'coat-of-arms': 'var(--color-coat-of-arms)',
      'coat-of-arms-l': 'var(--color-coat-of-arms-light)',
      'suomenlinna-d': 'var(--color-suomenlinna-dark)',
      suomenlinna: 'var(--color-suomenlinna)',
      silver: 'var(--color-silver)',
      'silver-l': 'var(--color-silver-light)',
    },
    extend: {},
  },
  plugins: [],
};
