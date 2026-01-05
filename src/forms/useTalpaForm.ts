import { useForm } from 'react-hook-form';
import moment from 'moment';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';
import {
  ITalpaAssetClass,
  ITalpaProjectRange,
  ITalpaProjectType,
  ITalpaServiceClass,
  TalpaReadiness,
} from '@/interfaces/talpaInterfaces';
import { BudgetItemNumber } from '@/components/Project/ProjectTalpa/budgetItemNumber';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import { selectPlanningClasses, selectPlanningSubClasses } from '@/reducers/classSlice';
import { useEffect } from 'react';
import { infraInvestmentTemplateProject } from '@/components/Project/ProjectTalpa/templateProjectOptions';
import { InvestmentProfile } from '@/components/Project/ProjectTalpa/investmentProfile';
import { getTalpaProjectOpeningByProjectThunk, selectTalpaProject } from '@/reducers/talpaSlice';
import { addYears } from '@/utils/dates';
import { IProject } from '@/interfaces/projectInterfaces';
import { TalpaProfileName } from '@/components/Project/ProjectTalpa/profileName';
import { selectResponsiblePersonsRaw } from '@/reducers/listsSlice';
import { usePostalCode } from '@/hooks/usePostalCode';

const formatDateToHds = (date?: string | null) => {
  if (!date) {
    return null;
  }

  const parsed = moment(date, ['YYYY-MM-DD', 'DD.MM.YYYY'], true);
  if (parsed.isValid()) {
    return parsed.format('DD.MM.YYYY');
  }

  const fallback = moment(date);
  return fallback.isValid() ? fallback.format('DD.MM.YYYY') : null;
};

const buildProjectRangeOption = (
  projectRange: ITalpaProjectRange,
): IProjectTalpaForm['projectNumberRange'] => ({
  label:
    projectRange.projectTypePrefix === BudgetItemNumber.InfraInvestment
      ? `${projectRange.majorDistrictName} / ${projectRange.rangeStart} - ${projectRange.rangeEnd}`
      : `${projectRange.unit} / ${projectRange.rangeStart} - ${projectRange.rangeEnd}`,
  value: projectRange.id,
});

const buildProjectTypeOption = (
  projectType: ITalpaProjectType,
): IProjectTalpaForm['projectType'] => ({
  label: projectType.name,
  value: projectType.id,
});

const buildPriorityOption = (projectType: ITalpaProjectType): IProjectTalpaForm['priority'] => ({
  label: `${projectType.priority} / ${projectType.description}`,
  value: projectType.id,
});

const buildServiceClassOption = (
  serviceClass: ITalpaServiceClass,
): NonNullable<IProjectTalpaForm['serviceClass']> => ({
  label: `${serviceClass.code} ${serviceClass.name}`,
  value: serviceClass.id,
});

const buildAssetClassOption = (assetClass: ITalpaAssetClass): IProjectTalpaForm['assetClass'] => ({
  label: `${assetClass.name} / ${assetClass.componentClass}`,
  value: assetClass.id,
});

const buildTempateProjectOption = (
  templateProject: string,
): IProjectTalpaForm['templateProject'] => ({
  label: templateProject,
  value: templateProject,
});

const buildReadinessOption = (readiness: string): IProjectTalpaForm['readiness'] => ({
  label: readiness,
  value: readiness,
});

function useResponsiblePerson(project: IProject | null): {
  responsiblePersonName: string;
  responsiblePersonEmail: string;
} {
  const allPersons = useAppSelector(selectResponsiblePersonsRaw);
  const responsiblePerson = allPersons.find((person) => {
    return person.id === project?.personProgramming?.person;
  });

  const responsiblePersonName = responsiblePerson
    ? `${responsiblePerson.firstName} ${responsiblePerson.lastName}`
    : '';
  const responsiblePersonEmail = responsiblePerson ? responsiblePerson.email : '';

  return { responsiblePersonName, responsiblePersonEmail };
}

