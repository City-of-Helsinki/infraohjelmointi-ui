import { getDefaultProgrammerForClasses } from './programmerUtils';
import { getDefaultProgrammerForLocation } from './locationProgrammerUtils';
import { IClass, IProgrammer, IClassFinances } from '@/interfaces/classInterfaces';
import { IListItem } from '@/interfaces/common';

describe('programmerUtils', () => {
  const mockFinances: IClassFinances = {
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
  };

  describe('getDefaultProgrammerForClasses', () => {
    const mockProgrammers = {
      john: { id: 'john.smith', firstName: 'John', lastName: 'Smith' },
      jane: { id: 'jane.doe', firstName: 'Jane', lastName: 'Doe' },
      bob: { id: 'bob.jones', firstName: 'Bob', lastName: 'Jones' },
    } as const;

    const createMockClass = (
      id: string,
      name: string,
      path: string,
      parent: string | null,
      defaultProgrammer?: IProgrammer,
    ): IClass => ({
      id,
      name,
      path,
      forCoordinatorOnly: false,
      relatedTo: null,
      parent,
      finances: mockFinances,
      defaultProgrammer,
    });

    const mockClasses = {
      masterClass: createMockClass(
        'master-1',
        'Master Class 1',
        'master-1',
        null,
        mockProgrammers.john,
      ),
      class: createMockClass(
        'class-1',
        'Class 1',
        'master-1/class-1',
        'master-1',
        mockProgrammers.jane,
      ),
      subClass: createMockClass(
        'sub-1',
        'Sub Class 1',
        'master-1/class-1/sub-1',
        'class-1',
        mockProgrammers.bob,
      ),
    } as const;

    const createClassWithoutProgrammer = (baseClass: IClass): IClass => ({
      ...baseClass,
      defaultProgrammer: undefined,
    });

    it('returns null when no classes are provided', () => {
      const programmer = getDefaultProgrammerForClasses(undefined, undefined, undefined);
      expect(programmer).toBeNull();
    });

    const expectProgrammerToEqual = (actual: IProgrammer | null, expected: IProgrammer) => {
      expect(actual).toEqual(expected);
    };

    it('returns subClass programmer when available', () => {
      const programmer = getDefaultProgrammerForClasses(
        mockClasses.masterClass,
        mockClasses.class,
        mockClasses.subClass,
      );
      expectProgrammerToEqual(programmer, mockProgrammers.bob);
    });

    it('returns class programmer when subClass has no programmer', () => {
      const subClassWithoutProgrammer = createClassWithoutProgrammer(mockClasses.subClass);

      const programmer = getDefaultProgrammerForClasses(
        mockClasses.masterClass,
        mockClasses.class,
        subClassWithoutProgrammer,
      );
      expectProgrammerToEqual(programmer, mockProgrammers.jane);
    });

    it('returns masterClass programmer when no other programmer is available', () => {
      const subClassWithoutProgrammer = createClassWithoutProgrammer(mockClasses.subClass);
      const classWithoutProgrammer = createClassWithoutProgrammer(mockClasses.class);

      const programmer = getDefaultProgrammerForClasses(
        mockClasses.masterClass,
        classWithoutProgrammer,
        subClassWithoutProgrammer,
      );
      expectProgrammerToEqual(programmer, mockProgrammers.john);
    });
  });

  describe('getDefaultProgrammerForLocation', () => {
    const mockProgrammerList: IListItem[] = [
      { id: 'john.smith', value: 'John Smith' },
      { id: 'jane.doe', value: 'Jane Doe' },
      { id: 'bob.jones', value: 'Bob Jones' },
      { id: 'alice.wilson', value: 'Alice Wilson' },
      { id: 'mike.brown', value: 'Mike Brown' },
    ];

    const mockProgrammerData = {
      john: { id: 'john.smith', firstName: 'John', lastName: 'Smith' },
      jane: { id: 'jane.doe', firstName: 'Jane', lastName: 'Doe' },
      bob: { id: 'bob.jones', firstName: 'Bob', lastName: 'Jones' },
      alice: { id: 'alice.wilson', firstName: 'Alice', lastName: 'Wilson' },
      mike: { id: 'mike.brown', firstName: 'Mike', lastName: 'Brown' },
    };

    const createLocationTestClass = (
      id: string,
      name: string,
      defaultProgrammer?: IProgrammer,
    ): IClass => ({
      id,
      name,
      path: `/${id}`,
      forCoordinatorOnly: false,
      relatedTo: null,
      parent: null,
      finances: mockFinances,
      defaultProgrammer,
    });

    it('should return programmer from subClass when it has defaultProgrammer', () => {
      const masterClass = createLocationTestClass('master-1', 'Master Class 1');
      const class_ = createLocationTestClass('class-1', 'Class 1');
      const subClass = createLocationTestClass('sub-1', 'Sub Class 1', mockProgrammerData.bob);

      const result = getDefaultProgrammerForLocation(
        masterClass,
        class_,
        subClass,
        mockProgrammerList,
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('bob.jones');
      expect(result?.value).toBe('Bob Jones');
    });

    it('should return programmer from class when subClass has no defaultProgrammer', () => {
      const masterClass = createLocationTestClass('master-1', 'Master Class 1');
      const class_ = createLocationTestClass('class-1', 'Class 1', mockProgrammerData.jane);
      const subClass = createLocationTestClass('sub-1', 'Sub Class 1'); // No defaultProgrammer

      const result = getDefaultProgrammerForLocation(
        masterClass,
        class_,
        subClass,
        mockProgrammerList,
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('jane.doe');
      expect(result?.value).toBe('Jane Doe');
    });

    it('should return programmer from masterClass when class and subClass have no defaultProgrammer', () => {
      const masterClass = createLocationTestClass(
        'master-1',
        'Master Class 1',
        mockProgrammerData.john,
      );
      const class_ = createLocationTestClass('class-1', 'Class 1'); // No defaultProgrammer
      const subClass = createLocationTestClass('sub-1', 'Sub Class 1'); // No defaultProgrammer

      const result = getDefaultProgrammerForLocation(
        masterClass,
        class_,
        subClass,
        mockProgrammerList,
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('john.smith');
      expect(result?.value).toBe('John Smith');
    });

    it('should return null when no classes have defaultProgrammer', () => {
      const masterClass = createLocationTestClass('master-1', 'Master Class 1');
      const class_ = createLocationTestClass('class-1', 'Class 1');
      const subClass = createLocationTestClass('sub-1', 'Sub Class 1');

      const result = getDefaultProgrammerForLocation(
        masterClass,
        class_,
        subClass,
        mockProgrammerList,
      );

      expect(result).toBeNull();
    });

    it('should return null when no programmers are available', () => {
      const masterClass = createLocationTestClass(
        'master-1',
        'Master Class 1',
        mockProgrammerData.john,
      );

      const result = getDefaultProgrammerForLocation(masterClass, null, null, []);

      expect(result).toBeNull();
    });

    it('should return null when all classes are null', () => {
      const result = getDefaultProgrammerForLocation(null, null, null, mockProgrammerList);

      expect(result).toBeNull();
    });

    it('should work with only masterClass provided', () => {
      const masterClass = createLocationTestClass(
        'master-1',
        'Master Class 1',
        mockProgrammerData.alice,
      );

      const result = getDefaultProgrammerForLocation(masterClass, null, null, mockProgrammerList);

      expect(result).toBeDefined();
      expect(result?.id).toBe('alice.wilson');
      expect(result?.value).toBe('Alice Wilson');
    });

    it('should prioritize subClass over class when both have defaultProgrammer', () => {
      const masterClass = createLocationTestClass('master-1', 'Master Class 1');
      const class_ = createLocationTestClass('class-1', 'Class 1', mockProgrammerData.jane);
      const subClass = createLocationTestClass('sub-1', 'Sub Class 1', mockProgrammerData.mike);

      const result = getDefaultProgrammerForLocation(
        masterClass,
        class_,
        subClass,
        mockProgrammerList,
      );

      // Should return subClass programmer (Mike Brown), not class programmer (Jane Doe)
      expect(result).toBeDefined();
      expect(result?.id).toBe('mike.brown');
      expect(result?.value).toBe('Mike Brown');
    });

    it('should match programmer by name when ID does not match', () => {
      const programmerWithDifferentId = {
        id: 'different.id',
        firstName: 'John',
        lastName: 'Smith',
      };
      const masterClass = createLocationTestClass(
        'master-1',
        'Master Class 1',
        programmerWithDifferentId,
      );

      const result = getDefaultProgrammerForLocation(masterClass, null, null, mockProgrammerList);

      expect(result).toBeDefined();
      expect(result?.id).toBe('john.smith'); // Should find by name match
      expect(result?.value).toBe('John Smith');
    });

    it('should return null when programmer not found in list', () => {
      const unknownProgrammer = { id: 'unknown.id', firstName: 'Unknown', lastName: 'Person' };
      const masterClass = createLocationTestClass('master-1', 'Master Class 1', unknownProgrammer);

      const result = getDefaultProgrammerForLocation(masterClass, null, null, mockProgrammerList);

      expect(result).toBeNull();
    });

    it('should handle programmer with only first name', () => {
      const programmerWithFirstNameOnly = { id: 'single.name', firstName: 'Alice', lastName: '' };
      const masterClass = createLocationTestClass(
        'master-1',
        'Master Class 1',
        programmerWithFirstNameOnly,
      );

      const modifiedProgrammerList = [...mockProgrammerList, { id: 'single.name', value: 'Alice' }];

      const result = getDefaultProgrammerForLocation(
        masterClass,
        null,
        null,
        modifiedProgrammerList,
      );

      expect(result).toBeDefined();
      expect(result?.value).toBe('Alice');
    });

    it('should handle programmer with only last name', () => {
      const programmerWithLastNameOnly = { id: 'last.only', firstName: '', lastName: 'Wilson' };
      const masterClass = createLocationTestClass(
        'master-1',
        'Master Class 1',
        programmerWithLastNameOnly,
      );

      const modifiedProgrammerList = [...mockProgrammerList, { id: 'last.only', value: 'Wilson' }];

      const result = getDefaultProgrammerForLocation(
        masterClass,
        null,
        null,
        modifiedProgrammerList,
      );

      expect(result).toBeDefined();
      expect(result?.value).toBe('Wilson');
    });
  });
});
