import mockI18next from '@/mocks/mockI18next';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectProgrammeForm, {
  pickChangedBasicInfoFields,
  pickChangedLinks,
} from './ProjectProgrammeForm';
import { IProjectProgrammeForm } from '@/forms/useProjectProgrammeForm';

const mockDispatch = jest.fn();
const mockPatchProjectProgrammeSection = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/common', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/api/projectProgrammeApi', () => ({
  usePatchProjectProgrammeSectionMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPatchProjectProgrammeSection(...args) }),
  ],
}));

const baseFormData: IProjectProgrammeForm = {
  projectName: 'Initial project',
  district: 'Keskinen',
  projectProgrammeCompiler: 'Compiler Name',
  personsInvolved: 'Person A, Person B',
  inspector: 'Inspector Name',
  summary: 'Summary text',
  strategyGoals: 'Strategy goals',
  costClass: 'Cost class',
  projectSize: 'Large',
  risks: 'Risk text',
  studyAndPlanningNeeds: 'Study and planning needs',
  planningAndImplementationFeasibility: 'Feasibility text',
  specialConsiderations: 'Special considerations',
  otherConsiderations: 'Other considerations',
  links: [{ value: 'https://old-link.fi' }],
};

describe('ProjectProgrammeForm save logic', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockPatchProjectProgrammeSection.mockReset();
    mockPatchProjectProgrammeSection.mockResolvedValue({});
  });

  it('maps only dirty basic info fields for save payload', () => {
    const payload = pickChangedBasicInfoFields(baseFormData, {
      projectName: true,
      summary: true,
    });

    expect(payload).toEqual({
      projectName: 'Initial project',
      summary: 'Summary text',
    });
    expect(payload).not.toHaveProperty('district');
  });

  it('trims and filters empty links when links are dirty', () => {
    const links = pickChangedLinks(
      {
        ...baseFormData,
        links: [{ value: '  https://one.fi  ' }, { value: '   ' }, { value: 'https://two.fi' }],
      },
      { links: [{ value: true }] },
    );

    expect(links).toEqual(['https://one.fi', 'https://two.fi']);
  });

  it('submits changed fields and links for basic info section', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="basicInfo"
              basicInfo={baseFormData}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.change(screen.getByDisplayValue('Initial project'), {
      target: { value: 'Updated project name' },
    });
    fireEvent.change(screen.getByDisplayValue('https://old-link.fi'), {
      target: { value: '  https://new-link.fi  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPatchProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'basic-info',
        data: {
          projectName: 'Updated project name',
          links: ['https://new-link.fi'],
        },
      });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('dispatches form save error and keeps form open on failed submit', async () => {
    const onClose = jest.fn();
    mockPatchProjectProgrammeSection.mockRejectedValue({ status: 400 });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="basicInfo"
              basicInfo={baseFormData}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.change(screen.getByDisplayValue('Initial project'), {
      target: { value: 'Updated project name' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ message: 'formSaveError' }),
        }),
      );
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
