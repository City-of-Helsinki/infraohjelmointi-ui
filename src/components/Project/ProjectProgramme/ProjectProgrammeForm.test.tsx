import mockI18next from '@/mocks/mockI18next';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectProgrammeForm, {
  pickChangedFormFields,
  pickChangedLinks,
} from './ProjectProgrammeForm';
import { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';

const mockDispatch = jest.fn();
const mockPostProjectProgrammeSection = jest.fn();
const mockPatchProjectProgrammeSection = jest.fn();
const mockTransitionProjectProgrammeSectionStatus = jest.fn();
const mockTransitionProjectProgrammeStatus = jest.fn();
const mockPostProjectProgrammeAttachments = jest.fn();
const mockDeleteProjectProgrammeAttachment = jest.fn();
const mockGetProjectProgrammeAttachmentBlob = jest.fn();
const mockIsConfirmed = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/useConfirmDialog', () => ({
  __esModule: true,
  default: () => ({ isConfirmed: mockIsConfirmed }),
}));

jest.mock('@/hooks/common', () => ({
  ...jest.requireActual('@/hooks/common'),
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/api/projectProgrammeApi', () => ({
  usePostProjectProgrammeSectionMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPostProjectProgrammeSection(...args) }),
  ],
  usePatchProjectProgrammeSectionMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPatchProjectProgrammeSection(...args) }),
  ],
  useTransitionProjectProgrammeSectionStatusMutation: () => [
    (...args: unknown[]) => ({
      unwrap: () => mockTransitionProjectProgrammeSectionStatus(...args),
    }),
  ],
  useTransitionProjectProgrammeStatusMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockTransitionProjectProgrammeStatus(...args) }),
  ],
  usePostProjectProgrammeAttachmentsMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPostProjectProgrammeAttachments(...args) }),
  ],
  useDeleteProjectProgrammeAttachmentMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockDeleteProjectProgrammeAttachment(...args) }),
  ],
  getProjectProgrammeAttachmentBlob: (...args: unknown[]) =>
    mockGetProjectProgrammeAttachmentBlob(...args),
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
  trafficPlanningCriteria: {
    targetTrafficChanges: 'Target traffic changes info',
    pedestrianTraffic: 'Pedestrian traffic info',
    bicycleTraffic: 'Bicycle traffic info',
    carTraffic: 'Car traffic info',
    accessibility: 'Accessibility info',
    links: [{ value: 'https://old-traffic-link.fi' }],
  },
  urbanSpacingPlanningCriteria: {
    targetUrbanAppearance: 'Urban appearance info',
    lighting: 'Lighting info',
    greenery: 'Greenery info',
    links: [{ value: 'https://old-urban-link.fi' }],
  },
  maintenanceNeeds: {
    maintenanceNeeds: 'Regular maintenance required',
    links: [{ value: 'https://old-maintenance-link.fi' }],
  },
  interactionAndRelatedProjects: {
    collaborationAndExperts: 'Collaboration with experts',
    interactionNotes: 'Interaction notes',
    links: [{ value: 'https://old-interaction-link.fi' }],
  },
};

