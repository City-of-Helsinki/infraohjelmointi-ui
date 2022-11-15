/**
 * Not all of these were 100% clear in the Jira description, some might change as we go
 */
export interface IProjectCard {
  hkrProjectId: string;
  projectType: ProjectType;
  target: string;
  streetOrParkName: string;
  projectArea: string;
  projectEntityName: string;
  projectDescription: string;
  responsiblePerson: IResponsiblePerson;
  responsiblePersonForConstruction: string; // maybe IResponsiblePerson?
  otherResponsiblePersons: string; // maybe Array<IResponsiblePerson>?
  projectStatus: string; // says "menu" in the task description
  programmed: boolean;
  constructionPhaseSpecification: string; // says "menu" in the task description
  estimatedStreetOrParkPlanningYear: string; // says "menu" in the task description
  estimatedStreetOrParkCompletionYear: string; // says "menu" in the task description
  streetOrParkPlanStart: string;
  streetOrParkPlanEnd: string;
  streetOrParkConstructionStart: string;
  streetOrParkConstructionEnd: string;
  presenceStart: string;
  presenceEnd: string;
  visibilityStart: string;
  visibilityEnd: string;
  toLouhi: boolean;
  projectLocation: string; // not sure if dropdown / free-text or coordinates
  category: CategoryType;
  gravelStreet: boolean;
  workQuantity: string;
  unitCostForecast: string;
  costForecast: string;
  sapProjectNumber: Array<string>;
  sapNetworkNumber: Array<string>;
  realizedAndCommitedCosts: string;
  nameOfPlanner: string; // says "menu" (maybe IResponsiblePerson)
  quantity: string; //Cost estimate, and what phase the estimate is from.
  qualityLevel: string; //Cost estimate, and what phase the estimate is from.
  unitPrice: string; //Cost estimate, and what phase the estimate is from.
  hashtagIdentifiers: string;
  textDescription: string;
  notes: Array<string>;
  // Some things under HANKEKORTILLA TAPAHTUVAT ASIAT: (THINGS ON THE PROJECT CARD) are too unclear
}

// The enum values should be included in the i18n files,
// so that we can get the value like = t(`projectType.${ProjectType.ProjectComplex}`)
export enum ProjectType {
  ProjectComplex = 'Hankekokonaisuus',
  Street = 'Katu',
  Traffic = 'Liikenne',
  Sports = 'Liikunta',
  Omastadi = 'Omastadi',
  ProjectArea = 'Projektialue',
  Park = 'Puisto tai taitorakenne',
}

export enum CategoryType {
  MainCategory = 'Pääluokka',
  Category = 'Luokka',
  SubCategory = 'Alaluokka',
}

export interface IResponsiblePerson {
  name: string;
  title: string;
  phone: string;
  email: string;
}
