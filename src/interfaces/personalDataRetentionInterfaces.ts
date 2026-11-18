export interface IPersonalDataSummary {
  projectPersons: number;
  programmers: number;
  handovers: number;
  taskPersons: number;
  programmeNames: number;
}

export interface IPersonalDataRetentionProject {
  projectId: string;
  projectName: string;
  warrantyPhaseEnd: string;
  retentionDueDate: string;
  personalData: IPersonalDataSummary;
}

export interface IPersonalDataRetentionConfirmResponse {
  projectId: string;
  removed: IPersonalDataSummary;
  anonymizedPersons: number;
}
