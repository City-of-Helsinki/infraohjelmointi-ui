/** This tailwind config files is modified to reflect the HDS standards */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
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
          // fontSize: 'var(--fontsize-heading-m)',
          fontWeight: '500',
          letterSpacing: '-0.2px',
          lineHeight: '32px',
        },
      ],
      'heading-xl': [
        'var(--fontsize-heading-xl)',
        {
          // fontSize: 'var(--fontsize-heading-m)',
          fontWeight: '400',
          letterSpacing: '-1.0px',
          lineHeight: 'var(--lineheight-s)',
        },
      ],
    },
    colors: {
      // Configure your color palette here
      fog: 'var(--color-fog)',
    },
    // heading: {
    //   m: {
    //     fontSize: '200px',
    //     fontWeight: '500',
    //     letterSpacing: '-0.2px',
    //     lineHeight: '32px',
    //   },
    // },
    lineHeight: {},
    extend: {},
  },
  plugins: [],
};
