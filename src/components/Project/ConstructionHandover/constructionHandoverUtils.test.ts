import { ConstructionHandoverStatus } from '@/interfaces/constructionHandoverInterfaces';
import { createConstructionHandover } from '@/mocks/createMocks';
import { canEditConstructionHandover } from './constructionHandoverUtils';

const planner = { isPlanner: true, isProjectManager: true, isResponsiblePersonForProject: false };
const responsibleManager = {
  isPlanner: false,
  isProjectManager: true,
  isResponsiblePersonForProject: true,
};
const otherManager = {
  isPlanner: false,
  isProjectManager: true,
  isResponsiblePersonForProject: false,
};

describe('canEditConstructionHandover', () => {
  it.each([
    [ConstructionHandoverStatus.DRAFT, planner, true],
    [ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER, planner, true],
    [ConstructionHandoverStatus.DRAFT, responsibleManager, true],
    [ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER, responsibleManager, false],
    [ConstructionHandoverStatus.DRAFT, otherManager, false],
    [ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER, otherManager, false],
    [ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION, planner, false],
    [ConstructionHandoverStatus.PROJECT_MANAGER_NAMED, planner, false],
    [ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION, planner, false],
    [ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION, responsibleManager, false],
  ])('status %s with permissions %j returns %s', (status, permissions, expected) => {
    expect(canEditConstructionHandover(createConstructionHandover({ status }), permissions)).toBe(
      expected,
    );
  });
});
