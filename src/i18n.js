import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';

import translationFI from './i18n/fi.json';
import translationSE from './i18n/se.json';

const resources = {
  fi: {
    translation: translationFI,
  },
  se: {
    translation: translationSE,
  },
};

i18n
  // load translation using http
  .use(Backend)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    fallbackLng: 'fi',
    resources: resources,
    debug: true,
  });

export default i18n;
