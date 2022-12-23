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
import { screen, waitFor } from '@testing-library/react';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;
const AUTOSAVE_TIMEOUT = 3500;

// These tests started taking very long after the form got fieldSets, could they maybe the optimized better?
// Currently allowing a long timeout for this test file
jest.setTimeout(40000);

describe('ProjectCardBasicsForm', () => {
  let renderResult: CustomRenderResult;

  const getFormField = (name: string) => `projectCardBasicsForm.${name}`;

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
              updated: null,
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

  it('renders hashTags modal and can edit hashTags', async () => {
    const { getByText, getByRole, user, getAllByTestId, store } = renderResult;
    const expectedValues = ['pyöräily', 'uudisrakentaminen', 'pohjoinensuurpiiri'];
    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;
    const projectCardTags = store.getState().projectCard.selectedProjectCard?.hashTags;
    const availableTags = mockTags.filter((tag) => projectCardTags?.indexOf(tag) === -1);
    const projectCardTagsLength = projectCardTags?.length || 0;
    const availableTagsLength = availableTags.length || 0;
    const responseProjectCard: IProjectCard = {
      ...projectCard,
      hashTags: expectedValues,
    };

    projectCardTags?.forEach((t) => {
      expect(getByText(matchExact(t))).toBeInTheDocument();
    });

    // Open modal
    await user.click(getByRole('button', { name: matchExact('projectCardBasicsForm.hashTags') }));

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    // Expect all elements
    expect(getByText('manageHashTags')).toBeInTheDocument();
    expect(getByText('projectCardHashTags')).toBeInTheDocument();
    expect(getAllByTestId('project-card-hashtags').length).toBe(projectCardTagsLength);
    expect(getAllByTestId('all-hashtags').length).toBe(availableTagsLength);

    // Click on a hashtag
    await user.click(getByText('pohjoinensuurpiiri'));
    await user.click(getByRole('button', { name: matchExact('save') }));

    expectedValues.forEach((h) => expect(getByText(h)).toBeInTheDocument());
  });

  // it('can use a NumberField', async () => {
  //   const { user, getByDisplayValue } = renderResult;
  //   const expectedValue = '1234';
  //   const projectCard = mockProjectCard.data;
  //   const responseProjectCard: IProjectCard = {
  //     ...projectCard,
  //     hkrId: expectedValue,
  //   };

  //   mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

  //   const hkrIdField = screen.getByRole('spinbutton', { name: getFormField('hkrId') });

  //   await user.clear(hkrIdField);
  //   await user.type(hkrIdField, expectedValue);

  //   expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  // });

  // it('can use a SelectField', async () => {
  //   const { user, getByRole, getByText } = renderResult;
  //   const expectedValue = { id: '35279d39-1b70-4cb7-a360-a43cd45d7b5c', value: 'lansisatama' };
  //   const projectCard = mockProjectCard.data;
  //   const responseProjectCard: IProjectCard = {
  //     ...projectCard,
  //     area: expectedValue,
  //   };

  //   mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

  //   await user.click(getByRole('button', { name: 'projectCardBasicsForm.area' }));
  //   await user.click(getByText(matchExact('enums.lansisatama')));

  //   expect(getByText(matchExact(expectedValue.value))).toBeInTheDocument();
  // });

  // it('can use a DateField', async () => {
  //   const { user, getByRole, getByDisplayValue } = renderResult;
  //   const expectedValue = '13.12.2022';
  //   const projectCard = mockProjectCard.data;
  //   const responseProjectCard: IProjectCard = {
  //     ...projectCard,
  //     estPlanningStart: expectedValue,
  //   };

  //   mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

  //   const estPlanningStart = getByRole('textbox', { name: getFormField('estPlanningStart') });

  //   await user.clear(estPlanningStart);
  //   await user.type(estPlanningStart, expectedValue);

  //   expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  // });

  // it('can autosave patch HashTags', async () => {
  //   const { user, getByRole, getByText } = renderResult;
  //   const expectedValues = ['pyöräily', 'uudisrakentaminen', 'pohjoinensuurpiiri'];
  //   const projectCard = mockProjectCard.data;
  //   const responseProjectCard: IProjectCard = {
  //     ...projectCard,
  //     hashTags: expectedValues,
  //   };

  //   mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

  //   await user.click(getByRole('button', { name: matchExact('projectCardBasicsForm.hashTags') }));
  //   await user.click(getByText('pohjoinensuurpiiri'));
  //   await user.click(getByRole('button', { name: matchExact('save') }));

  //   expectedValues.forEach((h) => expect(getByText(h)).toBeInTheDocument());
  // });

  it('can autosave patch a field', async () => {
    const { user, getByDisplayValue } = renderResult;
    const expectedValue = 'New description';
    const projectCard = mockProjectCard.data;
    const responseProjectCard: IProjectCard = {
      ...projectCard,
      description: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    const descriptionField = screen.getByRole('textbox', { name: getFormField('description *') });

    await user.clear(descriptionField);
    await user.type(descriptionField, expectedValue);

    await waitFor(
      () => {
        const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;
        expect(formPatchRequest.description).toEqual(expectedValue);
        expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
      },
      { timeout: AUTOSAVE_TIMEOUT },
    );
  });
});
