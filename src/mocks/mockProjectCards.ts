import { IProjectCard } from '@/interfaces/projectCardInterfaces';

const mockProjectCards: { data: Array<IProjectCard> } = {
  data: [
    {
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
      hkrId: '2580',
      entityName: 'Entity Name',
      sapNetwork: ['17b75067-42b6-42b9-b21a-7873093f84d0'],
      name: 'Hakaniementori',
      description: 'Hakaniemen torilla tavataan.',
      programmed: true,
      constructionPhaseDetail: '',
      estPlanningStartYear: '2023',
      estDesignEndYear: '2030',
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
      favPersons: ['9d6a0854-a784-44b0-ad35-ca5e8b8f0e90'],
    },
  ],
};

export default mockProjectCards;
