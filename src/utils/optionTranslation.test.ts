import { createInstance } from 'i18next';
import fi from '@/i18n/fi.json';
import se from '@/i18n/se.json';
import { translateCategoryDescription, translateOption } from './optionTranslation';

describe.each(['fi', 'se'])('option translations in %s', (lng) => {
  const instance = createInstance();

  beforeAll(async () => {
    await instance.init({
      lng,
      fallbackLng: 'fi',
      resources: { fi: { translation: fi }, se: { translation: se } },
    });
    instance.addResource('fi', 'translation', 'option.Special:case', 'Colon translation');
  });

  it('uses existing translations, including Finnish language fallback', () => {
    expect(translateOption(instance.t, 'design')).toBe(fi.option.design);
    expect(translateOption(instance.t, 'K51')).toBe('K5.1');
    expect(translateOption(instance.t, 'K5.1')).toBe('K5.1');
    expect(translateOption(instance.t, 'Special:case')).toBe('Colon translation');
    expect(translateCategoryDescription(instance.t, 'K1')).toBe(fi.projectData.category.K1);
    expect(translateCategoryDescription(instance.t, 'K5.1')).toBe(fi.projectData.category.K51);
    expect(translateCategoryDescription(instance.t, 'K51')).toBe(fi.projectData.category.K51);
  });

  it.each([
    'New value',
    'Custom.category',
    'K.1',
    'S.tara',
    'option.newValue',
    'Unknown:category',
    'A {{name}} $t(option.design)',
  ])('preserves %s literally when no translation exists', (value) => {
    expect(translateOption(instance.t, value)).toBe(value);
    expect(translateCategoryDescription(instance.t, value)).toBe(value);
  });
});
