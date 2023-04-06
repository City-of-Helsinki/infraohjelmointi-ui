import { ILocation } from '@/interfaces/locationInterfaces';

export const mockLocations: { data: Array<ILocation> } = {
  data: [
    {
      id: '55b5a61e-f270-4c84-9547-d013f2c8ae87',
      name: 'Eteläinen',
      path: 'Eteläinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '02315bca-eed2-4e05-92e9-90163bace606',
      relatedTo: null,
    },
    {
      id: 'f6d81884-d11b-492f-9309-5c1ddc9b4cf6',
      name: 'Läntinen',
      path: 'Läntinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '58a4fc66-67c7-426b-b0a0-af45174b95ef',
      relatedTo: null,
    },
    {
      id: 'fa916b5c-6312-4e6a-a7c0-2f7195d720df',
      name: 'Keskinen',
      path: 'Keskinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: 'bbd8d01a-a8ea-499e-aee2-c7e00ba2ad11',
      relatedTo: null,
    },
    {
      id: 'fb35bbd1-193d-48ed-8fa1-46fcf8912f03',
      name: 'Kluuvi',
      path: 'Eteläinen/Kluuvi',
      forCoordinatorOnly: false,
      parent: '55b5a61e-f270-4c84-9547-d013f2c8ae87',
      parentClass: '02315bca-eed2-4e05-92e9-90163bace606',
      relatedTo: null,
    },
    {
      id: '123-123-123-123',
      name: 'TestDivision1',
      path: 'Koillinen/Suutarila/TestDivision1',
      forCoordinatorOnly: false,
      parent: 'fb35bbd1-193d-48ed-8fa1-46fcf8912f03',
      parentClass: null,
      relatedTo: null,
    },
  ],
};

export const mockDistricts: { data: Array<ILocation> } = {
  data: [
    {
      id: '55b5a61e-f270-4c84-9547-d013f2c8ae87',
      name: 'Eteläinen',
      path: 'Eteläinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '02315bca-eed2-4e05-92e9-90163bace606',
      relatedTo: null,
    },
    {
      id: 'f6d81884-d11b-492f-9309-5c1ddc9b4cf6',
      name: 'Läntinen',
      path: 'Läntinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: '58a4fc66-67c7-426b-b0a0-af45174b95ef',
      relatedTo: null,
    },
    {
      id: 'fa916b5c-6312-4e6a-a7c0-2f7195d720df',
      name: 'Keskinen',
      path: 'Keskinen',
      forCoordinatorOnly: false,
      parent: null,
      parentClass: 'bbd8d01a-a8ea-499e-aee2-c7e00ba2ad11',
      relatedTo: null,
    },
  ],
};

export const mockDivisions: { data: Array<ILocation> } = {
  data: [
    {
      id: 'fb35bbd1-193d-48ed-8fa1-46fcf8912f03',
      name: 'Kluuvi',
      path: 'Eteläinen/Kluuvi',
      forCoordinatorOnly: false,
      parent: '55b5a61e-f270-4c84-9547-d013f2c8ae87',
      parentClass: '02315bca-eed2-4e05-92e9-90163bace606',
      relatedTo: null,
    },
  ],
};

export const mockSubDivisions: { data: Array<ILocation> } = {
  data: [
    {
      id: '123-123-123-123',
      name: 'TestDivision1',
      path: 'Koillinen/Kluuvi/TestDivision1',
      forCoordinatorOnly: false,
      parent: 'fb35bbd1-193d-48ed-8fa1-46fcf8912f03',
      parentClass: null,
      relatedTo: null,
    },
  ],
};
