import {
  IProjectCard,
  ProjectPhase,
  ProjectPriority,
  ProjectType,
} from '@/interfaces/projectCardInterfaces';

const mockProjectCard: { data: IProjectCard } = {
  data: {
    id: '79e6bc78-9fa2-49a1-aaad-b50030da170e',
    projectReadiness: 95,
    type: ProjectType.Street,
    priority: ProjectPriority.Medium,
    phase: ProjectPhase.DraftInitiation,
    hkrId: '2580',
    entityName: 'Entity Name',
    sapProject: 'c0f2c791-e20f-45fe-afce-a9ba434f046e',
    sapNetwork: '17b75067-42b6-42b9-b21a-7873093f84d0',
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
};

export default mockProjectCard;
