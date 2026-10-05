import {
  EMPTY_PDF_VALUE,
  formatPdfValue,
  getPdfLinks,
  getProjectProgrammePdfFileName,
  isSafeHttpUrl,
} from './projectProgrammePdfUtils';
import { getFieldsForSection } from '../sections/projectProgrammeSectionFields';
import { BASIC_INFO_BRIEF_FIELDS, BASIC_INFO_FULL_FIELDS } from '../sections/BasicInfoSection';

describe('projectProgrammePdfUtils', () => {
  it('formats empty values as a dash', () => {
    expect(formatPdfValue(null)).toBe(EMPTY_PDF_VALUE);
    expect(formatPdfValue(undefined)).toBe(EMPTY_PDF_VALUE);
    expect(formatPdfValue('   ')).toBe(EMPTY_PDF_VALUE);
    expect(formatPdfValue({ name: null })).toBe(EMPTY_PDF_VALUE);
  });

  it('formats strings, numbers and named objects', () => {
    expect(formatPdfValue(' Keskinen ')).toBe('Keskinen');
    expect(formatPdfValue(12)).toBe('12');
    expect(formatPdfValue({ name: 'Kallio' })).toBe('Kallio');
  });

  it('returns only non-empty links', () => {
    expect(getPdfLinks([{ value: 'https://a.fi' }, { value: ' ' }, { value: '' }])).toEqual([
      'https://a.fi',
    ]);
    expect(getPdfLinks(null)).toEqual([]);
  });

  it('only treats http(s) urls as safe', () => {
    expect(isSafeHttpUrl('https://hel.fi')).toBe(true);
    expect(isSafeHttpUrl('http://hel.fi')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('hel.fi')).toBe(false);
  });

  it('builds a safe file name', () => {
    expect(getProjectProgrammePdfFileName('Hankeohjelma', 'Puisto / Kallio: 2', '2026-10-05')).toBe(
      'Hankeohjelma_Puisto_Kallio_2_2026-10-05.pdf',
    );
    expect(getProjectProgrammePdfFileName('Hankeohjelma', '', '2026-10-05')).toBe(
      'Hankeohjelma_2026-10-05.pdf',
    );
  });
});

describe('getFieldsForSection', () => {
  it('uses brief or full basic info fields depending on programme type', () => {
    expect(getFieldsForSection('basicInfo', { briefProjectProgramme: true })).toBe(
      BASIC_INFO_BRIEF_FIELDS,
    );
    expect(getFieldsForSection('basicInfo', undefined)).toBe(BASIC_INFO_BRIEF_FIELDS);
    expect(getFieldsForSection('basicInfo', { briefProjectProgramme: false })).toBe(
      BASIC_INFO_FULL_FIELDS,
    );
  });

  it('returns field names for other sections', () => {
    expect(getFieldsForSection('maintenanceNeeds')).toEqual(['maintenanceNeeds']);
  });
});
