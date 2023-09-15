import { Font } from '@react-pdf/renderer';

// Registering HelsinkiGrotesk fonts to react-pdf
Font.register({
  family: 'HelsinkiGrotesk',
  fonts: [
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/565d73a693abe0776c801607ac28f0bf.woff',
    },
    // 400
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/565d73a693abe0776c801607ac28f0bf.woff',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/5bb29e3b7b1d3ef30121229bbe67c3e1.woff',
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
    // 500
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/7c46f288e8133b87e6b12b45dac71865.woff',
      fontWeight: 500,
      fontStyle: 'normal',
    },
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/e62dc97e83a385e4d8cdc939cf1e4213.woff',
      fontWeight: 500,
      fontStyle: 'italic',
    },
    // 700
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/533af26cf28d7660f24c2884d3c27eac.woff',
      fontWeight: 700,
      fontStyle: 'normal',
    },
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/20d494430c87e15e194932b729d48270.woff',
      fontWeight: 700,
      fontStyle: 'italic',
    },
    // 900
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/a50a1bd245ce63abcc0d1da80ff790d2.woff',
      fontWeight: 900,
      fontStyle: 'normal',
    },
    {
      src: 'https://makasiini.hel.ninja/delivery/HelsinkiGrotesk/62a1781d8b396fbb025b0552cf6304d2.woff',
      fontWeight: 900,
      fontStyle: 'italic',
    },
  ],
});
