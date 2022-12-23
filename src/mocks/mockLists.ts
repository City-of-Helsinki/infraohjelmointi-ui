import { IListItem } from '@/interfaces/common';

export const mockProjectTypes: { data: Array<IListItem> } = {
  data: [
    {
      id: '4e60a0b0-4801-4cb2-8178-69d876515d96',
      value: 'projectComplex',
    },
    {
      id: 'af6963ac-4804-4e03-b298-0948331a5f58',
      value: 'street',
    },
    {
      id: 'cc0989ad-8e2b-4f0f-8953-0d22d070a695',
      value: 'traffic',
    },
    {
      id: '434e8052-9f76-4c41-b450-d9eff680d503',
      value: 'sports',
    },
    {
      id: '8b3c83c0-3849-4bbe-9e04-2a26c229caf3',
      value: 'omaStadi',
    },
    {
      id: '7b39f7bd-6f55-4762-81df-54bf0c58e1bb',
      value: 'projectArea',
    },
    {
      id: '720bddee-9a45-40cd-83f6-89fc44dfd8f6',
      value: 'park',
    },
  ],
};

export const mockProjectPhases: { data: Array<IListItem> } = {
  data: [
    {
      id: '7bc0829e-ffb4-4e4c-8653-1e1709e9f17a',
      value: 'proposal',
    },
    {
      id: '7d02f54f-b874-484e-8db5-89bda613f918',
      value: 'design',
    },
    {
      id: 'f99bcf35-c1f4-4624-8ddc-e3dbf6d5f2dc',
      value: 'programming',
    },
    {
      id: 'c0011fd1-89a5-491c-a6d2-f968b0384069',
      value: 'draftInitiation',
    },
    {
      id: '1b72b334-0b6b-4b85-8767-a18b8102e6fd',
      value: 'draftApproval',
    },
    {
      id: 'fdd7ef12-6050-4dfb-89d8-6b3dd8664417',
      value: 'constructionPlan',
    },
    {
      id: '741cdfd3-ecd1-48dc-9d01-560deee400c5',
      value: 'constructionWait',
    },
    {
      id: 'c874452e-aaac-4fe8-927a-e7dd0ba182f2',
      value: 'construction',
    },
    {
      id: '8f45afeb-75c7-4624-8e01-376373986b81',
      value: 'warrantyPeriod',
    },
    {
      id: '6e21081e-2bb4-4cc4-87e1-01440c50bab9',
      value: 'completed',
    },
  ],
};

export const mockProjectAreas: { data: Array<IListItem> } = {
  data: [
    {
      id: '801c8b0e-92e0-4688-b253-a88b4d93b17a',
      value: 'honkasuo',
    },
    {
      id: '5c437630-5b14-4ade-9270-2552d373e4e4',
      value: 'kalasatama',
    },
    {
      id: '97198d5f-2f2f-4e2d-a4ad-bd755af44797',
      value: 'kruunuvuorenranta',
    },
    {
      id: 'c19cb619-3be8-45c3-b752-4f303dd14164',
      value: 'kuninkaantammi',
    },
    {
      id: '35279d39-1b70-4cb7-a360-a43cd45d7b5c',
      value: 'lansisatama',
    },
    {
      id: '39d8ae2c-f727-4f10-a05d-3ec2062949c9',
      value: 'malminLentokenttaalue',
    },
    {
      id: '273b10b2-56f3-4433-91d3-a0116bbc8da3',
      value: 'pasila',
    },
    {
      id: 'c6faf257-5b2d-4df7-bbd7-72a408e46e23',
      value: 'ostersundom',
    },
  ],
};

export const mockProjectQualityLevels: { data: Array<IListItem> } = {
  data: [
    {
      id: 'f5f4b721-1a64-4773-b332-0d5681a97fcc',
      value: '1class',
    },
    {
      id: 'f14a111a-88bf-474f-8eae-126f237b5de7',
      value: '2class',
    },
    {
      id: '473675bf-0d50-4003-a05e-b0cad44f4642',
      value: '3class',
    },
    {
      id: '5981574d-894d-4ad5-85c9-89fa38dec9e8',
      value: 'A1',
    },
    {
      id: '45d0fb73-ae67-4d25-b472-4156df9be0b3',
      value: 'A2',
    },
    {
      id: '7dffc7ca-b743-4d99-930e-4cb08629ae2b',
      value: 'A3',
    },
    {
      id: '83fef953-2389-4006-a0de-c5f6427ba25e',
      value: 'B',
    },
    {
      id: '35362cb5-d7eb-4ec6-8211-0f4da6c19772',
      value: 'C',
    },
  ],
};

export const mockPlanningPhases: { data: Array<IListItem> } = {
  data: [
    {
      id: 'ead11d27-93a4-4331-afa9-51735aa9b571',
      value: 'projectPlanning',
    },
    {
      id: '65854c80-93a6-4afc-986e-4bd267a4e332',
      value: 'generalDesign',
    },
    {
      id: 'db3aaa44-aec9-4ff9-b441-5d8529da5e4a',
      value: 'parkPlaning',
    },
    {
      id: '2582f4fa-c51a-4364-8d2c-5855d1806505',
      value: 'trafficPlanning',
    },
    {
      id: 'e5f29d7f-dafa-473f-9a3f-ccb9b30f0b4e',
      value: 'streetDesign',
    },
    {
      id: '45a954b9-ae49-431a-bebc-bd9e5614757f',
      value: 'buildingDesign',
    },
  ],
};

export const mockConstructionPhases: { data: Array<IListItem> } = {
  data: [
    {
      id: 'a674d7aa-2bdf-429d-bcf7-9156eed81c40',
      value: 'planning',
    },
    {
      id: '88a2950d-b03b-4b1c-a6ec-c450cd8d7794',
      value: 'contractCalculation',
    },
    {
      id: '2f6665cf-45c2-4878-bd81-b7e1bc1cd928',
      value: 'additionalWork',
    },
    {
      id: '22c4035e-31d9-405b-a882-6696b520a0de',
      value: 'reception',
    },
  ],
};
