import { getDefaultProgrammerForClasses } from './programmerUtils';
import { IClass } from '@/interfaces/classInterfaces';

describe('programmerUtils', () => {
  describe('getDefaultProgrammerForClasses', () => {
    const mockClasses = {
      masterClass: {
        id: 'master-1',
        name: 'Master Class 1',
        path: 'master-1',
        forCoordinatorOnly: false,
        relatedTo: null,
        parent: null,
        finances: {
          year: 2024,
          budgetOverrunAmount: 0,
          year0: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year1: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year2: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year3: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year4: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year5: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year6: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year7: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year8: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year9: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year10: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        },
        defaultProgrammer: { id: 'john.smith', firstName: 'John', lastName: 'Smith' },
      },
      class: {
        id: 'class-1',
        name: 'Class 1',
        path: 'master-1/class-1',
        forCoordinatorOnly: false,
        relatedTo: null,
        parent: 'master-1',
        finances: {
          year: 2024,
          budgetOverrunAmount: 0,
          year0: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year1: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year2: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year3: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year4: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year5: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year6: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year7: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year8: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year9: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year10: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        },
        defaultProgrammer: { id: 'jane.doe', firstName: 'Jane', lastName: 'Doe' },
      },
      subClass: {
        id: 'sub-1',
        name: 'Sub Class 1',
        path: 'master-1/class-1/sub-1',
        forCoordinatorOnly: false,
        relatedTo: null,
        parent: 'class-1',
        finances: {
          year: 2024,
          budgetOverrunAmount: 0,
          year0: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year1: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year2: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year3: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year4: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year5: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year6: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year7: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year8: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year9: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
          year10: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        },
        defaultProgrammer: { id: 'bob.jones', firstName: 'Bob', lastName: 'Jones' },
      },
    } as const;

    it('returns null when no classes are provided', () => {
      const programmer = getDefaultProgrammerForClasses(undefined, undefined, undefined);
      expect(programmer).toBeNull();
    });

    it('returns subClass programmer when available', () => {
      const programmer = getDefaultProgrammerForClasses(
        mockClasses.masterClass,
        mockClasses.class,
        mockClasses.subClass,
      );
      expect(programmer).toEqual({
        id: 'bob.jones',
        firstName: 'Bob',
        lastName: 'Jones',
      });
    });

    it('returns class programmer when subClass has no programmer', () => {
      const subClassWithoutProgrammer: IClass = {
        ...mockClasses.subClass,
        defaultProgrammer: undefined,
      };

      const programmer = getDefaultProgrammerForClasses(
        mockClasses.masterClass,
        mockClasses.class,
        subClassWithoutProgrammer,
      );
      expect(programmer).toEqual({
        id: 'jane.doe',
        firstName: 'Jane',
        lastName: 'Doe',
      });
    });

    it('returns masterClass programmer when no other programmer is available', () => {
      const subClassWithoutProgrammer: IClass = {
        ...mockClasses.subClass,
        defaultProgrammer: undefined,
      };
      const classWithoutProgrammer: IClass = {
        ...mockClasses.class,
        defaultProgrammer: undefined,
      };

      const programmer = getDefaultProgrammerForClasses(
        mockClasses.masterClass,
        classWithoutProgrammer,
        subClassWithoutProgrammer,
      );
      expect(programmer).toEqual({
        id: 'john.smith',
        firstName: 'John',
        lastName: 'Smith',
      });
    });
  });
});
