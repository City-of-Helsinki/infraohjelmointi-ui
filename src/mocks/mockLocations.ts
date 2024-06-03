import { ILocation } from '@/interfaces/locationInterfaces';
import { mockClassFinances } from './mockClassFinances';
import { IListItem } from '@/interfaces/common';

export const mockLocations: { data: Array<ILocation> } = {
  data: [
    {
      id: 'test-district-1',
      name: 'TestDistrict',
      path: 'TestDistrict',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: 'test-sub-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: '55b5a61e-f270-4c84-9547-d013f2c8ae87',
      name: 'Eteläinen',
      path: 'Eteläinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '02315bca-eed2-4e05-92e9-90163bace606',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'f6d81884-d11b-492f-9309-5c1ddc9b4cf6',
      name: 'Läntinen',
      path: 'Läntinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '58a4fc66-67c7-426b-b0a0-af45174b95ef',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'fa916b5c-6312-4e6a-a7c0-2f7195d720df',
      name: 'Keskinen',
      path: 'Keskinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: 'bbd8d01a-a8ea-499e-aee2-c7e00ba2ad11',
      relatedTo: null,
      finances: mockClassFinances,
    },

    {
      id: 'koilinen-district-test',
      name: 'Koillinen',
      path: 'Koillinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'test-division-1',
      name: 'TestDivision',
      path: 'TestDistrict/TestDivision',
      forCoordinatorOnly: false,
      parent: 'test-district-1',
      parentClass: 'test-sub-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'fb35bbd1-193d-48ed-8fa1-46fcf8912f03',
      name: 'Kluuvi',
      path: 'Eteläinen/Kluuvi',
      forCoordinatorOnly: false,
      parent: '55b5a61e-f270-4c84-9547-d013f2c8ae87',
      parentClass: '02315bca-eed2-4e05-92e9-90163bace606',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'test-sub-division-1',
      name: 'TestSubDivision',
      path: 'Koillinen/Kluuvi/TestSubDivision',
      forCoordinatorOnly: false,
      parent: 'fb35bbd1-193d-48ed-8fa1-46fcf8912f03',
      parentClass: undefined,
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockDistricts: { data: Array<ILocation> } = {
  data: [
    {
      id: 'test-district-1',
      name: 'TestDistrict',
      path: 'TestDistrict',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: 'test-sub-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: '55b5a61e-f270-4c84-9547-d013f2c8ae87',
      name: 'Eteläinen',
      path: 'Eteläinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '02315bca-eed2-4e05-92e9-90163bace606',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'f6d81884-d11b-492f-9309-5c1ddc9b4cf6',
      name: 'Läntinen',
      path: 'Läntinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '58a4fc66-67c7-426b-b0a0-af45174b95ef',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'fa916b5c-6312-4e6a-a7c0-2f7195d720df',
      name: 'Keskinen',
      path: 'Keskinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: 'bbd8d01a-a8ea-499e-aee2-c7e00ba2ad11',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'koilinen-district-test',
      name: 'Koillinen',
      path: 'Koillinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockDivisions: { data: Array<ILocation> } = {
  data: [
    {
      id: 'test-division-1',
      name: 'TestDivision',
      path: 'TestDistrict/TestDivision',
      forCoordinatorOnly: false,
      parent: 'test-district-1',
      parentClass: 'test-sub-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'fb35bbd1-193d-48ed-8fa1-46fcf8912f03',
      name: 'Kluuvi',
      path: 'Eteläinen/Kluuvi',
      forCoordinatorOnly: false,
      parent: '55b5a61e-f270-4c84-9547-d013f2c8ae87',
      parentClass: '02315bca-eed2-4e05-92e9-90163bace606',
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockSubDivisions: { data: Array<ILocation> } = {
  data: [
    {
      id: 'test-sub-division-1',
      name: 'TestSubDivision',
      path: 'Koillinen/Kluuvi/TestSubDivision',
      forCoordinatorOnly: false,
      parent: 'fb35bbd1-193d-48ed-8fa1-46fcf8912f03',
      parentClass: undefined,
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockCoordinatorLocations: { data: Array<ILocation> } = {
  data: [
    {
      id: 'test-coordinator-district-1',
      name: 'TestCoordinatorDistrict1',
      path: 'TestCoordinatorDistrict1',
      forCoordinatorOnly: true,
      parent: null,
      parentClass: 'test-coordinator-sub-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'test-coordinator-district-2',
      name: 'TestCoordinatorDistrict2',
      path: 'TestCoordinatorDistrict2',
      forCoordinatorOnly: true,
      parent: null,
      parentClass: 'test-coordinator-collective-sub-level-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockCoordinatorDistricts: { data: Array<ILocation> } = {
  data: [
    {
      id: 'test-coordinator-district-1',
      name: 'TestCoordinatorDistrict1',
      path: 'TestCoordinatorDistrict1',
      forCoordinatorOnly: true,
      parent: null,
      parentClass: 'test-coordinator-sub-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'test-coordinator-district-2',
      name: 'TestCoordinatorDistrict2',
      path: 'TestCoordinatorDistrict2',
      forCoordinatorOnly: true,
      parent: null,
      parentClass: 'test-coordinator-collective-sub-level-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockDistrictOptions: { data: Array<IListItem> } = {
  data: [
    {
      id: "test-mock-district-option-1",
      value: "Koillinen"
    },
    {
      id: "test-mock-district-option-2",
      value: "Eteläinen"
    }
  ]
}

export const mockDivisionOptions: { data: Array<IListItem> } = {
  data: [
    {
      id: "test-mock-division-option-1",
      value: "Testarea 1",
      parent: "test-mock-district-option-1"
    },
    {
      id: "test-mock-division-option-2",
      value: "Testarea 2",
      parent: "test-mock-district-option-1"
    }
  ]
}

export const mockSubDivisionOptions: { data: Array<IListItem> } = {
  data: [
    {
      id: "test-mock-sub-division-option-1",
      value: "Testsubarea 1",
      parent: "test-mock-division-option-1"
    },
    {
      id: "test-mock-subdivision-option-2",
      value: "Testsubarea 2",
      parent: "test-mock-division-option-1"
    }
  ]
}
