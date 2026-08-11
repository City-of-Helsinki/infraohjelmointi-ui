import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';

export interface IProjectProgrammeLinkFormItem {
  value: string;
}

export interface IProjectProgrammeForm {
  projectName: string;
  district: string;
  projectProgrammeCompiler: string;
  personsInvolved: string;
  inspector: string;
  summary: string;
  strategyGoals: string;
  costClass: string;
  projectSize: string;
  risks: string;
  studyAndPlanningNeeds: string;
  planningAndImplementationFeasibility: string;
  specialConsiderations: string;
  otherConsiderations: string;
  links: IProjectProgrammeLinkFormItem[];
}

function getDistrictValue(district: IProjectProgrammeBasicInfo['district']): string {
  if (!district) {
    return '';
  }

  if (typeof district === 'string') {
    return district;
  }

  return district.name ?? '';
}

function getTextValue(value?: string | null): string {
  return value ?? '';
}

function getLinksValue(
  links?: IProjectProgrammeBasicInfo['links'],
): IProjectProgrammeLinkFormItem[] {
  if (!links || !links.length) {
    return [{ value: '' }];
  }

  const normalizedLinks = links
    .map((link) => {
      if (typeof link === 'string') {
        return { value: getTextValue(link) };
      }

      return { value: getTextValue(link?.value) };
    })
    .filter((link) => link.value !== '');

  return normalizedLinks.length ? normalizedLinks : [{ value: '' }];
}

export default function useProjectProgrammeForm(basicInfo: IProjectProgrammeBasicInfo | null) {
  const formMethods = useForm<IProjectProgrammeForm>({
    defaultValues: {
      projectName: '',
      district: '',
      projectProgrammeCompiler: '',
      personsInvolved: '',
      inspector: '',
      summary: '',
      strategyGoals: '',
      costClass: '',
      projectSize: '',
      risks: '',
      studyAndPlanningNeeds: '',
      planningAndImplementationFeasibility: '',
      specialConsiderations: '',
      otherConsiderations: '',
      links: [{ value: '' }],
    },
    mode: 'onBlur',
  });

  const { reset } = formMethods;

  useEffect(() => {
    reset({
      projectName: getTextValue(basicInfo?.projectName),
      district: getDistrictValue(basicInfo?.district),
      projectProgrammeCompiler: getTextValue(basicInfo?.projectProgrammeCompiler),
      personsInvolved: getTextValue(basicInfo?.personsInvolved),
      inspector: getTextValue(basicInfo?.inspector),
      summary: getTextValue(basicInfo?.summary),
      strategyGoals: getTextValue(basicInfo?.strategyGoals),
      costClass: getTextValue(basicInfo?.costClass),
      projectSize: getTextValue(basicInfo?.projectSize),
      risks: getTextValue(basicInfo?.risks),
      studyAndPlanningNeeds: getTextValue(basicInfo?.studyAndPlanningNeeds),
      planningAndImplementationFeasibility: getTextValue(
        basicInfo?.planningAndImplementationFeasibility,
      ),
      specialConsiderations: getTextValue(basicInfo?.specialConsiderations),
      otherConsiderations: getTextValue(basicInfo?.otherConsiderations),
      links: getLinksValue(basicInfo?.links),
    });
  }, [basicInfo, reset]);

  return formMethods;
}
