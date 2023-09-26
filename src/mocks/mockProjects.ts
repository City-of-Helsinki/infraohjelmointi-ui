import { IProjectsResponse } from '@/interfaces/projectInterfaces';
import mockProject from './mockProject';

const mockProjects: { data: IProjectsResponse } = {
  data: {
    count: 1,
    results: [mockProject.data],
  },
};

export default mockProjects;
