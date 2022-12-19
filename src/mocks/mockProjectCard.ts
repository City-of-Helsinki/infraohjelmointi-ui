import { IProjectCard } from '@/interfaces/projectCardInterfaces';

const mockProjectCard: { data: IProjectCard } = {
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
    description: 'Hakaniementori description',
    programmed: true,
    constructionPhaseDetail: '',
    estPlanningStart: '01.12.2022',
    estPlanningEnd: '02.12.2022',
    estConstructionStart: '03.12.2022',
    estConstructionEnd: '04.12.2022',
    presenceStart: '05.12.2022',
    presenceEnd: '06.12.2022',
    visibilityStart: '07.12.2022',
    visibilityEnd: '08.12.2022',
    perfAmount: '300.00',
    unitCost: '400.00',
    costForecast: '500.00',
    neighborhood: 'Kamppi',
    comittedCost: '400.00',
    tiedCurrYear: '800.00',
    realizedCost: '5000.00',
    spentCost: '5000.00',
    riskAssess: '50',
    locked: false,
    comments: '',
    delays: '',
    hashTags: ['pyöräily', 'uudisrakentaminen'],
    favPersons: ['9d6a0854-a784-44b0-ad35-ca5e8b8f0e90'],
  },
};

export default mockProjectCard;
