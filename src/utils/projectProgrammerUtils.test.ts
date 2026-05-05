import {
  getBestProgrammerForClass,
  getBestProgrammerForDistrict,
  programmerToListItem,
} from './projectProgrammerUtils';
import { IClass, IProgrammer } from '@/interfaces/classInterfaces';
import { IProjectDistrictOption } from '@/interfaces/locationInterfaces';

describe('projectProgrammerUtils', () => {
  describe('getBestProgrammerForClass', () => {
    it('should return computedDefaultProgrammer when available', () => {
      const mockClass: IClass = {
        id: 'test-class',
        name: 'Test Class',
        path: 'Test Path',
        forCoordinatorOnly: false,
        relatedTo: null,
        parent: null,
        finances: {} as any,
        defaultProgrammer: {
          id: 'default-id',
          firstName: 'Default',
          lastName: 'Programmer',
        },
        computedDefaultProgrammer: {
          id: 'computed-id',
          firstName: 'Computed',
          lastName: 'Programmer',
        },
      };

      const result = getBestProgrammerForClass(mockClass);

      expect(result).toEqual({
        id: 'computed-id',
        firstName: 'Computed',
        lastName: 'Programmer',
      });
    });

    it('should return defaultProgrammer when computedDefaultProgrammer is not available', () => {
      const mockClass: IClass = {
        id: 'test-class',
        name: 'Test Class',
        path: 'Test Path',
        forCoordinatorOnly: false,
        relatedTo: null,
        parent: null,
        finances: {} as any,
        defaultProgrammer: {
          id: 'default-id',
          firstName: 'Default',
          lastName: 'Programmer',
        },
      };

      const result = getBestProgrammerForClass(mockClass);

      expect(result).toEqual({
        id: 'default-id',
        firstName: 'Default',
        lastName: 'Programmer',
      });
    });

    it('should return null when no programmer is available', () => {
      const mockClass: IClass = {
        id: 'test-class',
        name: 'Test Class',
        path: 'Test Path',
        forCoordinatorOnly: false,
        relatedTo: null,
        parent: null,
        finances: {} as any,
      };

      const result = getBestProgrammerForClass(mockClass);

      expect(result).toBeNull();
    });

    it('should return null when class is null', () => {
      const result = getBestProgrammerForClass(null);

      expect(result).toBeNull();
    });
  });

  describe('getBestProgrammerForDistrict (IO-411)', () => {
    it('returns computedDefaultProgrammer when the district has one', () => {
      const option: IProjectDistrictOption = {
        id: 'district-1',
        value: 'Itäinen suurpiiri',
        computedDefaultProgrammer: {
          id: 'prog-itainen',
          firstName: 'Tia',
          lastName: 'Ohjelmoija',
        },
      };

      expect(getBestProgrammerForDistrict(option)).toEqual({
        id: 'prog-itainen',
        firstName: 'Tia',
        lastName: 'Ohjelmoija',
      });
    });

    it('returns null for districts without a computed programmer', () => {
      const option: IProjectDistrictOption = {
        id: 'district-2',
        value: 'Some district',
      };

      expect(getBestProgrammerForDistrict(option)).toBeNull();
    });

    it('returns null when the district is null or undefined', () => {
      expect(getBestProgrammerForDistrict(null)).toBeNull();
      expect(getBestProgrammerForDistrict(undefined)).toBeNull();
    });
  });

  describe('programmerToListItem', () => {
    it('should convert programmer to list item format', () => {
      const programmer: IProgrammer = {
        id: 'test-id',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = programmerToListItem(programmer);

      expect(result).toEqual({
        id: 'test-id',
        value: 'Test User',
      });
    });

    it('should handle programmer with extra spaces in names', () => {
      const programmer: IProgrammer = {
        id: 'test-id',
        firstName: '  Test  ',
        lastName: '  User  ',
      };

      const result = programmerToListItem(programmer);

      expect(result).toEqual({
        id: 'test-id',
        value: 'Test User',
      });
    });

    it('should return null when programmer is null', () => {
      const result = programmerToListItem(null);

      expect(result).toBeNull();
    });
  });
});
