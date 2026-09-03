import { isSectionStarted } from './projectProgrammeSections';

describe('isSectionStarted', () => {
  it('returns false for empty nested section data and API metadata', () => {
    expect(
      isSectionStarted({
        id: 'section-1',
        projectProgramme: 'programme-1',
        createdDate: '2026-09-02T08:00:00Z',
        textField: '   ',
        optionalField: null,
        links: [{ id: 'link-1', contentType: 1, objectId: 'section-1', value: '' }],
        nestedFields: [{ value: undefined }],
      }),
    ).toBe(false);
  });

  it('returns true for meaningful data in an arbitrary nested section field', () => {
    expect(
      isSectionStarted({
        futureSectionField: {
          values: [{ value: '' }, { value: 'Entered information' }],
        },
      }),
    ).toBe(true);
  });
});
