import { IListItem } from '@/interfaces/common';

export const mockProjectTypes: { data: Array<IListItem> } = {
  data: [
    {
      id: '706c71fd-0039-4a72-a408-adea06842194',
      value: 'newConstruction',
    },
    {
      id: '448138b6-271f-4150-8dad-7ee42eb81d1c',
      value: 'basicImprovement',
    },
  ],
};

export const mockProjectTypeQualifiers: { data: Array<IListItem> } = {
  data: [
    {
      id: '4dd7f084-b9c5-435a-978b-bf09110b3677',
      value: 'street',
    },
    {
      id: '59fe744c-be17-45fd-bf2a-b4f34a67818e',
      value: 'park',
    },
    {
      id: '04bbcdc7-652e-437d-a9a1-edbb53d3f92d',
      value: 'preConstruction',
    },
    {
      id: '3e45c512-2865-4b3f-b9a7-3e17cdf9b3d0',
      value: 'sports',
    },
    {
      id: 'a41d6366-1e9d-4854-954d-32a555ab39f6',
      value: 'spesialtyStructures',
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

export const mockConstructionPhaseDetails: { data: Array<IListItem> } = {
  data: [
    {
      id: '4f9f98f1-0bec-4cf4-b09f-208521d2b70d',
      value: 'preConstruction',
    },
    {
      id: '57903f81-15ff-46ff-b55e-b74c4a833af8',
      value: 'firstPhase',
    },
    {
      id: 'e73a7646-83d2-4256-bb69-c7dca2d7b269',
      value: 'firstPhaseComplete',
    },
    {
      id: '04b350dd-dd7a-44f6-bfe4-20a5715173ea',
      value: 'secondPhase',
    },
  ],
};

export const mockConstructionProcurementMethods: { data: Array<IListItem> } = {
  data: [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      value: 'Stara',
    },
    {
      id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
      value: 'Puitesopimus',
    },
    {
      id: 'c3d4e5f6-g7h8-9012-cdef-123456789012',
      value: 'Kilpailutettu',
    },
    {
      id: 'd4e5f6g7-h8i9-0123-defg-234567890123',
      value: 'Yhteistoiminnalliset',
    },
  ],
};

export const mockProjectCategories: { data: Array<IListItem> } = {
  data: [
    {
      id: '92f4ed03-be85-4a37-a907-23a780f25eae',
      value: 'K1',
    },
    {
      id: '3fd9bba4-1276-460b-a200-fccf47e6540b',
      value: 'K2',
    },
    {
      id: 'df6514ab-f8a4-429c-abb6-27f0884f70b8',
      value: 'K3',
    },
    {
      id: '1f6670c9-7e0c-411a-8284-185d9a80bb06',
      value: 'K4',
    },
    {
      id: 'c9381886-36d7-4eaf-ab52-f0c9785f7536',
      value: 'K5.1',
    },
    {
      id: '93732fc6-0d28-43c9-b384-2a3f705a1248',
      value: 'K5.2',
    },
    {
      id: '706e3533-945b-4e1a-9493-ac89142b9bb7',
      value: 'K5.3',
    },
    {
      id: 'c8d3b985-c5fc-41ba-9d1c-7308e7564845',
      value: 'K5.4',
    },
    {
      id: '25efdebb-c57e-46a9-abd8-5387861bddef',
      value: 'K5.5',
    },
  ],
};

export const mockPriorities: { data: Array<IListItem> } = {
  data: [
    { id: 'priority-high', value: 'high' },
    { id: 'priority-medium', value: 'medium' },
    { id: 'priority-low', value: 'low' },
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

export const mockResponsibleZones: { data: Array<IListItem> } = {
  data: [
    {
      id: 'effee0b7-f93b-496d-93b2-444f5f7ef8bf',
      value: 'east',
    },
    {
      id: '5b5e316b-c6f5-434c-bc75-e17166b6297d',
      value: 'west',
    },
    {
      id: 'c87c5738-af53-4c01-8aa1-edf2019c290a',
      value: 'north',
    },
  ],
};

export const mockResponsiblePersons: { data: Array<IListItem> } = {
  data: [
    {
      value: 'Meikäläinen Matti',
      id: 'd53239df-b105-4ef0-9b20-a6f5a0281f7b',
    },
    {
      value: 'Kimari Matti',
      id: '63e71910-07de-4ba3-814f-f54315432d97',
    },
    {
      value: 'Nn Matti',
      id: 'c60f6c51-8ccd-4414-ad00-b10e3e624fed',
    },
    {
      value: 'Kaalikoski Matti',
      id: '92521a1d-b1b4-41c6-be4b-11d526112d15',
    },
  ],
};

export const mockBudgetOverrunReasons: { data: Array<IListItem> } = {
  data: [
    {
      id: '14cb7de8-233c-415f-9b46-235d3d7989d5',
      value: 'permitProcessingDelay',
    },
    {
      id: 'f777fed1-e6b3-4222-a42c-e67fbb6d5277',
      value: 'complaintsDelay',
    },
    {
      id: 'dc33a8e5-40fb-4660-884c-38f0423fb898',
      value: 'otherReason',
    },
    {
      id: 'f5ae80e1-0eb4-421d-af5d-02068062dab8',
      value: 'earlierSchedule',
    },
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      value: 'annualCostDistributionClarification',
    },
    {
      id: 'b2c3d4e5-f6g7-8901-2345-678901bcdefg',
      value: 'planningCostsOrScheduleClarification',
    },
  ],
};

export const mockProgrammers: { data: Array<IListItem> } = {
  data: [
    {
      id: 'john-smith',
      value: 'John Smith',
    },
    {
      id: 'jane-doe',
      value: 'Jane Doe',
    },
  ],
};
