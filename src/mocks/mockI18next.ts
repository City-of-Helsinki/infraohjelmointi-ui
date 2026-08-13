import { ReactNode } from 'react';

const mockI18next = () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  Trans: ({ i18nKey, children }: { i18nKey?: string; children?: ReactNode }) =>
    children ?? i18nKey ?? null,
});

export default mockI18next;
