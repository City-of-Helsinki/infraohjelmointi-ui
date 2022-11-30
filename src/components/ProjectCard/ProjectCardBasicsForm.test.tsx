import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardBasicsForm from './ProjectCardBasicsForm';
import { matchExact } from '@/utils/common';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { getProjectAreasThunk, getProjectTypesThunk } from '@/reducers/listsSlice';
import { mockProjectAreas, mockProjectTypes } from '@/mocks/mockLists';
import { mockTags } from '@/mocks/common';
import { waitFor } from '@testing-library/react';
import { debug } from 'console';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardBasicsForm', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));

    mockedAxios.get.mockResolvedValue(mockProjectTypes);
    await store.dispatch(getProjectTypesThunk());

    mockedAxios.get.mockResolvedValue(mockProjectAreas);
    await store.dispatch(getProjectAreasThunk());
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const { container } = renderWithProviders(<ProjectCardBasicsForm />, { store });

    expect(container.getElementsByClassName('basics-form').length).toBe(1);
  });

  it('renders all the project card form fields', () => {
    const formFields = [
      'hkrId',
      'entityName',
      'sapProject',
      'sapNetwork',
      'description',
      'type',
      'area',
    ];
    const { container, getByText, getByTestId } = renderWithProviders(<ProjectCardBasicsForm />, {
      store,
    });

    expect(container.getElementsByClassName('basic-info-form').length).toBe(1);
    expect(container.getElementsByClassName('input-wrapper').length).toBe(8);
    expect(getByText(matchExact('projectCardBasicsForm.basicInfoTitle'))).toBeInTheDocument();

    formFields.forEach((ff) => {
      expect(getByTestId(ff)).toBeInTheDocument();
    });
  });

  it('fills the fields with existing project card data', async () => {
    const { getByDisplayValue, getByText } = renderWithProviders(<ProjectCardBasicsForm />, {
      store,
    });
    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;

    expect(getByDisplayValue(matchExact(projectCard?.description))).toBeInTheDocument();
    expect(getByDisplayValue(matchExact(projectCard?.entityName))).toBeInTheDocument();
    expect(getByText(matchExact(projectCard?.area?.value || ''))).toBeInTheDocument();
    expect(getByText(matchExact(projectCard?.type.value || ''))).toBeInTheDocument();
    expect(getByDisplayValue(matchExact(projectCard?.hkrId))).toBeInTheDocument();

    expect(projectCard?.hashTags?.length).toBe(2);
    projectCard?.hashTags?.forEach((h) => {
      expect(getByText(matchExact(h))).toBeInTheDocument();
    });

    expect(projectCard?.sapProject.length).toBe(1);
    projectCard?.sapProject?.forEach((s) => {
      expect(getByDisplayValue(matchExact(s))).toBeInTheDocument();
    });
  });

  it('has all required fields as required', () => {
    const { getByText } = renderWithProviders(<ProjectCardBasicsForm />, { store });

    // Hack to check required for now... since HDS always adds the star to the input label
    expect(getByText(matchExact('projectCardBasicsForm.type *'))).toBeInTheDocument();
    expect(getByText(matchExact('projectCardBasicsForm.description *'))).toBeInTheDocument();
  });

  it('renders the chosen type and all type options when dropdown is clicked and can choose a new type', async () => {
    const { getByText, queryByText, user, getByRole } = renderWithProviders(
      <ProjectCardBasicsForm />,
      {
        store,
      },
    );

    const projectCard = store.getState().projectCard.selectedProjectCard;
    const options = store.getState().lists.type;
    const selectedOption = projectCard?.type?.value || '';
    const newOption = 'enums.traffic';

    expect(getByText(matchExact(selectedOption))).toBeInTheDocument();

    options.forEach((o) => {
      if (o.value !== selectedOption) {
        expect(queryByText(matchExact(o.value))).toBeNull();
      }
    });

    await user.click(getByRole('button', { name: 'projectCardBasicsForm.type *' }));

    options.forEach((o) => {
      if (o.value !== selectedOption) {
        expect(getByText(matchExact(o.value))).toBeInTheDocument();
      }
    });

    await user.click(getByText(matchExact(newOption)));

    expect(queryByText(matchExact(selectedOption))).toBeNull();
    expect(getByText(matchExact(newOption))).toBeInTheDocument();
  });

  it('renders the chosen area and all area options when dropdown is clicked and can choose a new area', async () => {
    const { getByText, queryByText, user, getByRole } = renderWithProviders(
      <ProjectCardBasicsForm />,
      {
        store,
      },
    );

    const projectCard = store.getState().projectCard.selectedProjectCard;
    const options = store.getState().lists.area;
    const selectedOption = projectCard?.area?.value || '';
    const newOption = 'enums.lansisatama';

    expect(getByText(matchExact(selectedOption))).toBeInTheDocument();

    options.forEach((o) => {
      if (o.value !== selectedOption) {
        expect(queryByText(matchExact(o.value))).toBeNull();
      }
    });

    await user.click(getByRole('button', { name: 'projectCardBasicsForm.area' }));

    options.forEach((o) => {
      if (o.value !== selectedOption) {
        expect(getByText(matchExact(o.value))).toBeInTheDocument();
      }
    });

    await user.click(getByText(matchExact(newOption)));

    expect(queryByText(matchExact(selectedOption))).toBeNull();
    expect(getByText(matchExact(newOption))).toBeInTheDocument();
  });

  it('renders chosen hashTags and can add or remove hasTags', async () => {
    const { getByText, getByRole, user, getAllByTestId, queryByText } = renderWithProviders(
      <ProjectCardBasicsForm />,
      {
        store,
      },
    );
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
    expect(getByText(matchExact('manageHashTags'))).toBeInTheDocument();
    expect(getByText(matchExact('projectCardHashTags'))).toBeInTheDocument();
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

  it('can send the basic form', async () => {
    const { getByText, getByRole, user, getByDisplayValue } = renderWithProviders(
      <ProjectCardBasicsForm />,
      {
        store,
      },
    );

    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;
    const availableTags = mockTags.filter((tag) => projectCard.hashTags?.indexOf(tag) === -1);

    const patchedProjectCard: IProjectCard = {
      ...projectCard,
      id: '79e6bc76-9fa2-49a1-aaad-b52330da170e',
      description: 'Desc',
      entityName: 'Ent',
      area: { id: '35279d39-1b70-4cb7-a360-a43cd45d7b5c', value: 'lansisatama' },
      type: { id: '434e8052-9f76-4c41-b450-d9eff680d503', value: 'sports' },
      hashTags: ['pyöräily', 'uudisrakentaminen', 'pohjoinensuurpiiri'],
    };

    await waitFor(async () => {
      // Add entity and description
      user.type(getByRole('textbox', { name: 'projectCardBasicsForm.description *' }), 'Desc');
      user.type(getByRole('textbox', { name: 'projectCardBasicsForm.entityName' }), 'Ent');

      // Select new area
      await user.click(getByRole('button', { name: 'projectCardBasicsForm.area' }));
      await user.click(getByText(matchExact('enums.lansisatama')));

      // Select new type
      await user.click(getByRole('button', { name: 'projectCardBasicsForm.type *' }));
      await user.click(getByText(matchExact('enums.sports')));

      // Add a tag
      await user.click(getByRole('button', { name: matchExact('projectCardBasicsForm.hashTags') }));
      await user.click(getByRole('link', { name: matchExact(availableTags[0]) }));
      await user.click(getByRole('button', { name: matchExact('closeHashTagsWindow') }));

      expect(getByDisplayValue(matchExact(patchedProjectCard?.description))).toBeInTheDocument();
      // expect(getByDisplayValue(matchExact(patchedProjectCard?.entityName))).toBeInTheDocument();

      // expect(patchedProjectCard?.hashTags?.length).toBe(3);
      // patchedProjectCard?.hashTags?.forEach((h) => {
      //   expect(getByText(matchExact(h))).toBeInTheDocument();
      // });
    });

    await waitFor(async () => {
      mockedAxios.get.mockResolvedValue(async () => await Promise.resolve(patchedProjectCard));
    });

    // await user.click(getByRole('button', { name: 'send' })).then();
  });
});
