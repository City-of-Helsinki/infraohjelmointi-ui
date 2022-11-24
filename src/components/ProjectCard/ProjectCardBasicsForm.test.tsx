import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardBasicsForm from './ProjectCardBasicsForm';
import { getOptionsFromObject, matchExact } from '@/utils/common';
import { IProjectCard, ProjectType } from '@/interfaces/projectCardInterfaces';
import { useTranslation } from 'react-i18next';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardBasicsForm', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const { container } = renderWithProviders(<ProjectCardBasicsForm />, { store });

    expect(container.getElementsByClassName('basics-form').length).toBe(1);
  });

  it('renders all the project card form fields', () => {
    const formFields = ['hkrId', 'entityName', 'sapProject', 'description', 'type', 'area'];
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

  // FIXME: get data from inside the HDS-TextInput component
  it.skip('fills the fields with existing project card data', async () => {
    const { getByText } = renderWithProviders(<ProjectCardBasicsForm />, { store });
    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;

    expect(getByText(matchExact(projectCard?.description))).toBeInTheDocument();
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

    const { t } = useTranslation();
    const projectCard = store.getState().projectCard.selectedProjectCard;
    const typeOptions = getOptionsFromObject(ProjectType, t);
    const selectedOption = `enums.${projectCard?.type}`;
    const newOption = 'enums.traffic';

    expect(getByText(matchExact(selectedOption))).toBeInTheDocument();

    typeOptions.forEach((o) => {
      if (o.label !== selectedOption) {
        expect(queryByText(matchExact(o.label))).toBeNull();
      }
    });

    await user.click(getByRole('button', { name: 'projectCardBasicsForm.type *' }));

    typeOptions.forEach((o) => {
      if (o.label !== selectedOption) {
        expect(getByText(matchExact(o.label))).toBeInTheDocument();
      }
    });

    await user.click(getByText(matchExact(newOption)));

    expect(queryByText(matchExact(selectedOption))).toBeNull();
    expect(getByText(matchExact(newOption))).toBeInTheDocument();
  });
});
