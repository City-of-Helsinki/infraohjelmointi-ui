import { TFunction } from 'i18next';
import { getProjectProgrammeSections, isSectionStarted } from './projectProgrammeSections';

describe('getProjectProgrammeSections', () => {
  const t = ((key: string) => key) as unknown as TFunction;
  const startedSections = {
    hasBasicInfo: false,
    hasDesignCriteria: false,
    hasTrafficPlanningCriteria: false,
    hasUrbanSpacingPlanningCriteria: false,
    hasMaintenanceNeeds: false,
    hasInteractionAndRelatedProjects: false,
    hasOtherAttachments: true,
  };

  it('adds other attachments as the last complete-programme-only section without card text', () => {
    const sections = getProjectProgrammeSections(t, false, startedSections);
    const otherAttachments = sections[sections.length - 1];

    expect(otherAttachments).toEqual({
      id: 'otherAttachments',
      label: 'projectProgrammeForm.otherAttachmentsCardTitle',
      cardText: '',
      actionText: 'projectProgrammeForm.fillOtherAttachments',
      showInBrief: false,
      sectionIsStarted: true,
    });
  });
});

describe('isSectionStarted', () => {
  it('returns true for a section with saved attachments', () => {
    expect(
      isSectionStarted({
        id: 'section-1',
        links: [],
        attachments: [{ id: 'attachment-1', originalName: 'plan.pdf' }],
      }),
    ).toBe(true);
  });

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
