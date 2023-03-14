import { IProject } from '@/interfaces/projectInterfaces';

const mockProject: { data: IProject } = {
  data: {
    id: '79e6bc78-9fa2-49a1-aaad-b50030da170e',
    projectReadiness: 95,
    sapProject: '123',
    type: {
      id: 'cc37d0d2-2a8e-4368-b548-18de6d2a967b',
      value: 'street',
    },
    priority: {
      id: 'f55fb6ec-5c96-47d2-bc6b-8499eaf7e544',
      value: 'medium',
    },
    phase: {
      id: '81a46b1c-8b7d-4a32-b1fb-437624d8f618',
      value: 'draftInitiation',
    },
    area: {
      id: '801c8b0e-92e0-4688-b253-a88b4d93b17a',
      value: 'honkasuo',
    },
    hkrId: '2580',
    entityName: 'Hakaniementori entity name',
    sapNetwork: ['17b75067-42b6-42b9-b21a-7873093f84d0'],
    name: 'Hakaniementori',
    address: 'Address 1B 12',
    description: 'Hakaniementori description',
    programmed: true,
    estPlanningStart: '01.12.2022',
    estPlanningEnd: '02.12.2022',
    estConstructionStart: '03.12.2022',
    estConstructionEnd: '04.12.2022',
    presenceStart: '05.12.2022',
    presenceEnd: '06.12.2022',
    visibilityStart: '07.12.2022',
    visibilityEnd: '08.12.2022',
    projectWorkQuantity: '120',
    projectCostForecast: '300',
    projectQualityLevel: {
      id: 'f5f4b721-1a64-4773-b332-0d5681a97fcc',
      value: '1class',
    },
    planningCostForecast: '240',
    planningPhase: {
      id: 'ead11d27-93a4-4331-afa9-51735aa9b571',
      value: 'projectPlanning',
    },
    planningWorkQuantity: '360',
    constructionCostForecast: '465',
    constructionPhase: {
      id: 'a674d7aa-2bdf-429d-bcf7-9156eed81c40',
      value: 'planning',
    },
    constructionWorkQuantity: '909',
    budget: '0.00',
    comittedCost: '400.00',
    realizedCost: '5000.00',
    spentCost: '4600.00',
    perfAmount: '300.00',
    unitCost: '400.00',
    costForecast: '500.00',
    budgetOverrunYear: '2053',
    budgetOverrunAmount: '468.00',
    neighborhood: 'Kamppi',
    tiedCurrYear: '800.00',
    riskAssess: '50',
    constructionPhaseDetail: { id: '3f72b5bd-4a32-4db9-b8bf-399c1de574cd', value: 'firstPhase' },
    riskAssessment: {
      id: '8fd009ef-ab34-492e-889c-9062a2b3fce8',
      value: 'Placeholder risk',
    },
    category: {
      id: '05b71287-bfab-4616-bdb5-94171722756b',
      value: 'K1',
    },
    locked: false,
    comments: '',
    delays: '',
    hashTags: [
      'ccf89105-ee58-49f1-be0a-2cffca8711ab',
      '50fe7a50-fe4d-4fe2-97b2-44d34a4ce8b4',
      '6b7d979e-212b-45a5-a557-b7522ea19f53',
      '31aec05c-1aa1-42c2-8284-7481b9d77dd0',
      '00f5ab13-011f-4742-b74a-a47bbeef3708',
      '706cc4bc-97ca-4d27-b494-44257efd7e46',
      '9d6d4ccb-db3d-4335-8bf6-6d542ebf3eba',
      'b8f172d3-a92f-4c51-b3f9-58f5e1a48b75',
    ],
    favPersons: ['9d6a0854-a784-44b0-ad35-ca5e8b8f0e90'],

    louhi: false,
    gravel: false,
    effectHousing: false,
    constructionEndYear: '2056',
    planningStartYear: '2089',
    personPlanning: {
      id: 'afc609b0-9e7b-49c8-8e01-a940d720667b',
      firstName: 'E',
      lastName: 'Sihvonen',
      email: 'placeholder@blank.com',
      title: 'Not Assigned',
      phone: '000000',
    },
    personProgramming: {
      id: '3f4cc542-64aa-4e1a-9a2e-1d3f0a9251ca',
      firstName: 'Joonas',
      lastName: 'Hakkila',
      email: 'placeholder@blank.com',
      title: 'Not Assigned',
      phone: '000000',
    },
    personConstruction: {
      id: '7460ec24-4650-47fc-b52f-0f55ae2b7ac3',
      firstName: 'Matti',
      lastName: 'Tarkkala',
      email: 'placeholder@blank.com',
      title: 'Not Assigned',
      phone: '000000',
    },
    budgetProposalCurrentYearPlus0: '0.00',
    budgetProposalCurrentYearPlus1: '0.00',
    budgetProposalCurrentYearPlus2: '0.00',
    preliminaryCurrentYearPlus3: '0.00',
    preliminaryCurrentYearPlus4: '0.00',
    preliminaryCurrentYearPlus5: '0.00',
    preliminaryCurrentYearPlus6: '0.00',
    preliminaryCurrentYearPlus7: '0.00',
    preliminaryCurrentYearPlus8: '0.00',
    preliminaryCurrentYearPlus9: '0.00',
    preliminaryCurrentYearPlus10: '0.00',
  },
};

export default mockProject;
