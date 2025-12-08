export enum TalpaStatus {
  excel_generated = 'excel_generated',
  sent_to_talpa = 'sent_to_talpa',
  project_number_opened = 'project_number_opened',
}

export enum TalpaSubject {
  Uusi = 'Uusi',
  Muutos = 'Muutos',
  Lukitus = 'Lukitus',
}

export enum TalpaReadiness {
  Kesken = 'Kesken',
  Valmis = 'Valmis',
}

export enum TalpaPriority {
  Normaali = 'Normaali',
  Korkea = 'Korkea',
}

export interface ITalpaProjectRange {
  id: string;
  projectTypePrefix: string;
  budgetAccount: string;
  budgetAccountNumber: string;
  rangeStart: string;
  rangeEnd: string;
  majorDistrict: string;
  majorDistrictName: string;
  area: string;
  unit: string;
  contactPerson: string;
  contactEmail: string;
  transferNote: string;
  notes: string;
  isActive: boolean;
  updatedDate: string;
}

export interface ITalpaProjectType {
  id: string;
  code: string;
  name: string;
  category: string;
  priority: string | null;
  description: string;
  isActive: boolean;
  notes: string;
}

export interface ITalpaServiceClass {
  id: string;
  code: string;
  name: string;
  description: string;
  projectTypePrefix: string;
  isActive: boolean;
}

export interface ITalpaAssetClass {
  id: string;
  componentClass: string;
  account: string;
  name: string;
  hasHoldingPeriod: boolean;
  holdingPeriodYears: number | null;
  category: string;
  isActive: boolean;
}

export interface ITalpaProjectOpening {
  id: string;
  isLocked: boolean;
  status: TalpaStatus;
  subject: TalpaSubject;
  budgetAccount: string;
  projectNumberRange: ITalpaProjectRange;
  templateProject: string;
  projectType: ITalpaProjectType;
  priority: string;
  projectName: string;
  projectStartDate: string | null;
  projectEndDate: string | null;
  streetAddress: string;
  postalCode: string;
  responsiblePerson: string;
  responsiblePersonEmail: string;
  serviceClass: ITalpaServiceClass | null;
  assetClass: ITalpaAssetClass | null;
  profileName: string;
  holdingTime: string;
  investmentProfile: string;
  readiness: TalpaReadiness;
  project: string;
}

export interface ITalpaProjectOpeningRequest
  extends Omit<
    ITalpaProjectOpening,
    | 'id'
    | 'status'
    | 'isLocked'
    | 'projectNumberRange'
    | 'projectType'
    | 'serviceClass'
    | 'assetClass'
  > {
  projectNumberRangeId: string;
  projectTypeId: string;
  serviceClassId: string;
  assetClassId: string;
}

export interface ITalpaProjectPostRequestObject {
  data: ITalpaProjectOpeningRequest;
}

export interface ITalpaProjectPatchRequestObject {
  id: string;
  data: ITalpaProjectOpeningRequest;
}
