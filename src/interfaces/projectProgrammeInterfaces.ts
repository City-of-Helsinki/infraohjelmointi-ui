export interface IProjectProgramme {
  id: string;
  status?: 'DRAFT' | 'COMPLETE';
  briefProjectProgramme?: boolean;
  basicInfo?: IProjectProgrammeBasicInfo | null;
}

export interface IProjectProgrammeBasicInfo {
  projectName?: string | null;
  district?: string | { name?: string | null } | null;
}