describe('ProjectProgrammeForm save logic', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockPostProjectProgrammeSection.mockReset();
    mockPatchProjectProgrammeSection.mockReset();
    mockTransitionProjectProgrammeSectionStatus.mockReset();
    mockTransitionProjectProgrammeStatus.mockReset();
    mockPostProjectProgrammeSection.mockResolvedValue({});
    mockPatchProjectProgrammeSection.mockResolvedValue({});
    mockTransitionProjectProgrammeSectionStatus.mockResolvedValue({});
    mockTransitionProjectProgrammeStatus.mockResolvedValue({});
  });

  it('saves changed section fields before marking the section ready', async () => {
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
              isProjectProgrammeComplete={false}
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
    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.markSectionReady' }));

    await waitFor(() => {
      expect(mockPatchProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'basic-info',
        data: { projectName: 'Updated project name' },
      });
      expect(mockTransitionProjectProgrammeSectionStatus).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'basic-info',
        to: 'COMPLETE',
      });
    });
    expect(mockPatchProjectProgrammeSection.mock.invocationCallOrder[0]).toBeLessThan(
      mockTransitionProjectProgrammeSectionStatus.mock.invocationCallOrder[0],
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('marks an unchanged existing section ready without patching it', async () => {
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
              isProjectProgrammeComplete={false}
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.markSectionReady' }));

    await waitFor(() => {
      expect(mockTransitionProjectProgrammeSectionStatus).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'design-criteria',
        to: 'COMPLETE',
      });
    });
    expect(mockPatchProjectProgrammeSection).not.toHaveBeenCalled();
  });

  it('does not mark a section ready when required fields are missing', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="designCriteria"
              effectiveProjectProgramme={{ basicInfo: baseFormData.basicInfo }}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.markSectionReady' }));

    await waitFor(() => {
      expect(mockTransitionProjectProgrammeSectionStatus).not.toHaveBeenCalled();
      expect(mockPostProjectProgrammeSection).not.toHaveBeenCalled();
      expect(mockPatchProjectProgrammeSection).not.toHaveBeenCalled();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps a completed section read-only without a return-to-draft action', async () => {
    const completedFormData: IProjectProgrammeForm = {
      ...baseFormData,
      maintenanceNeeds: {
        ...baseFormData.maintenanceNeeds,
        status: 'COMPLETE',
      },
    };

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="maintenanceNeeds"
              effectiveProjectProgramme={completedFormData}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(screen.getByDisplayValue('Regular maintenance required')).toBeDisabled();
    expect(screen.getByText('projectProgrammeForm.completeStatus')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.returnSectionToDraft' }),
    ).toBeNull();
    expect(mockTransitionProjectProgrammeSectionStatus).not.toHaveBeenCalled();
    expect(mockTransitionProjectProgrammeStatus).not.toHaveBeenCalled();
  });

  it('keeps sections locked while the programme is complete', async () => {
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
              isProjectProgrammeComplete
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(screen.getByDisplayValue('Guiding zoning regulations')).toBeDisabled();
    expect(screen.getByText('projectProgrammeForm.draftStatus')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projectProgrammeForm.returnToDraft' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.markSectionReady' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'projectProgrammeForm.saveDraft' })).toBeNull();
    expect(mockTransitionProjectProgrammeStatus).not.toHaveBeenCalled();
    expect(mockTransitionProjectProgrammeSectionStatus).not.toHaveBeenCalled();
  });

  it('shows brief-only fields and does not require inspector in brief programme mode', async () => {
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
              isProjectProgrammeComplete={false}
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
    expect(
      screen.getByRole('textbox', { name: /projectProgrammeForm\.inspector/ }),
    ).not.toBeRequired();
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
              isProjectProgrammeComplete={false}
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
              isProjectProgrammeComplete={false}
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

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
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
              isProjectProgrammeComplete={false}
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

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('creates a missing section when the user submits its first changes', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="designCriteria"
              effectiveProjectProgramme={{ basicInfo: baseFormData.basicInfo }}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.change(
      screen.getByRole('textbox', {
        name: /projectProgrammeForm\.guidingZoningRegulations/,
      }),
      { target: { value: 'New zoning regulations' } },
    );
    fireEvent.change(
      screen.getByRole('textbox', {
        name: /projectProgrammeForm\.relationshipToPublicAreaServices/,
      }),
      { target: { value: 'New public area relationship' } },
    );
    fireEvent.change(
      screen.getByRole('textbox', {
        name: /projectProgrammeForm\.siteValuesProtectionAndSignificance/,
      }),
      { target: { value: 'New site values' } },
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPostProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'design-criteria',
        data: {
          guidingZoningRegulations: 'New zoning regulations',
          relationshipToPublicAreaServices: 'New public area relationship',
          siteValuesProtectionAndSignificance: 'New site values',
        },
      });
    });
    expect(mockPatchProjectProgrammeSection).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('creates traffic planning criteria from all required user-entered fields', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="trafficPlanningCriteria"
              effectiveProjectProgramme={{ basicInfo: baseFormData.basicInfo }}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    const trafficCriteria = {
      targetTrafficChanges: 'Target traffic changes plan',
      pedestrianTraffic: 'Pedestrian plan',
      bicycleTraffic: 'Bicycle plan',
      carTraffic: 'Car traffic plan',
      serviceAndPickupTraffic: 'Service traffic plan',
      otherTraffic: 'Other traffic plan',
      accessibility: 'Accessibility plan',
      noiseManagement: 'Noise plan',
      winterMaintenance: 'Winter plan',
    };

    Object.entries(trafficCriteria).forEach(([field, value]) => {
      fireEvent.change(
        screen.getByRole('textbox', { name: new RegExp(`projectProgrammeForm\\.${field}`) }),
        { target: { value } },
      );
    });
    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPostProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'traffic-planning-criteria',
        data: trafficCriteria,
      });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('creates urban spacing planning criteria from all required user-entered fields', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="urbanSpacingPlanningCriteria"
              effectiveProjectProgramme={{ basicInfo: baseFormData.basicInfo }}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    const urbanSpacingCriteria = {
      targetUrbanAppearance: 'Target appearance',
      surfaceMaterials: 'Surface materials',
      structures: 'Structures',
      technicalNetworksAndSystems: 'Technical networks',
      lighting: 'Lighting plan',
      greenery: 'Greenery plan',
      lumoConsiderationAndProtection: 'LUMO plan',
      natureTypes: 'Nature types',
      equipmentAndFurnishings: 'Equipment plan',
      waters: 'Waters plan',
      stormwaterManagement: 'Stormwater plan',
    };

    Object.entries(urbanSpacingCriteria).forEach(([field, value]) => {
      fireEvent.change(
        screen.getByRole('textbox', { name: new RegExp(`projectProgrammeForm\\.${field}`) }),
        { target: { value } },
      );
    });
    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPostProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'urban-spacing-planning-criteria',
        data: urbanSpacingCriteria,
      });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
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
              isProjectProgrammeComplete={false}
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
              isProjectProgrammeComplete={false}
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

  it('saves a draft with required fields missing and trims whitespace-only dirty values', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="designCriteria"
              effectiveProjectProgramme={{ basicInfo: baseFormData.basicInfo }}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    const zoningField = screen.getByRole('textbox', {
      name: /projectProgrammeForm\.guidingZoningRegulations/,
    });
    fireEvent.change(zoningField, { target: { value: '   ' } });

    expect(zoningField).toHaveValue('   ');
    const saveButton = screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' });
    expect(saveButton).toBeEnabled();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPostProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'design-criteria',
        data: {
          guidingZoningRegulations: '',
        },
      });
    });
    expect(mockPatchProjectProgrammeSection).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
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
              isProjectProgrammeComplete={false}
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

  it('submits changed fields and links for maintenance needs section', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="maintenanceNeeds"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.change(screen.getByDisplayValue('Regular maintenance required'), {
      target: { value: 'Updated maintenance needs' },
    });
    fireEvent.change(screen.getByDisplayValue('https://old-maintenance-link.fi'), {
      target: { value: '  https://new-maintenance-link.fi  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPatchProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'maintenance-needs',
        data: {
          maintenanceNeeds: 'Updated maintenance needs',
          links: ['https://new-maintenance-link.fi'],
        },
      });
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('submits changed fields and links for interaction and related projects section', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="interactionAndRelatedProjects"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.change(screen.getByDisplayValue('Collaboration with experts'), {
      target: { value: 'Updated collaboration info' },
    });
    fireEvent.change(screen.getByDisplayValue('https://old-interaction-link.fi'), {
      target: { value: '  https://new-interaction-link.fi  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPatchProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'interaction-and-related-projects',
        data: {
          collaborationAndExperts: 'Updated collaboration info',
          links: ['https://new-interaction-link.fi'],
        },
      });
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('creates maintenance needs section from user-entered fields', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="maintenanceNeeds"
              effectiveProjectProgramme={{ basicInfo: baseFormData.basicInfo }}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.change(
      screen.getByRole('textbox', {
        name: /projectProgrammeForm\.maintenanceNeeds/,
      }),
      { target: { value: 'New maintenance needs' } },
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPostProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'maintenance-needs',
        data: {
          maintenanceNeeds: 'New maintenance needs',
        },
      });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('creates interaction and related projects section from user-entered fields', async () => {
    const onClose = jest.fn();

    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="interactionAndRelatedProjects"
              effectiveProjectProgramme={{ basicInfo: baseFormData.basicInfo }}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    fireEvent.change(
      screen.getByRole('textbox', {
        name: /projectProgrammeForm\.collaborationAndExperts/,
      }),
      { target: { value: 'New collaboration' } },
    );
    fireEvent.change(
      screen.getByRole('textbox', {
        name: /projectProgrammeForm\.interactionNotes/,
      }),
      { target: { value: 'New interaction notes' } },
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => {
      expect(mockPostProjectProgrammeSection).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'interaction-and-related-projects',
        data: {
          collaborationAndExperts: 'New collaboration',
          interactionNotes: 'New interaction notes',
        },
      });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders saved traffic planning criteria values into the fields', async () => {
    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="trafficPlanningCriteria"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(screen.getByDisplayValue('Pedestrian traffic info')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bicycle traffic info')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Accessibility info')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://old-traffic-link.fi')).toBeInTheDocument();
  });

  it('renders saved urban spacing planning criteria values into the fields', async () => {
    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="urbanSpacingPlanningCriteria"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(screen.getByDisplayValue('Urban appearance info')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lighting info')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Greenery info')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://old-urban-link.fi')).toBeInTheDocument();
  });

  it('renders saved maintenance needs values into the fields', async () => {
    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="maintenanceNeeds"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(screen.getByDisplayValue('Regular maintenance required')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://old-maintenance-link.fi')).toBeInTheDocument();
  });

  it('renders saved interaction and related projects values into the fields', async () => {
    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="interactionAndRelatedProjects"
              effectiveProjectProgramme={baseFormData}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={jest.fn()}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

    expect(screen.getByDisplayValue('Collaboration with experts')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Interaction notes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://old-interaction-link.fi')).toBeInTheDocument();
  });
});

describe('ProjectProgrammeForm other attachments', () => {
  const savedAttachment = {
    id: 'attachment-1',
    originalName: 'site-plan.pdf',
    contentType: 'application/pdf',
    size: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostProjectProgrammeSection.mockResolvedValue({});
    mockPatchProjectProgrammeSection.mockResolvedValue({});
    mockTransitionProjectProgrammeSectionStatus.mockResolvedValue({});
    mockPostProjectProgrammeAttachments.mockResolvedValue([]);
    mockDeleteProjectProgrammeAttachment.mockResolvedValue(undefined);
    mockIsConfirmed.mockResolvedValue(true);
    global.URL.createObjectURL = jest.fn(() => 'blob:preview');
    global.URL.revokeObjectURL = jest.fn();
  });

  async function renderOtherAttachmentsForm(
    effectiveProjectProgramme: IProjectProgrammeForm,
    onClose = jest.fn(),
  ) {
    const user = userEvent.setup();
    await act(async () =>
      renderWithProviders(
        <Route
          path="/project/project-1/project-programme"
          element={
            <ProjectProgrammeForm
              projectProgrammeId="programme-1"
              activeSection="otherAttachments"
              effectiveProjectProgramme={effectiveProjectProgramme}
              briefProgramme={false}
              isProjectProgrammeComplete={false}
              onClose={onClose}
            />
          }
        />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );
    return user;
  }

  async function uploadFile(
    user: ReturnType<typeof userEvent.setup>,
    fileName = 'map.png',
    type = 'image/png',
  ) {
    const fileInput = screen.getByLabelText('projectProgrammeForm.otherAttachmentsDragAndDrop');
    await user.upload(fileInput, new File(['content'], fileName, { type }));
  }

  it.each([
    ['plan.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['plan.doc', 'application/msword'],
    ['plan.pdf', 'application/pdf'],
    ['photo.jpeg', 'image/jpeg'],
  ])('accepts and uploads %s', async (fileName, type) => {
    const user = await renderOtherAttachmentsForm({ otherAttachments: { links: [] } });

    await uploadFile(user, fileName, type);
    await user.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => expect(mockPostProjectProgrammeAttachments).toHaveBeenCalledTimes(1));
    const { formData } = mockPostProjectProgrammeAttachments.mock.calls[0][0] as {
      formData: FormData;
    };
    expect((formData.get('file') as File).name).toBe(fileName);
  });

  it('shows a download link instead of a preview for Word files', async () => {
    mockGetProjectProgrammeAttachmentBlob.mockResolvedValue(new Blob(['doc']));
    const user = await renderOtherAttachmentsForm({
      otherAttachments: {
        attachments: [
          {
            id: 'attachment-2',
            originalName: 'plan.docx',
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
        ],
        links: [],
      },
    });

    await user.click(
      screen.getByRole('button', { name: 'projectProgrammeForm.showAttachmentAriaLabel' }),
    );

    expect(
      await screen.findByText('projectProgrammeForm.attachmentPreviewNotSupported'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'projectProgrammeForm.downloadAttachment' }),
    ).toHaveAttribute('download', 'plan.docx');
  });

  it('renders the section content', async () => {
    await renderOtherAttachmentsForm({});

    expect(screen.getByTestId('project-programme-other-attachments-form')).toBeInTheDocument();
    expect(screen.getByText('projectProgrammeForm.requiredSectionHelperText')).toBeInTheDocument();
    expect(screen.getByText('projectProgrammeForm.otherAttachmentsInfoTitle')).toBeInTheDocument();
    expect(screen.getByText('projectProgrammeForm.links')).toBeInTheDocument();
  });

  it('creates the section and uploads selected files on save draft', async () => {
    const onClose = jest.fn();
    const user = await renderOtherAttachmentsForm({}, onClose);

    await uploadFile(user);
    expect(screen.getByTestId('project-programme-other-attachments-success')).toBeInTheDocument();
    expect(mockPostProjectProgrammeAttachments).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() => expect(mockPostProjectProgrammeAttachments).toHaveBeenCalledTimes(1));
    expect(mockPostProjectProgrammeSection).toHaveBeenCalledWith({
      id: 'programme-1',
      section: 'other-attachments',
      data: {},
    });
    const { id, formData } = mockPostProjectProgrammeAttachments.mock.calls[0][0] as {
      id: string;
      formData: FormData;
    };
    expect(id).toBe('programme-1');
    expect((formData.get('file') as File).name).toBe('map.png');
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('deletes a removed attachment on save draft without patching the section', async () => {
    const user = await renderOtherAttachmentsForm({
      otherAttachments: { attachments: [savedAttachment], links: [] },
    });

    expect(screen.getByText('site-plan.pdf')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'projectProgrammeForm.deleteAttachmentAriaLabel' }),
    );
    await waitFor(() => expect(screen.queryByText('site-plan.pdf')).not.toBeInTheDocument());
    expect(mockDeleteProjectProgrammeAttachment).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    await waitFor(() =>
      expect(mockDeleteProjectProgrammeAttachment).toHaveBeenCalledWith({
        id: 'programme-1',
        attachmentId: 'attachment-1',
      }),
    );
    expect(mockPatchProjectProgrammeSection).not.toHaveBeenCalled();
    expect(mockPostProjectProgrammeSection).not.toHaveBeenCalled();
  });

  it('shows an error banner and keeps the form open when upload fails', async () => {
    mockPostProjectProgrammeAttachments.mockRejectedValue({
      status: 413,
      data: { detail: 'Tiedosto on liian suuri.' },
    });
    const onClose = jest.fn();
    const user = await renderOtherAttachmentsForm({ otherAttachments: { links: [] } }, onClose);

    await uploadFile(user);
    await user.click(screen.getByRole('button', { name: 'projectProgrammeForm.saveDraft' }));

    expect(
      await screen.findByTestId('project-programme-other-attachments-error'),
    ).toHaveTextContent('Tiedosto on liian suuri.');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uploads files before marking the section ready', async () => {
    const user = await renderOtherAttachmentsForm({ otherAttachments: { links: [] } });

    await uploadFile(user);
    await user.click(screen.getByRole('button', { name: 'projectProgrammeForm.markSectionReady' }));

    await waitFor(() => expect(mockTransitionProjectProgrammeSectionStatus).toHaveBeenCalled());
    expect(mockPostProjectProgrammeAttachments.mock.invocationCallOrder[0]).toBeLessThan(
      mockTransitionProjectProgrammeSectionStatus.mock.invocationCallOrder[0],
    );
  });

  it('opens a saved attachment in a preview dialog', async () => {
    mockGetProjectProgrammeAttachmentBlob.mockResolvedValue(
      new Blob(['pdf'], { type: 'application/pdf' }),
    );
    const user = await renderOtherAttachmentsForm({
      otherAttachments: { attachments: [savedAttachment], links: [] },
    });

    await user.click(
      screen.getByRole('button', { name: 'projectProgrammeForm.showAttachmentAriaLabel' }),
    );

    expect(mockGetProjectProgrammeAttachmentBlob).toHaveBeenCalledWith(
      'programme-1',
      'attachment-1',
    );
    expect(await screen.findByTitle('site-plan.pdf')).toHaveAttribute('src', 'blob:preview');
  });
});
