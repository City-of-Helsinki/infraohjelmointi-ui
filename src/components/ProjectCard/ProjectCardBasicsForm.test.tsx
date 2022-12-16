import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectCardBasicsForm from './ProjectCardBasicsForm';
import { matchExact } from '@/utils/common';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { mockProjectAreas, mockProjectPhases, mockProjectTypes } from '@/mocks/mockLists';
import { mockTags } from '@/mocks/common';
import { act } from 'react-dom/test-utils';
import mockUser from '@/mocks/mockUser';
import { screen } from '@testing-library/react';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

// These tests started taking very long after the form got fieldSets, could they maybe the optimized better?
// Currently allowing a long timeout for this test file
jest.setTimeout(40000);

describe('ProjectCardBasicsForm', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<ProjectCardBasicsForm />, {
          preloadedState: {
            projectCard: {
              projectCards: [mockProjectCard.data as IProjectCard],
              selectedProjectCard: mockProjectCard.data as IProjectCard,
              count: 1,
              error: {},
              page: 1,
            },
            auth: { user: mockUser, error: {} },
            lists: {
              area: mockProjectAreas.data,
              phase: mockProjectPhases.data,
              type: mockProjectTypes.data,
              error: {},
            },
          },
        })),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const { container } = renderResult;

    expect(container.getElementsByClassName('basics-form').length).toBe(1);
  });

  it('fills the fields with existing project card data', async () => {
    const { getByDisplayValue, getByText } = renderResult;
    const projectCard = mockProjectCard.data;

    const expectDisplayValue = (value: string) =>
      expect(getByDisplayValue(matchExact(value))).toBeInTheDocument();

    expect(getByText(`enums.${projectCard?.area?.value}`)).toBeInTheDocument();
    expect(getByText(`enums.${projectCard?.type?.value}`)).toBeInTheDocument();

    expectDisplayValue(projectCard?.description);
    expectDisplayValue(projectCard?.entityName);
    expectDisplayValue(projectCard?.hkrId);
    expectDisplayValue(projectCard?.estPlanningStart || '');
    expectDisplayValue(projectCard?.estPlanningEnd || '');
    expectDisplayValue(projectCard?.presenceStart || '');
    expectDisplayValue(projectCard?.presenceEnd || '');
    expectDisplayValue(projectCard?.visibilityStart || '');
    expectDisplayValue(projectCard?.visibilityEnd || '');
    expectDisplayValue(projectCard?.estConstructionStart || '');
    expectDisplayValue(projectCard?.estConstructionEnd || '');

    expect(projectCard?.hashTags?.length).toBe(2);
    projectCard?.hashTags?.forEach((h) => {
      expect(getByText(matchExact(h))).toBeInTheDocument();
    });
  });

  it('has all required fields as required', () => {
    const { getByText } = renderResult;

    // Hack to check required for now... since HDS always adds the star to the input label
    expect(getByText('projectCardBasicsForm.type')).toBeInTheDocument();
    expect(getByText('projectCardBasicsForm.description')).toBeInTheDocument();
  });

  it('renders chosen hashTags and can add or remove hasTags', async () => {
    const { getByText, getByRole, user, getAllByTestId, queryByText, store } = renderResult;
    const projectCardTags = store.getState().projectCard.selectedProjectCard?.hashTags;
    const availableTags = mockTags.filter((tag) => projectCardTags?.indexOf(tag) === -1);

    const projectCardTagsLength = projectCardTags?.length || 0;
    const availableTagsLength = availableTags.length || 0;

    projectCardTags?.forEach((t) => {
      expect(getByText(matchExact(t))).toBeInTheDocument();
    });

    // Open modal
    await user.click(getByRole('button', { name: matchExact('hashTags') }));

    // Expect all elements
    expect(getByText('manageHashTags')).toBeInTheDocument();
    expect(getByText('projectCardHashTags')).toBeInTheDocument();
    expect(getAllByTestId('project-card-hashtags').length).toBe(projectCardTagsLength);
    expect(getAllByTestId('all-hashtags').length).toBe(availableTagsLength);

    // TODO: Remove tag, how to access HDS-close button?

    // Add tag
    await user.click(getByRole('link', { name: matchExact(availableTags[0]) }));
    expect(getAllByTestId('project-card-hashtags').length).toBe(projectCardTagsLength + 1);

    // Close modal
    await user.click(getByRole('button', { name: matchExact('closeHashTagsWindow') }));
    expect(queryByText(matchExact('manageHashTags'))).toBeNull();
  });

  it('can patch an existing project card and recieve the updates', async () => {
    const { getByRole, user, getByText, getByDisplayValue } = renderResult;

    const projectCard = mockProjectCard.data;
    const responseProjectCard: IProjectCard = {
      ...projectCard,
      id: '79e6bc76-9fa2-49a1-aaad-b52330da170e',
      description: 'New description',
      entityName: 'New entity name',
      area: { id: '35279d39-1b70-4cb7-a360-a43cd45d7b5c', value: 'lansisatama' },
      type: { id: '434e8052-9f76-4c41-b450-d9eff680d503', value: 'sports' },
      hashTags: ['pyöräily', 'uudisrakentaminen', 'pohjoinensuurpiiri'],
      sapProject: '1T23',
      hkrId: '2222',
      estPlanningStart: '13.12.2022',
      estPlanningEnd: '14.12.2022',
      presenceStart: '15.12.2022',
      presenceEnd: '16.12.2022',
      visibilityStart: '17.12.2022',
      visibilityEnd: '18.12.2022',
      estConstructionStart: '19.12.2022',
      estConstructionEnd: '20.12.2022',
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    const formField = (name: string) => `projectCardBasicsForm.${name}`;

    const descriptionField = screen.getByRole('textbox', { name: formField('description *') });
    const entityNameField = screen.getByRole('textbox', { name: formField('entityName') });
    const hkrId = screen.getByRole('spinbutton', { name: formField('hkrId') });
    const sapProject = screen.getByRole('textbox', { name: formField('sapProject') });
    const estPlanningStart = getByRole('textbox', { name: formField('estPlanningStart') });
    const estPlanningEnd = getByRole('textbox', { name: formField('estPlanningEnd') });
    const presenceStart = getByRole('textbox', { name: formField('presenceStart') });
    const presenceEnd = getByRole('textbox', { name: formField('presenceEnd') });
    const visibilityStart = getByRole('textbox', { name: formField('visibilityStart') });
    const visibilityEnd = getByRole('textbox', { name: formField('visibilityEnd') });
    const estConstructionStart = getByRole('textbox', { name: formField('estConstructionStart') });
    const estConstructionEnd = getByRole('textbox', { name: formField('estConstructionEnd') });

    const clearAndType = async (field: HTMLElement, value: string) => {
      await user.clear(field);
      await user.type(field, value);
    };

    // Fill in the form
    await clearAndType(descriptionField, 'New description');
    await clearAndType(entityNameField, 'New entity name');
    await clearAndType(hkrId, '2222');
    await clearAndType(sapProject, '1T23');

    await user.click(getByRole('button', { name: 'projectCardBasicsForm.area' }));
    await user.click(getByText(matchExact('enums.lansisatama')));

    await user.click(getByRole('button', { name: 'projectCardBasicsForm.type *' }));
    await user.click(getByText(matchExact('enums.sports')));

    await user.click(getByRole('button', { name: matchExact('projectCardBasicsForm.hashTags') }));
    await user.click(getByText('pohjoinensuurpiiri'));
    await user.click(getByRole('button', { name: matchExact('save') }));

    await clearAndType(estPlanningStart, '13.12.2022');
    await clearAndType(estPlanningEnd, '14.12.2022');
    await clearAndType(presenceStart, '15.12.2022');
    await clearAndType(presenceEnd, '16.12.2022');
    await clearAndType(visibilityStart, '17.12.2022');
    await clearAndType(visibilityEnd, '18.12.2022');
    await clearAndType(estConstructionStart, '19.12.2022');
    await clearAndType(estConstructionEnd, '20.12.2022');

    // Click the send button
    await user.click(getByRole('button', { name: 'Tallenna perustiedot' }));

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;

    // Check axios values
    expect(formPatchRequest.description).toEqual(responseProjectCard.description);
    expect(formPatchRequest.entityName).toEqual(responseProjectCard.entityName);
    expect(formPatchRequest.hashTags?.length).toBe(responseProjectCard.hashTags?.length);
    expect(formPatchRequest.estPlanningStart).toEqual(responseProjectCard.estPlanningStart);
    expect(formPatchRequest.estPlanningEnd).toEqual(responseProjectCard.estPlanningEnd);
    expect(formPatchRequest.presenceStart).toEqual(responseProjectCard.presenceStart);
    expect(formPatchRequest.presenceEnd).toEqual(responseProjectCard.presenceEnd);
    expect(formPatchRequest.visibilityStart).toEqual(responseProjectCard.visibilityStart);
    expect(formPatchRequest.visibilityEnd).toEqual(responseProjectCard.visibilityEnd);
    expect(formPatchRequest.estConstructionStart).toEqual(responseProjectCard.estConstructionStart);
    expect(formPatchRequest.estConstructionEnd).toEqual(responseProjectCard.estConstructionEnd);

    const expectDisplayValue = (value: string) =>
      expect(getByDisplayValue(matchExact(value))).toBeInTheDocument();

    // Check that the form values stay updated with the state
    expect(getByText(matchExact(responseProjectCard?.area?.value || ''))).toBeInTheDocument();
    expect(getByText(matchExact(responseProjectCard?.type.value || ''))).toBeInTheDocument();
    responseProjectCard.hashTags?.forEach((h) => expect(getByText(h)).toBeInTheDocument());
    expectDisplayValue(responseProjectCard?.description);
    expectDisplayValue(responseProjectCard?.entityName);
    expectDisplayValue(responseProjectCard?.sapProject || '');
    expectDisplayValue(responseProjectCard?.hkrId || '');
    expectDisplayValue(responseProjectCard?.sapProject || '');
    expectDisplayValue(responseProjectCard?.estPlanningStart || '');
    expectDisplayValue(responseProjectCard?.estPlanningEnd || '');
    expectDisplayValue(responseProjectCard?.presenceStart || '');
    expectDisplayValue(responseProjectCard?.presenceEnd || '');
    expectDisplayValue(responseProjectCard?.visibilityStart || '');
    expectDisplayValue(responseProjectCard?.visibilityEnd || '');
    expectDisplayValue(responseProjectCard?.estConstructionStart || '');
    expectDisplayValue(responseProjectCard?.estConstructionEnd || '');
  });
});
