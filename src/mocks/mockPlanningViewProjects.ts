import { IProjectsResponse } from '@/interfaces/projectInterfaces';
import mockProject from './mockProject';

const mockPlanningViewProjects: { data: IProjectsResponse } = {
  data: {
    count: 10,
    results: [
      // Without group and in class (for testing project rows)
      {
        ...mockProject.data,
        id: 'planning-project-1',
        projectClass: 'test-class-1',
        estPlanningStart: null,
        estPlanningEnd: null,
        estConstructionStart: null,
        estConstructionEnd: null,
        finances: {
          year: 2023,
          budgetProposalCurrentYearPlus0: '0.00',
          budgetProposalCurrentYearPlus1: '20.00',
          budgetProposalCurrentYearPlus2: '30.00',
          preliminaryCurrentYearPlus3: '40.00',
          preliminaryCurrentYearPlus4: '50.00',
          preliminaryCurrentYearPlus5: '60.00',
          preliminaryCurrentYearPlus6: '70.00',
          preliminaryCurrentYearPlus7: '80.00',
          preliminaryCurrentYearPlus8: '90.00',
          preliminaryCurrentYearPlus9: '0.00',
          preliminaryCurrentYearPlus10: '0.00',
        },
      },
      // Wihout group and in class (for testing project rows)
      {
        ...mockProject.data,
        id: 'planning-project-2',
        projectClass: 'test-class-1',
        estPlanningStart: '12.02.2024',
        estPlanningEnd: '12.02.2026',
        estConstructionStart: '12.02.2026',
        estConstructionEnd: '12.02.2029',
        category: undefined,
        finances: {
          year: 2023,
          budgetProposalCurrentYearPlus0: '0.00',
          budgetProposalCurrentYearPlus1: '0.00',
          budgetProposalCurrentYearPlus2: '30.00',
          preliminaryCurrentYearPlus3: '40.00',
          preliminaryCurrentYearPlus4: '50.00',
          preliminaryCurrentYearPlus5: '60.00',
          preliminaryCurrentYearPlus6: '70.00',
          preliminaryCurrentYearPlus7: '80.00',
          preliminaryCurrentYearPlus8: '90.00',
          preliminaryCurrentYearPlus9: '0.00',
          preliminaryCurrentYearPlus10: '0.00',
        },
      },
      {
        ...mockProject.data,
        id: 'planning-project-3',
        projectClass: 'test-sub-class-1',
      },
      // With group and in subClass
      {
        ...mockProject.data,
        id: 'planning-project-4',
        projectClass: 'test-sub-class-1',
        projectGroup: 'test-group-3',
      },
      // Without group and in district
      {
        ...mockProject.data,
        id: 'planning-project-5',
        projectClass: 'test-sub-class-1',
        projectGroup: null,
        projectLocation: 'test-district-1',
      },
      // With group and in district
      {
        ...mockProject.data,
        id: 'planning-project-6',
        projectClass: 'test-sub-class-1',
        projectGroup: 'test-group-4',
        projectLocation: 'test-district-1',
      },
      // Without group and in division
      {
        ...mockProject.data,
        id: 'planning-project-7',
        projectClass: 'test-sub-class-1',
        projectGroup: null,
        projectLocation: 'test-division-1',
      },
      // With group and in division
      {
        ...mockProject.data,
        id: 'planning-project-8',
        projectClass: 'test-sub-class-1',
        projectGroup: 'test-group-1',
        projectLocation: 'test-division-1',
      },
    ],
  },
};

export default mockPlanningViewProjects;
