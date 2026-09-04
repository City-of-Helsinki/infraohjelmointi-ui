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
      maintenanceNeeds: {
        maintenanceNeeds: '',
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
      maintenanceNeeds: { maintenanceNeeds: 'First maintenance' },
    };

    const { result, rerender } = renderHook(
      (formData: IProjectProgrammeForm) => useProjectProgrammeForm(formData),
      { initialProps: initialData },
    );

    expect(result.current.getValues('designCriteria.guidingZoningRegulations')).toBe(
      'First zoning',
    );
    expect(result.current.getValues('maintenanceNeeds.maintenanceNeeds')).toBe(
      'First maintenance',
    );

    rerender({
      basicInfo: { projectName: 'Second' },
      designCriteria: { guidingZoningRegulations: 'Second zoning' },
      maintenanceNeeds: { maintenanceNeeds: 'Second maintenance' },
    });

    expect(result.current.getValues('basicInfo.projectName')).toBe('Second');
    expect(result.current.getValues('designCriteria.guidingZoningRegulations')).toBe(
      'Second zoning',
    );
    expect(result.current.getValues('maintenanceNeeds.maintenanceNeeds')).toBe(
      'Second maintenance',
    );
    expect(result.current.formState.isDirty).toBe(false);
  });

  it('normalizes links from strings, drops empty ones and falls back to one empty link for all sections', () => {
    const formData = {
      basicInfo: { links: ['https://one.fi', '', 'https://two.fi'] },
      designCriteria: { links: [{ value: '' }] },
      maintenanceNeeds: { links: ['https://maintenance.fi', '', null] },
    } as unknown as IProjectProgrammeForm;

    const { result } = renderHook(() => useProjectProgrammeForm(formData));

    expect(result.current.getValues('basicInfo.links')).toEqual([
      { value: 'https://one.fi' },
      { value: 'https://two.fi' },
    ]);
    expect(result.current.getValues('designCriteria.links')).toEqual([{ value: '' }]);
    expect(result.current.getValues('maintenanceNeeds.links')).toEqual([
      { value: 'https://maintenance.fi' },
    ]);
  });
});
