import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectCardBasicsForm from './ProjectCardBasicsForm';
import { matchExact } from '@/utils/common';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import {
  mockConstructionPhaseDetails,
  mockConstructionPhases,
  mockPlanningPhases,
  mockProjectAreas,
  mockProjectCategories,
  mockProjectPhases,
  mockProjectQualityLevels,
  mockProjectRisks,
  mockProjectTypes,
} from '@/mocks/mockLists';
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

  const getFormField = (name: string) => `projectCardBasicsForm.${name}`;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<ProjectCardBasicsForm />, {
          preloadedState: {
            projectCard: {
              projectCards: [mockProjectCard.data as IProjectCard],
              selectedProjectCard: mockProjectCard.data as IProjectCard,
              notes: [],
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
              constructionPhaseDetail: mockConstructionPhaseDetails.data,
              category: mockProjectCategories.data,
              riskAssessment: mockProjectRisks.data,
              masterClass: [],
              class: [],
              subClass: [],
              projectQualityLevel: mockProjectQualityLevels.data,
              planningPhase: mockPlanningPhases.data,
              constructionPhase: mockConstructionPhases.data,
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
    const { getByDisplayValue, getByText, getByTestId } = renderResult;
    const projectCard = mockProjectCard.data;
    const euroFormat = (value: string) => `${value} €`;
    const expectDisplayValue = (value: string | undefined) =>
      expect(getByDisplayValue(matchExact(value || ''))).toBeInTheDocument();
    const expectOption = (option: string | undefined) =>
      expect(getByText(`enums.${option || ''}`)).toBeInTheDocument();
    const expectRadioBoolean = (testId: string, value: boolean) =>
      expect((getByTestId(testId) as HTMLInputElement).checked).toBe(value);

    expectOption(projectCard?.area?.value);
    expectOption(projectCard?.type?.value);
    expectOption(projectCard?.projectQualityLevel?.value);
    expectOption(projectCard?.planningPhase?.value);
    expectOption(projectCard?.constructionPhase?.value);
    expectOption(projectCard?.constructionPhaseDetail?.value);
    expectOption(projectCard?.category?.value);
    expectOption(projectCard?.riskAssessment?.value);
    expectRadioBoolean('programmed-0', true);
    expectRadioBoolean('louhi-0', false);
    expectRadioBoolean('gravel-0', false);
    expectRadioBoolean('effectHousing-0', false);
    expect(getByText(euroFormat(projectCard?.budget || ''))).toBeInTheDocument();
    expect(getByText(euroFormat(projectCard?.realizedCost || ''))).toBeInTheDocument();
    expect(getByText(euroFormat(projectCard?.comittedCost || ''))).toBeInTheDocument();
    expect(getByText(euroFormat(projectCard?.spentCost || ''))).toBeInTheDocument();
    expect(getByText('overrunRightValue' || '')).toBeInTheDocument();
    expect(getByText(`${projectCard?.budgetOverrunAmount} keur` || '')).toBeInTheDocument();
    expectDisplayValue(projectCard?.description);
    expectDisplayValue(projectCard?.entityName);
    expectDisplayValue(projectCard?.hkrId);
    expectDisplayValue(projectCard?.planningStartYear);
    expectDisplayValue(projectCard?.constructionEndYear);
    expectDisplayValue(projectCard?.estPlanningStart);
    expectDisplayValue(projectCard?.estPlanningEnd);
    expectDisplayValue(projectCard?.presenceStart);
    expectDisplayValue(projectCard?.presenceEnd);
    expectDisplayValue(projectCard?.visibilityStart);
    expectDisplayValue(projectCard?.visibilityEnd);
    expectDisplayValue(projectCard?.estConstructionStart);
    expectDisplayValue(projectCard?.estConstructionEnd);
    expectDisplayValue(projectCard?.projectWorkQuantity);
    expectDisplayValue(projectCard?.projectCostForecast);
    expectDisplayValue(projectCard?.planningCostForecast);
    expectDisplayValue(projectCard?.planningWorkQuantity);
    expectDisplayValue(projectCard?.constructionCostForecast);
    expectDisplayValue(projectCard?.constructionWorkQuantity);

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

  it('renders hashTags modal and can autosave patch hashTags', async () => {
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

  it('can autosave patch a NumberField', async () => {
    const { user, getByDisplayValue, container } = renderResult;
    const expectedValue = '1234';
    const projectCard = mockProjectCard.data;
    const responseProjectCard: IProjectCard = {
      ...projectCard,
      hkrId: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    const parentContainer = container.getElementsByClassName('basics-form')[0];

    const hkrIdField = screen.getByRole('spinbutton', { name: getFormField('hkrId') });

    await user.clear(hkrIdField);
    await user.type(hkrIdField, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;
    expect(formPatchRequest.hkrId).toEqual(expectedValue);
    expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a SelectField', async () => {
    const { user, getByRole, getByText, container } = renderResult;
    const expectedValue = { id: '35279d39-1b70-4cb7-a360-a43cd45d7b5c', value: 'lansisatama' };
    const projectCard = mockProjectCard.data;
    const responseProjectCard: IProjectCard = {
      ...projectCard,
      area: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    const parentContainer = container.getElementsByClassName('basics-form')[0];

    await user.click(getByRole('button', { name: 'projectCardBasicsForm.area' }));
    await user.click(getByText(matchExact('enums.lansisatama')));
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;
    expect(formPatchRequest.area).toEqual(expectedValue.id);
    expect(getByText(matchExact(expectedValue.value))).toBeInTheDocument();
  });

  it('can autosave patch a DateField', async () => {
    const { user, getByRole, getByDisplayValue, container } = renderResult;
    const expectedValue = '13.12.2022';
    const projectCard = mockProjectCard.data;
    const responseProjectCard: IProjectCard = {
      ...projectCard,
      estPlanningStart: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    const parentContainer = container.getElementsByClassName('basics-form')[0];
    const estPlanningStart = getByRole('textbox', { name: getFormField('estPlanningStart') });

    await user.clear(estPlanningStart);
    await user.type(estPlanningStart, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;
    expect(formPatchRequest.estPlanningStart).toEqual(expectedValue);
    expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a TextField', async () => {
    const { user, getByDisplayValue, container } = renderResult;
    const expectedValue = 'New description';
    const projectCard = mockProjectCard.data;
    const responseProjectCard: IProjectCard = {
      ...projectCard,
      description: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    const descriptionField = screen.getByRole('textbox', { name: getFormField('description *') });
    const parentContainer = container.getElementsByClassName('basics-form')[0];

    await user.clear(descriptionField);
    await user.type(descriptionField, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;
    expect(formPatchRequest.description).toEqual(expectedValue);
    expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a RadioCheckboxField', async () => {
    const { user, container, getByTestId } = renderResult;
    const expectedValue = true;
    const projectCard = mockProjectCard.data;
    const responseProjectCard: IProjectCard = {
      ...projectCard,
      louhi: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    const louhiField = getByTestId('louhi-0') as HTMLInputElement;
    const parentContainer = container.getElementsByClassName('basics-form')[0];

    await user.click(louhiField);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;
    expect(formPatchRequest.louhi).toEqual(expectedValue);
    expect(louhiField.checked).toBe(expectedValue);
  });
});
