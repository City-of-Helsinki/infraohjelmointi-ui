import { renderHook } from '@testing-library/react';
import useProjectProgrammeForm from './useProjectProgrammeForm';
import { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';

describe('useProjectProgrammeForm', () => {
  it('returns empty defaults for all sections when there is no saved data', () => {
    const { result } = renderHook(() => useProjectProgrammeForm(undefined));

    expect(result.current.getValues()).toEqual({
      basicInfo: {
        projectName: '',
        district: '',
        projectProgrammeCompiler: '',
        personsInvolved: '',
        estimatedCosts: '',
        inspector: '',
        summary: '',
        strategyGoals: '',
        costClass: '',
        projectSize: '',
        risks: '',
        studyAndPlanningNeeds: '',
        planningAndImplementationFeasibility: '',
        specialConsiderations: '',
        otherConsiderations: '',
        links: [{ value: '' }],
      },
      designCriteria: {
        guidingZoningRegulations: '',
        siteValuesProtectionAndSignificance: '',
        relationshipToPublicAreaServices: '',
        links: [{ value: '' }],
      },
      trafficPlanningCriteria: {
        pedestrianTraffic: '',
        bicycleTraffic: '',
        serviceAndPickupTraffic: '',
        otherTraffic: '',
        accessibility: '',
        noiseManagement: '',
        winterMaintenance: '',
        links: [{ value: '' }],
      },
      urbanSpacingPlanningCriteria: {
        targetUrbanAppearance: '',
        surfaceMaterials: '',
        structures: '',
        technicalNetworksAndSystems: '',
        lighting: '',
        greenery: '',
        lumoConsiderationAndProtection: '',
        natureTypes: '',
        equipmentAndFurnishings: '',
        waters: '',
        stormwaterManagement: '',
        links: [{ value: '' }],
      },
      maintenanceNeeds: {
        maintenanceNeeds: '',
        links: [{ value: '' }],
      },
      interactionAndRelatedProjects: {
        collaborationAndExperts: '',
        interactionNotes: '',
        links: [{ value: '' }],
      },
    });
  });

  it('hydrates design criteria values from saved data', () => {
    const formData: IProjectProgrammeForm = {
      designCriteria: {
        guidingZoningRegulations: 'Zoning',
        siteValuesProtectionAndSignificance: 'Site values',
        relationshipToPublicAreaServices: 'Public area services',
        links: [{ value: 'https://design.fi' }],
      },
    };

    const { result } = renderHook(() => useProjectProgrammeForm(formData));

    expect(result.current.getValues('designCriteria')).toEqual({
      guidingZoningRegulations: 'Zoning',
      siteValuesProtectionAndSignificance: 'Site values',
      relationshipToPublicAreaServices: 'Public area services',
      links: [{ value: 'https://design.fi' }],
    });
  });

  it('hydrates maintenance needs values from saved data', () => {
    const formData: IProjectProgrammeForm = {
      maintenanceNeeds: {
        maintenanceNeeds: 'Regular maintenance required',
        links: [{ value: 'https://maintenance.fi' }],
      },
    };

    const { result } = renderHook(() => useProjectProgrammeForm(formData));

    expect(result.current.getValues('maintenanceNeeds')).toEqual({
      maintenanceNeeds: 'Regular maintenance required',
      links: [{ value: 'https://maintenance.fi' }],
    });
  });

  it('hydrates traffic planning criteria values from saved data', () => {
    const formData: IProjectProgrammeForm = {
      trafficPlanningCriteria: {
        pedestrianTraffic: 'Pedestrian info',
        bicycleTraffic: 'Bicycle info',
        accessibility: 'Accessibility info',
        links: [{ value: 'https://traffic.fi' }],
      },
    };

    const { result } = renderHook(() => useProjectProgrammeForm(formData));

    expect(result.current.getValues('trafficPlanningCriteria')).toEqual({
      pedestrianTraffic: 'Pedestrian info',
      bicycleTraffic: 'Bicycle info',
      serviceAndPickupTraffic: '',
      otherTraffic: '',
      accessibility: 'Accessibility info',
      noiseManagement: '',
      winterMaintenance: '',
      links: [{ value: 'https://traffic.fi' }],
    });
  });

  it('hydrates urban spacing planning criteria values from saved data', () => {
    const formData: IProjectProgrammeForm = {
      urbanSpacingPlanningCriteria: {
        targetUrbanAppearance: 'Urban appearance',
        lighting: 'Lighting info',
        greenery: 'Greenery info',
        links: [{ value: 'https://urban.fi' }],
      },
    };

    const { result } = renderHook(() => useProjectProgrammeForm(formData));

    expect(result.current.getValues('urbanSpacingPlanningCriteria')).toEqual({
      targetUrbanAppearance: 'Urban appearance',
      surfaceMaterials: '',
      structures: '',
      technicalNetworksAndSystems: '',
      lighting: 'Lighting info',
      greenery: 'Greenery info',
      lumoConsiderationAndProtection: '',
      natureTypes: '',
      equipmentAndFurnishings: '',
      waters: '',
      stormwaterManagement: '',
      links: [{ value: 'https://urban.fi' }],
    });
  });

  it('hydrates interaction and related projects values from saved data', () => {
    const formData: IProjectProgrammeForm = {
      interactionAndRelatedProjects: {
        collaborationAndExperts: 'Collaboration info',
        interactionNotes: 'Interaction notes',
        links: [{ value: 'https://interaction.fi' }],
      },
    };

    const { result } = renderHook(() => useProjectProgrammeForm(formData));

    expect(result.current.getValues('interactionAndRelatedProjects')).toEqual({
      collaborationAndExperts: 'Collaboration info',
      interactionNotes: 'Interaction notes',
      links: [{ value: 'https://interaction.fi' }],
    });
  });

  it('hydrates basic info values and resolves district object to its name', () => {
    const formData: IProjectProgrammeForm = {
      basicInfo: {
        projectName: 'Mock project',
        district: { name: 'Keskinen' },
        summary: null,
        links: [{ value: 'https://basic.fi' }],
      },
    };

    const { result } = renderHook(() => useProjectProgrammeForm(formData));
    const basicInfo = result.current.getValues('basicInfo');

    expect(basicInfo?.projectName).toBe('Mock project');
    expect(basicInfo?.district).toBe('Keskinen');
    expect(basicInfo?.summary).toBe('');
    expect(basicInfo?.links).toEqual([{ value: 'https://basic.fi' }]);
  });

  it('re-hydrates all sections when saved data changes', () => {
    const initialData: IProjectProgrammeForm = {
      basicInfo: { projectName: 'First' },
      designCriteria: { guidingZoningRegulations: 'First zoning' },
      trafficPlanningCriteria: { pedestrianTraffic: 'First pedestrian' },
      urbanSpacingPlanningCriteria: { targetUrbanAppearance: 'First urban' },
      maintenanceNeeds: { maintenanceNeeds: 'First maintenance' },
      interactionAndRelatedProjects: { collaborationAndExperts: 'First collaboration' },
    };

    const { result, rerender } = renderHook(
      (formData: IProjectProgrammeForm) => useProjectProgrammeForm(formData),
      { initialProps: initialData },
    );

    expect(result.current.getValues('designCriteria.guidingZoningRegulations')).toBe(
      'First zoning',
    );
    expect(result.current.getValues('trafficPlanningCriteria.pedestrianTraffic')).toBe(
      'First pedestrian',
    );
    expect(result.current.getValues('maintenanceNeeds.maintenanceNeeds')).toBe(
      'First maintenance',
    );
    expect(result.current.getValues('interactionAndRelatedProjects.collaborationAndExperts')).toBe(
      'First collaboration',
    );

    rerender({
      basicInfo: { projectName: 'Second' },
      designCriteria: { guidingZoningRegulations: 'Second zoning' },
      trafficPlanningCriteria: { pedestrianTraffic: 'Second pedestrian' },
      urbanSpacingPlanningCriteria: { targetUrbanAppearance: 'Second urban' },
      maintenanceNeeds: { maintenanceNeeds: 'Second maintenance' },
      interactionAndRelatedProjects: { collaborationAndExperts: 'Second collaboration' },
    });

    expect(result.current.getValues('basicInfo.projectName')).toBe('Second');
    expect(result.current.getValues('designCriteria.guidingZoningRegulations')).toBe(
      'Second zoning',
    );
    expect(result.current.getValues('trafficPlanningCriteria.pedestrianTraffic')).toBe(
      'Second pedestrian',
    );
    expect(result.current.getValues('urbanSpacingPlanningCriteria.targetUrbanAppearance')).toBe(
      'Second urban',
    );
    expect(result.current.getValues('maintenanceNeeds.maintenanceNeeds')).toBe(
      'Second maintenance',
    );
    expect(result.current.getValues('interactionAndRelatedProjects.collaborationAndExperts')).toBe(
      'Second collaboration',
    );
    expect(result.current.formState.isDirty).toBe(false);
  });

  it('normalizes links from strings, drops empty ones and falls back to one empty link for all sections', () => {
    const formData = {
      basicInfo: { links: ['https://one.fi', '', 'https://two.fi'] },
      designCriteria: { links: [{ value: '' }] },
      trafficPlanningCriteria: { links: ['https://traffic.fi'] },
      urbanSpacingPlanningCriteria: { links: ['https://urban.fi', '', null] },
      maintenanceNeeds: { links: ['https://maintenance.fi', '', null] },
      interactionAndRelatedProjects: { links: [{ value: '' }, { value: 'https://interaction.fi' }] },
    } as unknown as IProjectProgrammeForm;

    const { result } = renderHook(() => useProjectProgrammeForm(formData));

    expect(result.current.getValues('basicInfo.links')).toEqual([
      { value: 'https://one.fi' },
      { value: 'https://two.fi' },
    ]);
    expect(result.current.getValues('designCriteria.links')).toEqual([{ value: '' }]);
    expect(result.current.getValues('trafficPlanningCriteria.links')).toEqual([
      { value: 'https://traffic.fi' },
    ]);
    expect(result.current.getValues('urbanSpacingPlanningCriteria.links')).toEqual([
      { value: 'https://urban.fi' },
    ]);
    expect(result.current.getValues('maintenanceNeeds.links')).toEqual([
      { value: 'https://maintenance.fi' },
    ]);
    expect(result.current.getValues('interactionAndRelatedProjects.links')).toEqual([
      { value: 'https://interaction.fi' },
    ]);
  });
});
