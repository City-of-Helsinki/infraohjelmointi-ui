import { IProjectsResponse } from '@/interfaces/projectInterfaces';
import mockProject from './mockProject';

const mockPlanningViewProjects: { data: IProjectsResponse } = {
  data: {
    count: 10,
    results: [
      // Without group and in class
      {
        ...mockProject.data,
        id: 'planning-project-1',
        projectClass: 'test-class-1',
      },
      // Wihout group and in subClass
      {
        ...mockProject.data,
        id: 'planning-project-2',
        projectClass: 'test-sub-class-1',
      },
      // With group and in subClass
      {
        ...mockProject.data,
        id: 'planning-project-3',
        projectClass: 'test-sub-class-1',
        projectGroup: 'test-group-3',
      },
      // Without group and in district
      {
        ...mockProject.data,
        id: 'planning-project-4',
        projectClass: 'test-sub-class-1',
        projectGroup: null,
        projectLocation: 'test-district-1',
      },
      // With group and in district
      {
        ...mockProject.data,
        id: 'planning-project-5',
        projectClass: 'test-sub-class-1',
        projectGroup: 'test-group-4',
        projectLocation: 'test-district-1',
      },
      // Without group and in division
      {
        ...mockProject.data,
        id: 'planning-project-6',
        projectClass: 'test-sub-class-1',
        projectGroup: null,
        projectLocation: 'test-division-1',
      },
      // With group and in division
      {
        ...mockProject.data,
        id: 'planning-project-7',
        projectClass: 'test-sub-class-1',
        projectGroup: 'test-group-1',
        projectLocation: 'test-division-1',
      },
    ],
  },
};

export default mockPlanningViewProjects;
