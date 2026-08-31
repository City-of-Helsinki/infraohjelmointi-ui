import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type {
  IProjectProgrammeBasicInfo,
  IProjectProgrammeForm,
  IProjectProgrammeLinkFormItem,
  IProjectProgrammeDesignCriteria,
} from '@/interfaces/projectProgrammeInterfaces';

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
  links?: IProjectProgrammeBasicInfo['links'] | IProjectProgrammeDesignCriteria['links'],
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

export default function useProjectProgrammeForm(formData: IProjectProgrammeForm | null) {
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
        projectName: getTextValue(formData?.basicInfo?.projectName),
        district: getDistrictValue(formData?.basicInfo?.district),
        projectProgrammeCompiler: getTextValue(formData?.basicInfo?.projectProgrammeCompiler),
        personsInvolved: getTextValue(formData?.basicInfo?.personsInvolved),
        estimatedCosts: getTextValue(formData?.basicInfo?.estimatedCosts),
        inspector: getTextValue(formData?.basicInfo?.inspector),
        summary: getTextValue(formData?.basicInfo?.summary),
        strategyGoals: getTextValue(formData?.basicInfo?.strategyGoals),
        costClass: getTextValue(formData?.basicInfo?.costClass),
        projectSize: getTextValue(formData?.basicInfo?.projectSize),
        risks: getTextValue(formData?.basicInfo?.risks),
        studyAndPlanningNeeds: getTextValue(formData?.basicInfo?.studyAndPlanningNeeds),
        planningAndImplementationFeasibility: getTextValue(
          formData?.basicInfo?.planningAndImplementationFeasibility,
        ),
        specialConsiderations: getTextValue(formData?.basicInfo?.specialConsiderations),
        otherConsiderations: getTextValue(formData?.basicInfo?.otherConsiderations),
        links: getLinksValue(formData?.basicInfo?.links),
      },
    });
  }, [formData, reset]);

  return formMethods;
}
