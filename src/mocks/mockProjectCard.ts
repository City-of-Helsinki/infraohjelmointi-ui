import {
  IProjectCard,
  ProjectPhase,
  ProjectPriority,
  ProjectType,
} from '@/interfaces/projectCardInterfaces';

const mockProjectCard: { data: IProjectCard } = {
  data: {
    id: '79786137-d73e-471b-a7a0-c366967b7158',
    projectReadiness: 74,
    hkrId: '101591cb-46df-43a6-8ca4-a4a70bcae92f',
    sapProject: 'c0f2c791-e20f-45fe-afce-a9ba434f046e',
    sapNetwork: '17b75067-42b6-42b9-b21a-7873093f84d0',
    type: ProjectType.ProjectComplex,
    name: 'Hakaniementori',
    description: 'Hakanimentori should be built.',
    phase: ProjectPhase.Proposal,
    programmed: true,
    constructionPhaseDetail: 'Phase details.',
    estPlanningStartYear: '2022',
    estDesignEndYear: '2023',
    estDesignStartDate: '2022-11-18',
    estDesignEndDate: '2022-11-30',
    contractPrepStartDate: '2022-11-04',
    contractPrepEndDate: '2022-11-30',
    warrantyStartDate: '2022-11-05',
    warrantyExpireDate: '2022-11-30',
    perfAmount: '500.00',
    unitCost: '400.00',
    costForecast: '500.00',
    neighborhood: 'Kamppi',
    comittedCost: '300.00',
    tiedCurrYear: '200.00',
    realizedCost: '5000.00',
    spentCost: '5000.00',
    riskAssess: 'This is risky...',
    priority: ProjectPriority.Medium,
    locked: false,
    comments: '',
    delays: '',
    createdDate: '2022-11-18T10:24:51.731956+02:00',
    updatedDate: '2022-11-18T10:24:51.731985+02:00',
    siteId: null,
    projectSet: null,
    area: null,
    personPlanning: null,
    personProgramming: null,
    personConstruction: null,
    favPersons: ['eb6b0ddd-207f-41b8-8a10-29c2e5372829'],
  },
};

export default mockProjectCard;
