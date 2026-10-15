import { isSectionStarted } from './projectProgrammeSections';
import { getMissingRequiredSections, hasAllRequiredFields } from './projectProgrammeSectionFields';

describe('hasAllRequiredFields', () => {
  it('requires the mode-specific basic info fields', () => {
    const basicInfo = {
      projectName: 'Project',
      district: { name: 'Keskinen' },
      projectProgrammeCompiler: 'Compiler',
      estimatedCosts: '100 000 EUR',
      summary: 'Summary',
    };

    expect(
      hasAllRequiredFields('basicInfo', {
        id: 'programme-1',
        briefProjectProgramme: true,
        basicInfo,
      }),
    ).toBe(true);
    expect(
      hasAllRequiredFields('basicInfo', {
        id: 'programme-1',
        briefProjectProgramme: false,
        basicInfo,
      }),
    ).toBe(false);
  });

  it('treats whitespace as missing and ignores optional fields', () => {
    expect(
      hasAllRequiredFields('designCriteria', {
        id: 'programme-1',
        designCriteria: {
          relationshipToPublicAreaServices: 'Services',
          siteValuesProtectionAndSignificance: 'Values',
        },
      }),
    ).toBe(true);
    expect(
      hasAllRequiredFields('maintenanceNeeds', {
        id: 'programme-1',
        maintenanceNeeds: { maintenanceNeeds: '  ' },
      }),
    ).toBe(false);
    expect(hasAllRequiredFields('maintenanceNeeds', { id: 'programme-1' })).toBe(false);
  });
});

describe('getMissingRequiredSections', () => {
  it.each([true, undefined])(
    'skips completed brief basic info but requires a location map for programme type %s',
    (programmeType) => {
      expect(
        getMissingRequiredSections({
          id: 'programme-1',
          briefProjectProgramme: programmeType,
          basicInfo: { status: 'COMPLETE', summary: '  ' },
        }),
      ).toEqual(['locationMap']);
    },
  );

  it('skips completed sections but reports missing sections and location map', () => {
    expect(
      getMissingRequiredSections({
        id: 'programme-1',
        briefProjectProgramme: false,
        basicInfo: { status: 'COMPLETE' },
        designCriteria: { status: 'COMPLETE' },
        maintenanceNeeds: { status: 'DRAFT', maintenanceNeeds: '  ' },
      }),
    ).toEqual([
      'trafficPlanningCriteria',
      'urbanSpacingPlanningCriteria',
      'maintenanceNeeds',
      'interactionAndRelatedProjects',
      'locationMap',
    ]);
  });

  it.each([true, false])(
    'accepts a location map for programme type %s',
    (briefProjectProgramme) => {
      expect(
        getMissingRequiredSections({
          id: 'programme-1',
          briefProjectProgramme,
          locationMap: { id: 'map-1', url: '/map.png', originalName: 'map.png' },
        }),
      ).not.toContain('locationMap');
    },
  );
});

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
