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
    projectCard?.sapProject?.forEach((h) => {
      expect(getByDisplayValue(matchExact(h))).toBeInTheDocument();
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
    await user.click(getByRole('button', { name: matchExact('Tunnisteet') }));

    // Expect all elements
    expect(getByText(matchExact('Hakaniementori - Hallitse tunnisteita'))).toBeInTheDocument();
    expect(getByText(matchExact('Hankkeen tunnisteet'))).toBeInTheDocument();
    expect(getAllByTestId('project-card-tags').length).toBe(projectCardTagsLength);
    expect(getAllByTestId('all-tags').length).toBe(availableTagsLength);

    // TODO: Remove tag, how to access HDS-close button?

    // Add tag
    await user.click(getByRole('link', { name: matchExact(availableTags[0]) }));
    expect(getAllByTestId('project-card-tags').length).toBe(projectCardTagsLength + 1);

    // Close modal
    await user.click(getByRole('button', { name: matchExact('Sulje tunnisteikkuna') }));
    expect(queryByText(matchExact('Hakaniementori - Hallitse tunnisteita'))).toBeNull();
  });

  it('can send a the basic form', async () => {
    const { getByText, getByRole, user, getAllByTestId, queryByText } = renderWithProviders(
      <ProjectCardBasicsForm />,
      {
        store,
      },
    );

    const projectCardTags = store.getState().projectCard.selectedProjectCard?.hashTags;
    const availableTags = mockTags.filter((tag) => projectCardTags?.indexOf(tag) === -1);

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
    await user.click(getByRole('button', { name: matchExact('Tunnisteet') }));
    await user.click(getByRole('link', { name: matchExact(availableTags[0]) }));
    await user.click(getByRole('button', { name: matchExact('Sulje tunnisteikkuna') }));

    // TODO: Send form
    // await user.click(getByRole('button', { name: 'Lähetä' }));
  });
});
