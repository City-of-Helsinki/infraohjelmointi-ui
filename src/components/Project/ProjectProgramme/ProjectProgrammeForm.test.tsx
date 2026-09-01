import mockI18next from '@/mocks/mockI18next';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectProgrammeForm, {
  pickChangedFormFields,
  pickChangedLinks,
} from './ProjectProgrammeForm';
import { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';

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
  basicInfo: {
    projectName: 'Initial project',
    district: 'Keskinen',
    projectProgrammeCompiler: 'Compiler Name',
    personsInvolved: 'Person A, Person B',
    estimatedCosts: '100 000 EUR',
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
  },
  designCriteria: {
    guidingZoningRegulations: 'Guiding zoning regulations',
    siteValuesProtectionAndSignificance: 'Site values protection and significance',
    relationshipToPublicAreaServices: 'Relationship to public area services',
    links: [{ value: 'https://old-design-link.fi' }],
  },
};

describe('ProjectProgrammeForm save logic', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockPatchProjectProgrammeSection.mockReset();
    mockPatchProjectProgrammeSection.mockResolvedValue({});
  });

  it('shows brief-only fields and requires inspector in brief programme mode', async () => {
    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="basicInfo"
              effectiveProjectProgramme={baseFormData}
              briefProgramme
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(
      screen.getByRole('textbox', { name: /projectProgrammeForm\.estimatedCosts/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /projectProgrammeForm\.inspector/ })).toBeRequired();
    expect(
      screen.queryByRole('textbox', { name: /projectProgrammeForm\.strategyGoals/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: /projectProgrammeForm\.projectSize/ }),
    ).not.toBeInTheDocument();
  });

  it('shows complete-only fields and does not require inspector in complete programme mode', async () => {
    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="basicInfo"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(
      screen.queryByRole('textbox', { name: /projectProgrammeForm\.estimatedCosts/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /projectProgrammeForm\.costClass/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /projectProgrammeForm\.inspector/ }),
    ).not.toBeRequired();
    [
      'strategyGoals',
      'projectSize',
      'risks',
      'studyAndPlanningNeeds',
      'planningAndImplementationFeasibility',
      'specialConsiderations',
      'otherConsiderations',
    ].forEach((fieldName) => {
      expect(
        screen.getByRole('textbox', { name: new RegExp(`projectProgrammeForm\\.${fieldName}`) }),
      ).toBeInTheDocument();
    });
  });

  it('maps only dirty basic info fields for save payload', () => {
    const payload = pickChangedFormFields(baseFormData, 'basicInfo', {
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
      'basicInfo',
      {
        ...baseFormData,
        basicInfo: {
          ...baseFormData.basicInfo,
          links: [{ value: '  https://one.fi  ' }, { value: '   ' }, { value: 'https://two.fi' }],
        },
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
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
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

  it('submits changed fields and links for design criteria section', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="designCriteria"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.change(screen.getByDisplayValue('Guiding zoning regulations'), {
      target: { value: 'Updated zoning regulations' },
    });
    fireEvent.change(screen.getByDisplayValue('https://old-design-link.fi'), {
      target: { value: '  https://new-design-link.fi  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPatchProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'design-criteria',
        data: {
          guidingZoningRegulations: 'Updated zoning regulations',
          links: ['https://new-design-link.fi'],
        },
      });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('renders saved design criteria values into the fields', async () => {
    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="designCriteria"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(
      screen.getByRole('textbox', { name: /projectProgrammeForm\.guidingZoningRegulations/ }),
    ).toHaveValue('Guiding zoning regulations');
    expect(
      screen.getByRole('textbox', {
        name: /projectProgrammeForm\.siteValuesProtectionAndSignificance/,
      }),
    ).toHaveValue('Site values protection and significance');
    expect(
      screen.getByRole('textbox', {
        name: /projectProgrammeForm\.relationshipToPublicAreaServices/,
      }),
    ).toHaveValue('Relationship to public area services');
    expect(screen.getByDisplayValue('https://old-design-link.fi')).toBeInTheDocument();
  });

  it('does not send anything and closes when nothing was changed', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="designCriteria"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    const saveButton = screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' });

    expect(saveButton).toBeDisabled();
    expect(mockPatchProjectProgrammeSection).not.toHaveBeenCalled();
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
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
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