const useTalpaProjectOpeningToFormValues = (): IProjectTalpaForm => {
  const project = useAppSelector(selectProject);
  const talpaProject = useAppSelector(selectTalpaProject);
  const classes = useAppSelector(selectPlanningClasses);
  const subClasses = useAppSelector(selectPlanningSubClasses);
  const { responsiblePersonName, responsiblePersonEmail } = useResponsiblePerson(project);
  const { postalCode } = usePostalCode(project?.address || '');

  // If no Talpa project opening exists, return default values
  if (!talpaProject) {
    const selectedSubClass = project
      ? subClasses.find(({ id }) => id === project.projectClass)
      : undefined;

    const projectClassId = selectedSubClass?.parent ?? project?.projectClass;

    const selectedClass = projectClassId
      ? classes.find(({ id }) => id === projectClassId)
      : undefined;

    return {
      budgetItemNumber: BudgetItemNumber.InfraInvestment,
      budgetAccount: selectedClass ? selectedClass.name : '',
      templateProject: infraInvestmentTemplateProject,
      projectStart: project?.estPlanningStart ?? null,
      projectEnd: addYears(project?.estWarrantyPhaseEnd ?? project?.estConstructionEnd, 6),
      investmentProfile: InvestmentProfile.InfraInvestment,
      projectNumberRange: null,
      projectType: null,
      priority: null,
      projectName: '',
      streetAddress: project?.address || '',
      postalCode: project?.postalCode ?? postalCode,
      responsiblePerson: responsiblePersonName,
      responsiblePersonEmail,
      serviceClass: null,
      assetClass: null,
      profileName: TalpaProfileName.FixedStructures,
      holdingTime: null,
      readiness: buildReadinessOption(TalpaReadiness.Kesken),
    };
  }

  const holdingTime = Number.parseInt(talpaProject.holdingTime, 10);
  const formattedHoldingTime = Number.isNaN(holdingTime) ? null : holdingTime;
  const budgetItemNumber = talpaProject.projectNumberRange?.projectTypePrefix;
  const templateProject =
    budgetItemNumber === BudgetItemNumber.InfraInvestment
      ? talpaProject.templateProject
      : buildTempateProjectOption(talpaProject.templateProject);

  return {
    id: talpaProject.id,
    ...(budgetItemNumber && {
      budgetItemNumber,
    }),
    budgetAccount: talpaProject.budgetAccount,
    projectNumberRange: buildProjectRangeOption(talpaProject.projectNumberRange),
    templateProject: templateProject,
    projectType: buildProjectTypeOption(talpaProject.projectType),
    priority: buildPriorityOption(talpaProject.projectType),
    projectName: talpaProject.projectName,
    projectStart: formatDateToHds(talpaProject.projectStartDate),
    projectEnd: formatDateToHds(talpaProject.projectEndDate),
    streetAddress: talpaProject.streetAddress,
    postalCode: talpaProject.postalCode,
    responsiblePerson: talpaProject.responsiblePerson,
    responsiblePersonEmail: talpaProject.responsiblePersonEmail,
    serviceClass: talpaProject.serviceClass
      ? buildServiceClassOption(talpaProject.serviceClass)
      : null,
    assetClass: talpaProject.assetClass ? buildAssetClassOption(talpaProject.assetClass) : null,
    profileName: talpaProject.profileName,
    holdingTime: formattedHoldingTime,
    investmentProfile: talpaProject.investmentProfile,
    readiness: buildReadinessOption(talpaProject.readiness),
    isLocked: talpaProject.isLocked,
  };
};

export default function useTalpaForm() {
  const project = useAppSelector(selectProject);
  const dispatch = useAppDispatch();

  const formValues = useTalpaProjectOpeningToFormValues();

  const formMethods = useForm<IProjectTalpaForm>({
    values: formValues,
    disabled: formValues.isLocked,
  });

  const { watch, setValue } = formMethods;

  useEffect(() => {
    if (project) {
      dispatch(getTalpaProjectOpeningByProjectThunk(project.id));
    }
  }, [dispatch, project]);

  const address = watch('streetAddress');
  const postalCode = usePostalCode(address || '');
  useEffect(() => {
    if (postalCode) {
      setValue('postalCode', postalCode);
    }
  }, [postalCode, setValue]);

  return formMethods;
}
