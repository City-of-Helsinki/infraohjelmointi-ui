import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';

export interface IProjectProgrammeLinkFormItem {
  value: string;
}

export interface IProjectProgrammeBasicInfoForm {
  projectName: string;
  district: string;
  projectProgrammeCompiler: string;
  personsInvolved: string;
  estimatedCosts: string;
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

export interface IProjectProgrammeForm {
  basicInfo: IProjectProgrammeBasicInfoForm;
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

function hasItems<T>(items?: T[] | null): items is T[] {
  return (items?.length ?? 0) > 0;
}

function getLinksValue(
  links?: IProjectProgrammeBasicInfo['links'],
): IProjectProgrammeLinkFormItem[] {
  if (!hasItems(links)) {
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

  if (hasItems(normalizedLinks)) {
    return normalizedLinks;
  }

  return [{ value: '' }];
}

export default function useProjectProgrammeForm(basicInfo: IProjectProgrammeBasicInfo | null) {
  const formMethods = useForm<IProjectProgrammeForm>({
    defaultValues: {
      basicInfo: {
        projectName: '',
        district: '',
        projectProgrammeCompiler: '',
        personsInvolved: '',
        estimatedCosts: '',
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
    },
    mode: 'onBlur',
  });

  const { reset } = formMethods;

  useEffect(() => {
    reset({
      basicInfo: {
        projectName: getTextValue(basicInfo?.projectName),
        district: getDistrictValue(basicInfo?.district),
        projectProgrammeCompiler: getTextValue(basicInfo?.projectProgrammeCompiler),
        personsInvolved: getTextValue(basicInfo?.personsInvolved),
        estimatedCosts: getTextValue(basicInfo?.estimatedCosts),
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
      },
    });
  }, [basicInfo, reset]);

  return formMethods;
}
